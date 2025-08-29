import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {  MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { CmpLibModule } from 'dist/cmp-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { RegistrarReparacionCivilComponent } from '@core/components/reutilizable/registrar-reparacion-civil/registrar-reparacion-civil.component';
import { DatosReparacionCivilInput } from '@core/interfaces/reusables/reparacion-civil/datos-reparacion-civil-input';
import { REPARACION_CIVIL } from '@core/types/reutilizable/reparacion-civil.type';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CmpLibModule,
    RegistrarReparacionCivilComponent
  ],
  selector: 'app-acuerdo-reparatorio',
  templateUrl: './acuerdo-reparatorio.component.html',
  styleUrls: ['./acuerdo-reparatorio.component.scss'],
  providers: [MessageService, DialogService, NgxCfngCoreModalDialogService],
})
export class AcuerdoReparatorioComponent implements OnInit {
  public data!: DatosReparacionCivilInput;
  public titulo!: string;
  public idCaso!: string;
  public idActoTramiteCaso!: string;
  public numeroCaso!: string;
  public tipo!: string;
  public tipoAcuerdoText!: string;
  public modoLectura!:boolean;
  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    protected iconUtil: IconUtil,
  ) {
  }
  ngOnInit(): void {
    this.idCaso = this.config.data?.idCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.numeroCaso = this.config.data?.numeroCaso;
    this.tipo = this.config.data?.tipo;
    this.modoLectura=this.config.data?.modoLectura;
    this.tipoAcuerdoText = this.obtenerTipoAcuerdo();
    this.titulo = this.obtenerTitulo();
    this.data = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso
    }
  }
  obtenerTipoAcuerdo() {
    return this.tipo == REPARACION_CIVIL.ACUERDO_REPARATORIO ? "Acuerdo Reparatorio" : "Principio de Oportunidad"
  }
  obtenerTitulo(): string {
    const caso = this.numeroCaso.split('-');
    return `<div class="file-search-icon mt-1 mr-3"></div>ACUERDOS PARA EL ${this.tipoAcuerdoText.toUpperCase()} - Caso: ${caso[0]}-<span>${caso[1]}-${caso[2]}</span>-${caso[3]}`
  }
}
