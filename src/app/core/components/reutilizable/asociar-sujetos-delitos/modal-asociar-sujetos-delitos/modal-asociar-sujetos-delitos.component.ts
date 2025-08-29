import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ListaSujetosProcesales } from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/cuadernos-extremos.interface'
import { urlConsultaCasoFiscal } from '@core/utils/utils'
import { CmpLibModule } from 'dist/cmp-lib'
import { IconUtil, RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib'
import { Tooltip } from 'leaflet'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect'
import { TableModule } from 'primeng/table'
import { Router, RouterLink } from '@angular/router'
import { Expediente } from '@core/utils/expediente'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { TooltipModule } from 'primeng/tooltip'
import { Subscription } from 'rxjs';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { CuadernosExtremosService } from '@core/services/provincial/cuadernos-extremos/cuadernos-extremos.service'
import { AsociarSujetosDelitosService } from '@core/services/reusables/efe/asociar-sujetos-delitos/asociar-sujetos-delitos.service'
import { DelitoAsociado, SujetoAsociado } from '@core/interfaces/reusables/asociar-sujetos-delitos/asociar-sujetos-delitos.interface'
import { GuardarAsociacion } from '@core/interfaces/reusables/asociar-sujetos-delitos/guardar-asociacion.interface'
import { ListaDelitosSujetos } from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/sujeto-procesal.interface';

@Component({
  selector: 'app-modal-asociar-sujetos-delitos',
  standalone: true,
  imports: [
    CmpLibModule,
    TableModule,
    MultiSelectModule,
    ReactiveFormsModule,
    FormsModule,
    TooltipModule,
    RouterLink
  ],
  providers: [
    NgxCfngCoreModalDialogService
  ],
  templateUrl: './modal-asociar-sujetos-delitos.component.html',
  styleUrl: './modal-asociar-sujetos-delitos.component.scss'
})
export class ModalAsociarSujetosDelitosComponent {

  @ViewChild('multiSelect') multiSelect!: MultiSelect
  @ViewChild('tooltip') tooltip!: Tooltip

  // Injección de dependencias
  protected readonly iconUtil = inject(IconUtil)
  private readonly referenciaModal = inject(DynamicDialogRef)
  private readonly router = inject(Router)
  private readonly gestionCasoService = inject(GestionCasoService)
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly cuadernosExtremosService = inject(CuadernosExtremosService)
  private readonly asociarSujetosDelitosService = inject(AsociarSujetosDelitosService)
  private readonly config = inject(DynamicDialogConfig)

  protected listaSujetosProcesales: SujetoAsociado[] = []
  protected sujetosProcesalesSeleccionados: SujetoAsociado[] = []
  private caso!: Expediente
  private readonly idActoTramiteCaso: string = this.config.data.idActoTramiteCaso
  private readonly etapa: string = this.config.data.etapa
  protected readonly modoLectura: boolean =  this.config.data.modoLectura

  private readonly TIPO_PARTE_DENUNCIADO: number = 2
  private readonly TIPO_PARTE_IMPUTADO: number = 4
  private readonly TIPO_PARTE_INVESTIGADO: number = 13
  private readonly TIPO_PARTE_ACUSADO: number = 6
  private readonly TIPO_PARTE_SENTENCIADO: number = 26

  protected readonly TIPO_PERSONA_LQRR: number = 6
  protected readonly TIPO_PERSONA_ESTADO: number = 4
  protected readonly TIPO_PERSONA_SOCIEDAD: number = 7
  
  private datosGuardadosAsociacion: string = ''
  protected terminoCargaSujetos: boolean = false
  protected titulo: string = ''
  protected descripcion: string = ''
  private readonly suscripciones: Subscription[] = []

  // Ciclo de vida del componente

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual
    this.titulo = !this.modoLectura ? 'Asociar sujetos y delitos' : 'Sujetos y delitos'
    this.descripcion = !this.modoLectura ? 'Seleccione los sujetos procesales y sus delitos vinculados.' : 'Lista de sujetos procesales y sus delitos vinculados'
    this.listarSujetosProcesales()
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach( suscripcion => suscripcion.unsubscribe())
  }

  get sinSujetosRegistrados(): boolean {
    return this.listaSujetosProcesales.length === 0
  }

  get mostrarMensajeAlerta(): boolean {
    const denominacionesImputado: number[] = [this.TIPO_PARTE_DENUNCIADO, this.TIPO_PARTE_IMPUTADO, this.TIPO_PARTE_INVESTIGADO, this.TIPO_PARTE_ACUSADO, this.TIPO_PARTE_SENTENCIADO]
    return this.sujetosProcesalesSeleccionados.filter(sujeto => denominacionesImputado.includes(sujeto.idTipoParteSujeto) && sujeto.delitosSeleccionados.length).length <= 0
  }

  get asociacionCompletada(): boolean {
    const denominacionesImputado: number[] = [this.TIPO_PARTE_DENUNCIADO, this.TIPO_PARTE_IMPUTADO, this.TIPO_PARTE_INVESTIGADO, this.TIPO_PARTE_ACUSADO, this.TIPO_PARTE_SENTENCIADO]
    return !this.mostrarMensajeAlerta && (this.sujetosProcesalesSeleccionados.filter(sujeto => sujeto.delitosSeleccionados.length === 0 && denominacionesImputado.includes(sujeto.idTipoParteSujeto)).length === 0)
  }

  protected listarSujetosProcesales() {
    this.listaSujetosProcesales = []
    this.suscripciones.push(
      this.asociarSujetosDelitosService.obtenerSujetosDelitosAsociados(this.idActoTramiteCaso).subscribe({
        next: resp => {
          this.terminoCargaSujetos = true
          if (resp?.length) {
            this.listaSujetosProcesales = resp
            this.listaSujetosProcesales.forEach(sujeto => sujeto.delitosSeleccionados = sujeto.delitos.filter( delito => delito.seleccionado ))
            this.validarSiDatosFueronSeleccionados()
          }
        },
        error: () => {
          this.terminoCargaSujetos = true
          this.modalDialogService.error("Error", `Se ha producido un error al intentar listar los sujetos procesales`, 'Aceptar')
          this.cerrarVentana()
        }
      })
    )
  }

  protected validarSiDatosFueronSeleccionados(): void {
    const sujetosProcesalesSeleccionados = this.listaSujetosProcesales
    .filter(sujeto => sujeto.seleccionado)
    this.sujetosProcesalesSeleccionados = [...sujetosProcesalesSeleccionados]
    this.datosGuardadosAsociacion = JSON.stringify(sujetosProcesalesSeleccionados)
  }

  protected quitarSeleccionSujeto(event: any): void {
    event.data.delitosSeleccionados = []
  }

  protected quitarSeleccionSujetoTabla(event: any): void {
    if (event.checked == false) {
      this.listaSujetosProcesales.forEach(sujeto => sujeto.delitosSeleccionados = [])
    }
  }

  protected tipificarNuevosDelitos(idSujetoCaso: string): void {
    this.cerrarVentana()
    this.router.navigate([`${urlConsultaCasoFiscal(this.caso)}/sujeto/${idSujetoCaso}`])
  }

  protected quitarDelito(
      sujeto: ListaSujetosProcesales,
      delito: ListaDelitosSujetos,
      event: Event,
      multiSelect: any
  ): void {
    event.stopPropagation()
    sujeto.delitosSeleccionados = sujeto.delitosSeleccionados.filter(
      d => d.idDelitoSujeto !== delito.idDelitoSujeto
    )
    multiSelect.hide()
    this.listaSujetosProcesales = [...this.listaSujetosProcesales]
  }

  protected sujetoSeleccionado( idSujetoCaso: string ): boolean {
    return this.sujetosProcesalesSeleccionados.some(sujeto => sujeto.idSujetoCaso === idSujetoCaso)
  }

  protected seleccionarDelito(
    sujeto: ListaSujetosProcesales,
    event: any
  ): void {
    if (event.originalEvent.selected) {
      //ACA AGREGA LA API PARA VALIDAR SI EXISTE  EL DELITO CON EL SUJETO EN OTRO EXTREMO
      const delitoEncontrado = sujeto.delitos.find(
        (delito) => delito.idDelitoSujeto === event.itemValue.idDelitoSujeto
      )
      if (delitoEncontrado) {
        const request={
          idCasoPadre:this.caso.idCaso,
          idDelitoGenerico:delitoEncontrado.idDelitoGenerico,
          idDelitoSubgenerico:delitoEncontrado.idDelitoSubgenerico,
          idDelitoEspecifico:delitoEncontrado.idDelitoEspecifico
        }
        this.suscripciones.push(
          this.cuadernosExtremosService.validarDelitosCuadernoExtremos(request).subscribe({
            next: resp => {
              if (resp?.length) {
                delitoEncontrado.existeExtremo = resp?.length > 0
                if(delitoEncontrado.existeExtremo){
                  delitoEncontrado.listaCuadernosExistentes= resp.map((cuaderno: any) => cuaderno.nroCaso)
                }
              }
            },
            error: () => {
              this.modalDialogService.error("Error", `Se ha producido un error al intentar validar la existencia del delito en otros cuadernos extremos`, 'Aceptar')
            }
          })
        )
      }
    }
  }

  protected mostrarcTooltipDelito(item: DelitoAsociado): string {
    if(item.existeExtremo){
      const textCuaderno = item.cuadernosExistentes?.length == 1?'el cuaderno de extremos':'los cuadernos de extremos'
      return `
      <div class="flex-center pl-2 pb-3 pr-2 border-round-lg label-bg-info">
        <img src="assets/icons/info.svg" width="25" alt="info">
          <span class="text-md ml-2">
              El delito <strong>${item.delito},</strong> ya se encuentra
              registrado en ${textCuaderno} <strong style="text-decoration: underline">${item.cuadernosExistentes.join(", ")}</strong>
          </span>
      </div>
      `
    }
    return ''
  }

  protected guardarAsociacion(): void {
    const request: GuardarAsociacion = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      sujetos: this.sujetosProcesalesSeleccionados.map(sujeto => {
        return {
          idSujetoCaso: sujeto.idSujetoCaso,
          delitos: sujeto.delitosSeleccionados.map(delito => {
            return {
              idDelitoGenerico: delito.idDelitoGenerico,
              idDelitoSubgenerico: delito.idDelitoSubgenerico,
              idDelitoEspecifico: delito.idDelitoEspecifico
            }
          })
        }
      })
    }
    this.suscripciones.push(
      this.asociarSujetosDelitosService.guardarAsociacion(request).subscribe({
        next: resp => {
          if (resp) {
            this.referenciaModal.close(RESPUESTA_MODAL.OK)
          }
        },
        error: () => {
          this.modalDialogService.error("Error", `Se ha producido un error inesperado al intentar guardar la asociación de sujetos`, 'Aceptar')
        }
      })
    )
  }

  public confirmarCancelacion(): void{
    if ( this.verificarSiHuboCambios() ) {
      const dialog = this.modalDialogService.question("¿Desea cancelar?", `Confirme la acción, se perderán todas las selecciones realizadas, ¿Está seguro de realizar la siguiente acción?`, 'Confirmar', 'Cancelar')
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.cerrarVentana()
          }
        }
      })
      return
    }
    this.cerrarVentana()
  }

  protected verificarSiHuboCambios(): boolean {
    return JSON.stringify(this.sujetosProcesalesSeleccionados) !== this.datosGuardadosAsociacion
  }

  public cerrarVentana(): void {
    this.referenciaModal.close()
  }

  protected obtenerUrlSujetos(): string {
    return `${'/app/administracion-casos/consultar-casos-fiscales/[ETAPA]/caso/[CASO]/sujeto'
      .replace('[CASO]', this.caso.idCaso)
      .replace('[ETAPA]', this.etapa)}`;
  }

}