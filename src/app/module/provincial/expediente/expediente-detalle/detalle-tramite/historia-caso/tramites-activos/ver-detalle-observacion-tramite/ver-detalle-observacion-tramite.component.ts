import { Component, inject } from '@angular/core';
import { EncabezadoModalComponent } from '@core/components/modals/encabezado-modal/encabezado-modal.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DateUtil } from 'ngx-cfng-core-lib';

@Component({
  selector: 'app-ver-detalle-observacion-tramite',
  standalone: true,
  imports: [
    EncabezadoModalComponent,
  ],
  templateUrl: './ver-detalle-observacion-tramite.component.html',
  styleUrl: './ver-detalle-observacion-tramite.component.scss'
})
export class VerDetalleObservacionTramiteComponent {

  protected titulo: string = ''
  protected numeroCaso: string = ''
  protected etiquetaDetalle: string = ''
  protected detalle: string = ''
  protected etiquetaFecha: string = ''
  protected fecha: string = ''
  protected usuario: string = ''

  private configuracion = inject(DynamicDialogConfig)
  protected referenciaModal = inject(DynamicDialogRef)
  protected dateUtil = inject(DateUtil)

  constructor(){
    this.titulo = this.configuracion.data.titulo
    this.numeroCaso = this.configuracion.data.numeroCaso
    this.detalle = this.configuracion.data.detalle
    this.fecha = this.configuracion.data.fecha
    this.usuario = this.configuracion.data.usuario
    this.etiquetaDetalle = this.configuracion.data.etiquetaDetalle
    this.etiquetaFecha = this.configuracion.data.etiquetaFecha
  }

}