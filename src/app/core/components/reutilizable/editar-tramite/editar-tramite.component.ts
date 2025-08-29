import { HttpStatusCode } from '@angular/common/http'
import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { ErrorValidacionNegocio } from '@core/interfaces/comunes/error-validacion-negocio.interface'
import { ReusableEditarTramiteService } from '@core/services/reusables/reusable-editar-tramite.service'
import { TokenService } from '@core/services/shared/token.service'
import { urlConsultaCasoFiscal, urlConsultaCuaderno} from '@core/utils/utils'
import { DOMAIN_FRONT_NOTIFICADOR } from '@environments/environment'
import { CmpLibModule } from 'dist/cmp-lib'
import { HeaderService } from 'dist/ngx-cfng-core-layout/header'
import { SidebarService } from 'dist/ngx-cfng-core-layout/sidebar'
import { IconUtil } from 'dist/ngx-cfng-core-lib'
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { NgxSpinnerService } from 'ngx-spinner'
import { DialogService } from 'primeng/dynamicdialog'
import { Subscription } from 'rxjs'

@Component({
  selector: 'opcion-editar-tramite',
  standalone: true,
  imports: [
    CmpLibModule,
    NgxCfngCoreModalDialogModule
  ],
  templateUrl: './editar-tramite.component.html',
  styleUrl: './editar-tramite.component.scss',
  providers: [
    DialogService,
    NgxCfngCoreModalDialogService
  ]
})
export class OpcionEditarTramite implements OnInit, OnDestroy {

  public idCaso = input.required<string>()
  public idActoTramiteCaso = input.required<string>()
  public idTipoIngresoTramite = input.required<number>()
  public idEstadoTramite = input.required<number>()
  public idEtapa = input.required<string>()
  public flgConcluido = input.required<string>()
  public idTipoCuaderno = input.required<number>()

  protected readonly iconUtil = inject(IconUtil)
  private readonly spinner = inject(NgxSpinnerService)
  private readonly router = inject(Router)
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly editarTramiteService = inject(ReusableEditarTramiteService)
  private readonly headerService = inject(HeaderService)
  private readonly sidebarService = inject(SidebarService)
  private readonly tokenService = inject(TokenService)

  private readonly suscripciones: Subscription[] = []
  private readonly ESTADO_TRAMITE_FIRMADO = 946
  protected idIngresoPorFical: number = 1365
  private validoEditar: boolean = false
  protected errorValidacion!: ErrorValidacionNegocio | null
  private readonly textoNoSePuedeEditar: string = 'NO SE PUEDE EDITAR EL TRÁMITE'

  private _idActoTramiteCaso: string = ''

  ngOnInit(): void {
    this._idActoTramiteCaso = this.idActoTramiteCaso()
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe())
  }

  protected async editarTramite() {
    await this.validarCondiciones(this._idActoTramiteCaso)
    if (this.validoEditar) {
      if ( this.idTipoIngresoTramite() === this.idIngresoPorFical && this.idEstadoTramite() === this.ESTADO_TRAMITE_FIRMADO ) {
        const cfeDialog = this.modalDialogService.warning(
          'EDITAR DOCUMENTO FIRMADO',
          'Esta acción invalida todas las firmas actuales y elimina todas las consecuencias realizadas después de haber firmado. Luego podrá volver a firmar el documento nuevamente. ¿Desea continuar?',
          'Continuar',
          true,
          'Cancelar'
        )
        cfeDialog.subscribe({
          next: (resp: CfeDialogRespuesta) => {
            if (resp === CfeDialogRespuesta.Confirmado) {
              this.editarTramiteFirmado()
            }
          }
        })
        return
      }
      this.editarTramiteFirmado()
    } else {
      this.informarQueNoSePuedeEditar()
    }
  }

  private async validarCondiciones(idActoTramiteCaso: string) {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show()
      this.suscripciones.push(
        this.editarTramiteService
          .validarCondiciones(idActoTramiteCaso)
          .subscribe({
            next: () => {
              this.validoEditar = true
              this.spinner.hide()
              resolve()
            },
            error: (error) => {
              if (error.status == HttpStatusCode.UnprocessableEntity) {
                this.errorValidacion = error.error
              } else {
                this.errorValidacion = null
              }
              this.spinner.hide()
              this.informarQueNoSePuedeEditar()
            },
          })
      )
    })
  }

  private editarTramiteFirmado(): void {
    this.suscripciones.push(
      this.editarTramiteService.editarTramiteFirmado(this._idActoTramiteCaso).subscribe({
        next: () => {
          this.irAConsultaCaso()
          setTimeout(() => {
            this.headerService.setActualizarHeader(true)
          }, 0)
          setTimeout(() => {
            this.sidebarService.setActualizarSidebar(true)
          }, 200)
        },
        error: (error) => {
          const mensaje = error.error.message ? error.error.message : 'Ha ocurrido un error inesperado al intentar editar el documento firmado'
          this.modalDialogService.error(
            'ERROR AL INTENTAR EDITAR DOCUMENTO FIRMADO',
            mensaje,
            'Aceptar',
          )
        }
      })
    )
  }
    
  private informarQueNoSePuedeEditar(): void {
    const mensaje: string = this.errorValidacion!.message
    if ( mensaje.includes('se encuentra en proceso de notificación y tiene cédulas(s) generada(s)') ) {
      const cfeDialog = this.modalDialogService.warning(
        this.textoNoSePuedeEditar,
        mensaje,
        'Ir al generador',
        true,
        'Cancelar'
      )
      cfeDialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            const token = this.tokenService.getWithoutBearer()
            window.location.href = `${DOMAIN_FRONT_NOTIFICADOR}/auth/auto?token=${token}&idAplication=1`
          }
        }
      })
      return
    }
    this.modalDialogService.warning(
      this.textoNoSePuedeEditar,
      mensaje,
      'Aceptar'
    )
  }

  private irAConsultaCaso(): void {

    let ruta = urlConsultaCasoFiscal({
      idEtapa: this.idEtapa(),
      idCaso: this.idCaso(),
      flgConcluido: this.flgConcluido()
    })

    if ( this.idTipoCuaderno() === 2 ) {
      ruta = urlConsultaCuaderno(
        'incidental',
        {
        idEtapa: this.idEtapa(),
        idCaso: this.idCaso(),
        flgConcluido: this.flgConcluido()
      })
    }

    if ( this.idTipoCuaderno() === 4 ) {
      ruta = urlConsultaCuaderno(
        'extremo',
        {
        idEtapa: this.idEtapa(),
        idCaso: this.idCaso(),
        flgConcluido: this.flgConcluido()
      })
    }

    this.router.navigate([`${ruta}/acto-procesal/${this._idActoTramiteCaso}/editar`])

  }

}