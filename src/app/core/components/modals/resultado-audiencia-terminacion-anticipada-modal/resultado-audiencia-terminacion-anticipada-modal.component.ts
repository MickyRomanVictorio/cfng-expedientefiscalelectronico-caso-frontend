import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { validateMessageService } from '@core/services/provincial/tramites/validateMessage.service';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { Subscription } from 'rxjs';
import { FundadoProcedenteComponent } from './fundado-procedente/fundado-procedente.component';
import { InfundadoProcedenteComponent } from "./infundado-procedente/infundado-procedente.component";

@Component({
  selector: 'app-resultado-audiencia-terminacion-anticipada-modal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TabViewModule,
    TabMenuModule,
    FundadoProcedenteComponent,
    InfundadoProcedenteComponent
  ],
  templateUrl: './resultado-audiencia-terminacion-anticipada-modal.component.html',
  styleUrl: './resultado-audiencia-terminacion-anticipada-modal.component.scss'
})
export class ResultadoAudienciaTerminacionAnticipadaModalComponent implements OnInit, OnDestroy {
  public titulo!: string;
  public tipo!: number;
  public data!: any;
  public modoLectura!: boolean;

  private validacion: boolean = false; 
  private subscription!: Subscription; 

  constructor(
    private dialogRef: DynamicDialogRef,
    private validateMessageService: validateMessageService,
    public config: DynamicDialogConfig,
  ) {
  }
  ngOnInit(): void {
    this.titulo = this.config.data?.titulo;
    this.tipo = this.config.data?.tipo;
    this.data = this.config.data?.data;
    this.modoLectura = this.config.data?.data.modoLectura;

    if (this.tipo === 1 || this.tipo === 2 || this.tipo === 3) {
      this.subscription = this.validateMessageService.validacion$.subscribe((valor) => {
        this.validacion = valor; 
      });
    }

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

  }

  close() {
    this.dialogRef.close();
  }

}
