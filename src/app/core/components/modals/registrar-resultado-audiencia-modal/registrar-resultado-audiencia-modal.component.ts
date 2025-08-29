import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { FundadaProcedenteComponent } from './fundada-procedente/fundada-procedente.component';
import { FundadaProcedenteTerminacionAnticipadaComponent } from './fundada-procedente-terminacion-anticipada/fundada-procedente-terminacion-anticipada.component';
import { FundadaProcedenteTerminacionDesaprobadaComponent } from './fundada-procedente-terminacion-desaprobada/fundada-procedente-terminacion-desaprobada.component';
import { InfundadaImprocedenteComponent } from './infundada-improcedente/infundada-improcedente.component';
import { Subscription } from 'rxjs';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { validateMessageService } from '@core/services/provincial/tramites/validateMessage.service';


@Component({
  selector: 'app-registrar-resultado-audiencia-modal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TabViewModule,
    TabMenuModule,
    FundadaProcedenteComponent,
    FundadaProcedenteTerminacionAnticipadaComponent,
    FundadaProcedenteTerminacionDesaprobadaComponent,
    InfundadaImprocedenteComponent
  ],
  templateUrl: './registrar-resultado-audiencia-modal.html',
  styleUrl: './registrar-resultado-audiencia-modal.scss'
})
export class RegistrarResultadoAudienciaModalComponent implements OnInit, OnDestroy {
  public titulo!: string;
  public tipo!: number;
  public data!: any;

  private validacion: boolean = false;  // Valor para almacenar el estado de la validación
  private subscription!: Subscription;  // Variable para guardar la suscripción

  constructor(
    private dialogRef: DynamicDialogRef,
    private validateMessageService: validateMessageService,
    private modalDialogService: NgxCfngCoreModalDialogService,
    public config: DynamicDialogConfig,
  ) {
  }
  ngOnInit(): void {
    this.titulo = this.config.data?.titulo;
    this.tipo = this.config.data?.tipo;
    this.data = this.config.data?.data;

    //para el tipo 1 y 2
    if (this.tipo === 1 || this.tipo === 2 || this.tipo === 3 || this.tipo === 4) {
      // Nos suscribimos al Observable del servicio
      this.subscription = this.validateMessageService.validacion$.subscribe((valor) => {
        this.validacion = valor;  // Actualizamos el estado de validación cuando cambia el valor
      });
    }

  }

  ngOnDestroy() {
    if (this.tipo === 1 || this.tipo === 2 || this.tipo === 3 || this.tipo === 4) {
      // Desuscribirse para evitar memory leaks
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
  }

  close() {

    //para el tipo 1 y 2
    console.log(this.validacion);
    if ((this.tipo === 1 || this.tipo === 2 || this.tipo === 3 || this.tipo === 4) && this.validacion) {
      const cfeDialog = this.modalDialogService.warning(
        'Advertencia',
        'Aún no ha seleccionado una fiscalía superior a elevar, no podrá firmar el trámite',
        'Aceptar'
      );
      cfeDialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.dialogRef.close();
          }
        },
      });
    } else {
      this.dialogRef.close();
    }

  }

}
