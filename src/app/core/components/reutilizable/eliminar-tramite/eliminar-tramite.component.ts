import { HttpStatusCode } from '@angular/common/http';
import { Component, inject, input, output } from '@angular/core';
import { EliminarTramiteModalComponent } from '@core/components/modals/eliminar-tramite-modal/eliminar-tramite-modal.component';
import { ErrorValidacionNegocio } from '@core/interfaces/comunes/error-validacion-negocio.interface';
import { EliminarTramiteRequest } from '@core/interfaces/reusables/eliminar-tramite/eliminar-tramite-request';
import { EliminarTramiteService } from '@core/services/reusables/efe/eliminar-tramite/eliminar-tramite.service';
import { TokenService } from '@core/services/shared/token.service';
import { DOMAIN_FRONT_NOTIFICADOR } from '@environments/environment';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'opcion-eliminar-tramite',
  standalone: true,
  imports: [
    CmpLibModule,
    NgxCfngCoreModalDialogModule,
    ButtonModule,
  ],
  templateUrl: './eliminar-tramite.component.html',
  styleUrl: './eliminar-tramite.component.scss',
  providers: [
    DialogService,
    NgxCfngCoreModalDialogService
  ]
})
export class OpcionEliminarTramite {

  public idActoTramiteCaso = input.required<string>()
  public idTipoIngresoTramite = input.required<number>()
  public idEstadoTramite = input.required<number>()
  public actualizarBandeja = output<boolean>()

  private readonly dialogService = inject(DialogService)
  private readonly tokenService = inject(TokenService)
  private readonly spinner = inject(NgxSpinnerService)
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly eliminarTramiteService = inject(EliminarTramiteService)
  protected iconUtil = inject(IconUtil)

  private _idActoTramiteCaso: string = ''
  public suscripciones: Subscription[] = []

  private readonly ESTADO_TRAMITE_FIRMADO = 946
  protected idIngresoPorFical: number = 1365
  private validoEliminar: boolean = false
  protected errorValidacionEliminacion!: ErrorValidacionNegocio | null
  private readonly textoNoSePuedeEliminar: string = 'NO SE PUEDE ELIMINAR EL TRÁMITE'

  ngOnInit(): void {
    this._idActoTramiteCaso = this.idActoTramiteCaso()
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe())
  }

  protected async eliminarTramite(): Promise<void> {
    await this.validarCondicionesEliminacion(this._idActoTramiteCaso)
    if (this.validoEliminar) {
      if ( this.idTipoIngresoTramite() === this.idIngresoPorFical && this.idEstadoTramite() === this.ESTADO_TRAMITE_FIRMADO ) {
        const cfeDialog = this.modalDialogService.warning(
          'ELIMINAR DOCUMENTO FIRMADO',
          'Esta acción invalida todas las firmas actuales y elimina todas las consecuencias realizadas después de haber firmado. Luego podrá volver a firmar el documento nuevamente. ¿Desea continuar?',
          'Continuar',
          true,
          'Cancelar'
        )
        cfeDialog.subscribe({
          next: (resp: CfeDialogRespuesta) => {
            if (resp === CfeDialogRespuesta.Confirmado) {
              this.eliminarTramiteFirmado(this._idActoTramiteCaso)
            }
          }
        })
        return
      }
      this.eliminarTramiteFirmado(this._idActoTramiteCaso)
    } else {
      this.informarQueNoSePuedeEliminar()
    }
  }

  private validarCondicionesEliminacion(idActoTramiteCaso: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      this.suscripciones.push(
        this.eliminarTramiteService
          .validarEliminarTramite(idActoTramiteCaso)
          .subscribe({
            next: () => {
              this.validoEliminar = true
              this.spinner.hide()
              resolve()
            },
            error: (error) => {
              if (error.status == HttpStatusCode.UnprocessableEntity) {
                this.errorValidacionEliminacion = error.error
              } else {
                this.errorValidacionEliminacion = null
              }
              this.spinner.hide()
              this.informarQueNoSePuedeEliminar()
            },
          })
      )
    })
  }

  private informarQueNoSePuedeEliminar(): void {
    const mensaje: string = this.errorValidacionEliminacion!.message
      if ( mensaje.includes('se encuentra en proceso de notificación y tiene cédulas(s) generada(s)') ) {
        const cfeDialog = this.modalDialogService.warningRed(
          this.textoNoSePuedeEliminar,
          mensaje,
          'Ir al generador',
          true,
          'Cancelar'
        )
        cfeDialog.subscribe({
          next: (resp: CfeDialogRespuesta) => {
            if (resp === CfeDialogRespuesta.Confirmado) {
              const token = this.tokenService.getWithoutBearer()
              window.location.href = `${DOMAIN_FRONT_NOTIFICADOR}/auth/auto?token=${token}&idAplication=1`;
            }
          }
        })
        return
      }
      
      this.modalDialogService.warningRed(
        this.textoNoSePuedeEliminar,
        mensaje,
        'Aceptar'
      )
  }

  private eliminarTramiteFirmado(idActoTramiteCaso: string): void {

    const referenciaModal = this.dialogService.open(
      EliminarTramiteModalComponent, {
        styleClass: 'p-dialog--lg',
        showHeader: false,
      }
    )

    referenciaModal.onClose.subscribe(({ accion, motivo }) => {
      if (accion === 'confirmar') {
        const datos: EliminarTramiteRequest = { idActoTramiteCaso, motivo }
        this.suscripciones.push(
          this.eliminarTramiteService.eliminarTramite(datos).subscribe({
            next: () => {
              this.actualizarBandeja.emit(true)
            },
            error: () => {
              this.modalDialogService.error(
                'ERROR AL INTENTAR ELIMINAR DOCUMENTO FIRMADO',
                'Ha ocurrido un error inesperado al intentar eliminar el documento firmado',
                'Aceptar',
              )
            }
          })
        )
      }
    })

  }

}