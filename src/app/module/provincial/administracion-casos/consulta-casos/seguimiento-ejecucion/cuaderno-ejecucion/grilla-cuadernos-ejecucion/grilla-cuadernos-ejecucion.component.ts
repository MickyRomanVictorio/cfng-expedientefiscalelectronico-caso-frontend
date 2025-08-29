import { UpperCasePipe } from '@angular/common'
import { Component, ElementRef, EventEmitter, inject, Input, Output, Renderer2 } from '@angular/core'
import { EncabezadoModalComponent } from '@core/components/modals/encabezado-modal/encabezado-modal.component'
import { PenasCuadernoEjecucion, ReparacionesCivilesCuadernoEjecucion } from '@core/interfaces/provincial/cuaderno-ejecucion/cuaderno-ejecucion.interface'
import { SolPeruanoPipe } from '@core/pipes/sol-peruano.pipe'
import { CuadernosEjecucionService } from '@core/services/provincial/cuadernos-ejecucion/cuadernos-ejecucion.service'
import { ID_N_TIPO_SENTENCIA } from '@core/types/tipo-sentencia'
import { capitalizedFirstWord } from '@core/utils/string'
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { IconUtil, formatDateToAbbreviated, obtenerCasoHtml } from 'ngx-cfng-core-lib'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { DataViewModule } from 'primeng/dataview'
import { DialogModule } from 'primeng/dialog'
import { TableModule } from 'primeng/table'
import { Subscription } from 'rxjs'
@Component({
  selector: 'grilla-cuadernos-ejecucion',
  standalone: true,
  imports: [
    DataViewModule,
    CmpLibModule,
    UpperCasePipe,
    DialogModule,
    EncabezadoModalComponent,
    TableModule,
    SolPeruanoPipe
  ],
  templateUrl: './grilla-cuadernos-ejecucion.component.html',
  styleUrl: './grilla-cuadernos-ejecucion.component.scss'
})
export class GrillaCuadernosEjecucionComponent {

  private readonly suscripciones: Subscription[] = []

  protected readonly iconUtil = inject(IconUtil)

  private readonly el = inject(ElementRef)

  private readonly renderer = inject(Renderer2)

  protected mostrarModalPenas: boolean = false

  protected mostrarModalReparacionCivil: boolean = false

  private readonly cuadernosEjecucionService = inject(CuadernosEjecucionService)

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  protected cuadernoEjecucion: string = ""

  @Input()
  public listaCuadernos: any[] = []

  @Output()
  public borrarAccionOut = new EventEmitter<any>()

  protected obtenerCasoHtml = obtenerCasoHtml

  protected formatDateToAbbreviated = formatDateToAbbreviated

  protected capitalizedFirstWord = capitalizedFirstWord

  protected mostrarEliminar: boolean = false

  protected ID_N_TIPO_SENTENCIA = ID_N_TIPO_SENTENCIA

  protected listaPenas: PenasCuadernoEjecucion[] = []

  protected listaReparacionesCiviles: ReparacionesCivilesCuadernoEjecucion[] = []

  ngAfterViewInit(): void {
    const contentDiv = this.el.nativeElement.querySelector('.p-dataview-content')
    if (contentDiv && !contentDiv.classList.contains('grid')) {
      this.renderer.addClass(contentDiv, 'grid')
    }
  }
  ngOnDestroy(): void {
    this.suscripciones.forEach(suscripcion => suscripcion.unsubscribe())
  }

  protected async eventoDetalle(e: Event, cuaderno: any) {
    console.log(cuaderno.idCaso)
  }

  protected eventoMostrarPenas(e: Event, cuaderno: any) {
    e.stopPropagation()
    this.suscripciones.push(
      this.cuadernosEjecucionService.listarPenasCuadernoEjecucion(cuaderno.idActoTramiteDelitoSujeto).subscribe({
        next: resp => {
          if (resp?.length > 0) {
            this.cuadernoEjecucion = cuaderno.codigoCaso
            this.listaPenas = resp as PenasCuadernoEjecucion[]
            this.mostrarModalPenas = true
          }
        },
        error: () => {
          this.modalDialogService.error("Error",
            `Se ha producido un error al intentar listar las penas`,
            'Aceptar');
        }
      })
    )
  }

  protected cerrarPenas = () => {
    this.mostrarModalPenas = false
  }

  protected eventoMostrarReparacionesCiviles(e: Event, cuaderno: any) {
    e.stopPropagation()
    this.suscripciones.push(
      this.cuadernosEjecucionService.listarReparacionCivilCuadernoEjecucion(cuaderno.idActoTramiteDelitoSujeto).subscribe({
        next: resp => {
          if (resp?.length > 0) {
            this.cuadernoEjecucion = cuaderno.codigoCaso
            this.listaReparacionesCiviles = resp as ReparacionesCivilesCuadernoEjecucion[]
            this.mostrarModalReparacionCivil = true
          }
        },
        error: () => {
          this.modalDialogService.error("Error",
            `Se ha producido un error al intentar listar las reparaciones civiles`,
            'Aceptar');
        }
      })
    )
  }
  protected cerrarReparacionesCiviles = () => {
    this.mostrarModalReparacionCivil = false
  }

  protected eventoBorrar(e: Event, cuaderno: any) {
    e.stopPropagation()
    this.borrarAccionOut.emit(cuaderno)
  }
  protected removerSentenciaPalabra(texto: string): string {
    if (!texto) {
      return '';
    }
    return texto.replace(/\bSENTENCIA(?:\s+DE)?\b/gi, '').trim();
  }
}
