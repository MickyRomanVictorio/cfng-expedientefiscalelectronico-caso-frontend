import {Component, inject, OnDestroy, OnInit} from '@angular/core'
import {CalendarModule} from 'primeng/calendar'
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib'
import {DateMaskModule} from '@directives/date-mask.module'
import {DropdownModule} from 'primeng/dropdown'
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms'
import {InputTextModule} from 'primeng/inputtext'
import {DatePipe, NgClass} from '@angular/common'
import {RadioButtonModule} from 'primeng/radiobutton'
import {Subscription} from 'rxjs'
import {MaestroService} from '@services/shared/maestro.service'
import {obtenerIcono} from '@utils/icon'
import {BANDEJA_ESTADO, IconUtil} from 'ngx-cfng-core-lib'
import {BandejaBusqueda, BandejaBusquedaService,} from '@services/provincial/bandeja-tramites/bandeja-busqueda.service'
import {BandejaTramiteRequest} from '@interfaces/provincial/bandeja-tramites/BandejaTramiteRequest'

@Component({
  standalone: true,
  selector: 'app-tramites-enviados-visar-filtro',
  templateUrl: './tramites-enviados-visar-filtro.component.html',
  imports: [
    CalendarModule,
    CmpLibModule,
    DateMaskModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    RadioButtonModule,
    ReactiveFormsModule,
    NgClass,
  ],
  providers: [DatePipe],
})
export default class TramitesEnviadosVisarFiltroComponent implements OnInit, OnDestroy {

  public formularioFiltrarTramites!: FormGroup
  public mostrarFiltros = false
  public subscriptions: Subscription[] = []
  public tipoProcesos: any[] = []
  public subtipoProcesos: any[] = []
  public etapas: any[] = []
  public actosProcesales: any[] = []
  public tramites: any[] = []
  public tipodocumentos: any[] = []
  private bandejaBusquedaS!: Subscription
  private readonly today = new Date()
  private readonly constructorFormulario = inject(FormBuilder)
  private readonly maestrosService= inject(MaestroService)
  private readonly datePipe = inject(DatePipe)
  private readonly bandejaBusquedaService = inject(BandejaBusquedaService)
  protected iconUtil = inject(IconUtil)

  ngOnInit() {
    this.formularioFiltrarTramites = this.construirFormulario();
    this.obtenerTipoProcesos()
    this.obtenerTiposDocumentos()

    setTimeout(() => { this.buscarTramite() }, 0)

    this.bandejaBusquedaS = this.bandejaBusquedaService.buscar$.subscribe(
      (config: BandejaBusqueda) => {

        if (
          config.ejecutarNuevaBusquedaXTexto === false &&
          (config.nuevaBusquedaEjecutada === true ||
            config.filtroXTipoCuaderno === true ||
            config.ejecutarNuevaBusqueda === true)
        ) {
          this.formularioFiltrarTramites.get('textoBusqueda')!.setValue('')
          this.bandejaBusquedaService.datos.ejecutarNuevaBusquedaXTextoValor =
            ''
        }
      }
    )
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros
  }

  private construirFormulario(): FormGroup {
    let fechaDesde = new Date(
      this.today.getFullYear(),
      this.today.getMonth() - 1,
      this.today.getDate()
    )

    return this.constructorFormulario.group({
      textoBusqueda: [''],
      tipoFecha: ['0'],
      fechaDesde: [fechaDesde, Validators.required],
      fechaHasta: [this.today, Validators.required],
      tipoProceso: [null],
      subtipoProceso: [null],
      etapa: [null],
      actoProcesal: [null],
      tramite: [null],
      tipodocumento: [null]
    })
  }

