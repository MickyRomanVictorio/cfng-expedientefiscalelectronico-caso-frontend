import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GenericResponse } from '@core/interfaces/comunes/GenericResponse';
import { DetalleVisado } from '@interfaces/reusables/detalle-visado/detalle-visado.interface';
import { ReusableDetalleVisadoService } from '@services/reusables/reusable-detalle-visado.service';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { IconUtil, DateFormatPipe } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import {
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-detalle-visado',
  templateUrl: './detalle-visado.component.html',
  imports: [
    DateFormatPipe,
    ButtonModule,
    CmpLibModule,
    TableModule,
    NgClass,
    NgxCfngCoreModalDialogModule
  ],
})
export class DetalleVisadoComponent implements OnInit {

  private readonly nombreTramite: string = '';
  private readonly subscriptions: Subscription[] = [];
  private readonly idBandejaActoTramite: string = '';
  protected detalleVisado: DetalleVisado[] = [];

  constructor(
    public referenciaModal: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly reusableDetalleVisadoService: ReusableDetalleVisadoService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    protected iconUtil: IconUtil
  ) {
    this.nombreTramite = this.config.data.nombreTramite;
    this.idBandejaActoTramite = this.config.data?.idBandejaActoTramite;
  }

  ngOnInit(): void {
    this.obtenerDetalleVisado();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected cerrarModal(): void {
    this.referenciaModal.close();
  }

  private obtenerDetalleVisado(): void {
    this.subscriptions.push(
      this.reusableDetalleVisadoService
        .verDetalleVisado( this.idBandejaActoTramite )
        .subscribe({
          next: (resp: DetalleVisado[]) => {
            this.detalleVisado = resp;
          },
          error: (error) => {
            this.modalDialogService.error('Error en el servicio', error.error.message, 'Aceptar');
          },
        })
    );
  }

  private cancelarInvitacionVisado(detalleVisado: DetalleVisado): void {
    this.subscriptions.push(
      this.reusableDetalleVisadoService
        .cancelarInvitacionVisado( detalleVisado.idBandejaActoTramite )
        .subscribe({
          next: (resp: GenericResponse) => {
            this.obtenerDetalleVisado();
            let mensaje: string = `Se canceló la invitación a: <strong> ${detalleVisado.nombreCargo}: ${detalleVisado.nombreUsuarioDestino} </strong>  para visar el trámite: <strong>${this.nombreTramite}</strong>`
            this.modalDialogService.success('INVITACIÓN CANCELADA', mensaje,'Aceptar');
          },
          error: (error) => {
            this.modalDialogService.error('NO SE PUEDE CANCELAR ESTA INVITACIÓN', error.error.message, 'Aceptar');
          },
        })
    );
  }

  protected confirmarCancelarInvitacion(detalleVisado: DetalleVisado): void {
    let mensaje: string = `¿Esta seguro de cancelar esta invitación de visado a: <br><strong> ${detalleVisado.nombreCargo}: ${detalleVisado.nombreUsuarioDestino}</strong>?`
    const modal = this.modalDialogService.warning('CANCELAR INVITACIÓN DE VISADO',
      mensaje,
      'Confirmar',
      true,
      'Cancelar')
      modal.subscribe({
       next: (resp: CfeDialogRespuesta) => {
         if (resp === CfeDialogRespuesta.Confirmado) this.cancelarInvitacionVisado(detalleVisado);
       },
     });
  }

}
