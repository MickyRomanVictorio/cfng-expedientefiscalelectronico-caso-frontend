import { NgClass, NgStyle } from '@angular/common'
import { Component, inject, OnDestroy, OnInit, output } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { CuadernosIncidentalesService } from '@services/provincial/cuadernos-incidentales/cuadernos-incidentales.service'
import { IconUtil, obtenerFechaDDMMYYYY, rangoFechaXDefecto } from 'ngx-cfng-core-lib'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { MessageService, SharedModule } from 'primeng/api'
import { CalendarModule } from 'primeng/calendar'
import { DropdownModule } from 'primeng/dropdown'
import { RadioButtonModule } from 'primeng/radiobutton'
import { ToastModule } from 'primeng/toast'
import { DateMaskModule } from '@core/directives/date-mask.module'
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { Subscription } from 'rxjs'
import { CuadernoIncidentalFiltro } from '@core/interfaces/provincial/cuaderno-incidental/cuaderno-incidental.interface'
import { obtenerFiltroUltimoMeses } from '@core/utils/utils'

@Component({
  selector: 'app-filtro-cuaderno-incidental',
  standalone: true,
  imports: [
    CmpLibModule,
    NgClass,
    NgStyle,
    RadioButtonModule,
    ReactiveFormsModule,
    CalendarModule,
    DropdownModule,
    ToastModule,
    SharedModule,
    DateMaskModule,
    ToastModule
  ],
  templateUrl: './filtro-cuaderno-incidental.component.html',
  styleUrls: ['./filtro-cuaderno-incidental.component.scss'],
  providers: [ MessageService, NgxCfngCoreModalDialogService ]
})
export class FiltroCuadernoIncidentalComponent implements OnInit, OnDestroy {

  public eventoBuscarCuaderno = output<CuadernoIncidentalFiltro>()
  public eventoNuevoIncidente = output<void>()

  protected mostrarFiltro: boolean = true
  protected form!: FormGroup
  protected listaTipoCuadernoIncidental: any = []
  protected hoy = new Date()
  private readonly suscripciones: Subscription[] = []

  private readonly fb = inject(FormBuilder)
  protected readonly iconUtil = inject(IconUtil)
  protected readonly messageService = inject(MessageService)
  private readonly cuadernosIncidentalesService = inject(CuadernosIncidentalesService)

  ngOnInit(): void {
    this.iniciarFormulario()
    this.listarTiposCuadernosIncidentales()
    this.buscarCuadernosIncidentales()
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach( suscripcion =>  suscripcion.unsubscribe())
  }

  get noExcedioLongitudTextoBuscar(): boolean {
    return this.form.get('busquedaTexto')?.value.length < 100
  }

  private iniciarFormulario(): void {
    const fechaPorDefecto = rangoFechaXDefecto()
    this.form = this.fb.group({
      busquedaTexto: [''],
      filtroTiempo: ['0'],
      fechaInicio: [obtenerFechaDDMMYYYY(fechaPorDefecto.inicio), Validators.required],
      fechaFin: [obtenerFechaDDMMYYYY(fechaPorDefecto.fin), Validators.required],
      tipoCuadernoIncidental: [null]
    })
  }

  private listarTiposCuadernosIncidentales(): void {
    this.suscripciones.push(
      this.cuadernosIncidentalesService.listaClasificadorExpediente()
      .subscribe({
        next: (rs) => {
          this.listaTipoCuadernoIncidental = rs.data
        }
      })
    )
  }

  protected buscarCuadernosIncidentales(): void {
    const datos = this.form.getRawValue()
    const request: CuadernoIncidentalFiltro = {
      ultimos6meses: !this.mostrarFiltro ? obtenerFiltroUltimoMeses(datos.filtroTiempo) : null,
      busquedaTexto: datos.busquedaTexto.toLowerCase().trim(),
      fechaRegistroIncidenteInicio: this.mostrarFiltro ? datos.fechaInicio : null,
      fechaRegistroIncidenteFin: this.mostrarFiltro ? datos.fechaFin : null,
      idTipoCuaderno: datos.tipoCuadernoIncidental,
      page: 1,
      perPage: 10,
    }
    if ( datos.fechaInicio && datos.fechaFin ) {
      if ( this.validarFechas() ) {
        this.messageService.clear()
        this.messageService.add({ severity: 'warn', summary: '', detail: 'La fecha Inicial no puede ser mayor a la fecha Final', life: 5000 })
        return
      }
    }
    this.eventoBuscarCuaderno.emit(request)
  }

  private validarFechas(): boolean {
    const fechaInicio = this.form.get('fechaInicio')?.value
    const fechaFin = this.form.get('fechaFin')?.value
    if (!fechaInicio || !fechaFin) return false
    return this.convertirFechaStringToDate(fechaInicio) > this.convertirFechaStringToDate(fechaFin)
  }

  private readonly convertirFechaStringToDate = (fechaReniec: string): Date => {
    const [dia, mes, anio] = fechaReniec.split('/')
    return new Date(+anio, +mes - 1, +dia)
  }

  protected limpiarFiltros(): void {
    this.iniciarFormulario()
    this.buscarCuadernosIncidentales()
  }

  protected agregarNuevoIncidente(): void {
    this.eventoNuevoIncidente.emit()
  }

}