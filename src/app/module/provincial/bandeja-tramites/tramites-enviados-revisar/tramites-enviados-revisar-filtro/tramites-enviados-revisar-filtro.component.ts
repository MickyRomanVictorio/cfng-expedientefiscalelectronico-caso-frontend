import { DatePipe, NgClass } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms'
import { DateMaskModule } from '@directives/date-mask.module'
import { BandejaTramiteRequest } from '@interfaces/provincial/bandeja-tramites/BandejaTramiteRequest'
import { BandejaBusqueda, BandejaBusquedaService, } from '@services/provincial/bandeja-tramites/bandeja-busqueda.service'
import { MaestroService } from '@services/shared/maestro.service'
import { BANDEJA_ESTADO, IconUtil } from 'ngx-cfng-core-lib'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { CalendarModule } from 'primeng/calendar'
import { DropdownModule } from 'primeng/dropdown'
import { InputTextModule } from 'primeng/inputtext'
import { RadioButtonModule } from 'primeng/radiobutton'
import { Subscription } from 'rxjs'

@Component({
  standalone: true,
  selector: 'app-tramites-enviados-revisar-filtro',
  templateUrl: './tramites-enviados-revisar-filtro.component.html',
  imports: [
    CalendarModule,
    CmpLibModule,
    DateMaskModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    NgClass,
    RadioButtonModule,
  ],
  providers: [DatePipe],
})
export default class TramitesEnviadosRevisarFiltroComponent implements OnInit {

  public formularioFiltrarTramites!: FormGroup
  public mostrarFiltros = false
  public subscriptions: Subscription[] = []
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
    this.obtenerEtapas()
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
          this.bandejaBusquedaService.datos.ejecutarNuevaBusquedaXTextoValor = ''
        }

      }
    )
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
      etapa: [null],
      actoprocesal: [null],
      tramite: [null],
      tipodocumento: [null]
    })
  }

  private obtenerEtapas(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerEtapasComun().subscribe({
        next: (resp) => {
          this.etapas = resp.data
        },
        error: () => {},
      })
    )
  }

  private obtenerTiposDocumentos(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerTiposDocumentosBandejaTramite().subscribe({
        next: (resp) => {
          this.tipodocumentos = resp.data
        },
        error: () => {  },
      })
    )
  }

  public eventoCambiarEtapa(item: any) {
    this.actosProcesales = []
    this.tramites = []
    this.formularioFiltrarTramites.get('actoprocesal')!.reset()
    this.formularioFiltrarTramites.get('tramite')!.reset()
    if (item.value === null) {
      return
    }
    this.obtenerActosProcesales(item.value)
  }

  private obtenerActosProcesales(idEtapa: any): void {
    this.subscriptions.push(
      this.maestrosService.obtenerActosProcesalesAnt(idEtapa).subscribe({
        next: (resp) => {
          this.actosProcesales = resp.data
        },
        error: () => { },
      })
    )
  }

  public eventoCambiarActoProcesal(item: any) {
    this.tramites = []
    this.formularioFiltrarTramites.get('tramite')!.reset()
    if (item.value === null) {
      return
    }
    this.obtenerTramites(item.value)
  }

  private obtenerTramites(idActoProcesal: string): void {
    this.subscriptions.push(
      this.maestrosService.obtenerTramites(idActoProcesal).subscribe({
        next: (resp) => {
          this.tramites = resp.data
        },
        error: () => { },
      })
    )
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
      idEstadoBandeja: BANDEJA_ESTADO.TRAMITES_ENVIADOS_REVISAR,
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