  private obtenerTiposDocumentos(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerTiposDocumentosBandejaTramite().subscribe({
        next: (resp) => {
          this.tipodocumentos = resp.data
        },
        error: () => {},
      })
    )
  }

  private obtenerTipoProcesos(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerTipoProceso().subscribe({
        next: (resp) => {
          this.tipoProcesos = resp.data
        },
        error: (error) => {
          console.log(error)
        },
      })
    )
  }

  private obtenerSubtipoProceso(idTipoProceso: number) {
    this.subscriptions.push(
      this.maestrosService.obtenerSubtipoProcesos(idTipoProceso).subscribe({
        next: (resp) => {
          this.subtipoProcesos = resp.data
        },
        error: (error) => {
          console.log(error)
        },
      })
    )
  }

  private obtenerEtapas(idTipoProceso: number, idSubtipoProceso: string): void {
    this.subscriptions.push(
      this.maestrosService
        .obtenerEtapas(idTipoProceso, idSubtipoProceso)
        .subscribe({
          next: (resp) => {
            this.etapas = resp.data
          },
          error: () => { },
        })
    )
  }

  private obtenerActosProcesales(idEtapa: any): void {
    this.subscriptions.push(
      this.maestrosService.obtenerActosProcesales(idEtapa).subscribe({
        next: (resp) => {
          this.actosProcesales = resp.data
        },
        error: () => { },
      })
    )
  }

  private obtenerTramites(idActoProcesal: any): void {
    this.subscriptions.push(
      this.maestrosService.obtenerTramites(idActoProcesal).subscribe({
        next: (resp) => {
          this.tramites = resp.data
        },
        error: () => { },
      })
    )
  }

  public eventoCambiarTipoProceso(item: any) {
    const idTipoProceso = item.value
    this.resetearSubtipoProceso()
    this.resetearEtapa()
    this.resetearActoProcesal()
    this.resetearTramite()
    if (idTipoProceso !== null) {
      this.obtenerSubtipoProceso(idTipoProceso)
    }
  }

  public eventoCambiarSubtipoProceso(item: any) {
    const idSubtipoProceso = item.value
    this.resetearEtapa()
    this.resetearActoProcesal()
    this.resetearTramite()
    if (idSubtipoProceso !== null) {
      const idTipoProceso =
        this.formularioFiltrarTramites.get('tipoProceso')!.value
      this.obtenerEtapas(idTipoProceso, idSubtipoProceso)
    }
  }

  public eventoCambiarEtapa(item: any) {
    const idEtapa = item.value
    this.resetearActoProcesal()
    this.resetearTramite()
    if (idEtapa !== null) {
      this.obtenerActosProcesales(idEtapa)
    }
  }

  public eventoCambiarActoProcesal(item: any) {
    const idActoProcesal = item.value
    this.resetearTramite()
    if (idActoProcesal !== null) {
      this.obtenerTramites(idActoProcesal)
    }
  }

  private resetearSubtipoProceso() {
    this.formularioFiltrarTramites.get('subtipoProceso')!.reset()
    this.subtipoProcesos = []
  }

  private resetearEtapa() {
    this.formularioFiltrarTramites.get('etapa')!.reset()
    this.etapas = []
  }

  private resetearActoProcesal() {
    this.formularioFiltrarTramites.get('actoProcesal')!.reset()
    this.actosProcesales = []
  }

  private resetearTramite() {
    this.formularioFiltrarTramites.get('tramite')!.reset()
    this.tramites = []
  }

  public limpiarFiltros(): void {
    this.formularioFiltrarTramites = this.construirFormulario();
    this.actosProcesales = []
    this.tramites = []
  }

  protected buscarTramite(): void {
    if (this.formularioFiltrarTramites.invalid) return
    const form = this.formularioFiltrarTramites.getRawValue()
    const request: BandejaTramiteRequest = {
      textoBusqueda: form.textoBusqueda,
      idEstadoBandeja: BANDEJA_ESTADO.TRAMITES_ENVIADOS_VISAR,
      idTipoProceso: form.tipoProceso ?? 0,
      idSubtipoProceso: form.subtipoProceso ?? 0,
      idEtapa: form.etapa ?? 0,
      idActoProcesal: form.actoprocesal ?? 0,
      idTramite: form.tramite ?? 0,
      idTipoDocumento: form.tipodocumento ?? 0,
      idTipoCuaderno: 0,
      tipoFecha: form.tipoFecha,
      fechaDesde: form.fechaDesde
        ? this.datePipe.transform(form.fechaDesde, 'dd/MM/yyyy')
        : null,
      fechaHasta: form.fechaHasta
        ? this.datePipe.transform(form.fechaHasta, 'dd/MM/yyyy')
        : null,
    }

    this.bandejaBusquedaService.enviarFiltroRequest(request)
  }

  ngOnDestroy(): void {
    if (this.bandejaBusquedaS) this.bandejaBusquedaS.unsubscribe()
  }
}
