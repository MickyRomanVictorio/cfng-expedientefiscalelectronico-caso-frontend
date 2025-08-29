import { NgClass, NgStyle } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { CuadernoEjecucionFiltro } from '@core/interfaces/provincial/cuaderno-ejecucion/cuaderno-ejecucion.interface';
import { CuadernosEjecucionService } from '@core/services/provincial/cuadernos-ejecucion/cuadernos-ejecucion.service';
import { convertirFechaStringToDate, obtenerFiltroUltimoMeses } from '@core/utils/utils';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil, obtenerFechaDDMMYYYY, rangoFechaXDefecto } from 'dist/ngx-cfng-core-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { MessageService, SharedModule } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { debounceTime, distinctUntilChanged, filter, map, skip, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'filtro-cuaderno-ejecucion',
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
  providers: [MessageService, NgxCfngCoreModalDialogService],
  templateUrl: './filtro-cuaderno-ejecucion.component.html',
  styleUrl: './filtro-cuaderno-ejecucion.component.scss'
})
export class FiltroCuadernoEjecucionComponent {

  public eventoBuscarCuaderno = output<CuadernoEjecucionFiltro>()

  private readonly suscripciones: Subscription[] = []

  private readonly fb = inject(FormBuilder)

  protected readonly iconUtil = inject(IconUtil)

  protected readonly messageService = inject(MessageService)

  private readonly cuadernosEjecucionService = inject(CuadernosEjecucionService)

  protected mostrarFiltro: boolean = false

  protected form!: FormGroup

  protected listaTipoResolucion: any = []

  protected hoy = new Date()

  ngOnInit(): void {
    this.iniciarFormulario()

    this.listarTipoResolucion()

    this.buscarCuadernosEjecucion()

    this.suscripciones.push(
      this.form.get('busquedaTexto')!.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          filter((texto) => texto !== null && texto !== undefined)
        )
        .subscribe(() => {
          if (!this.mostrarFiltro) {
            this.buscarCuadernosEjecucion()
          }
        })
    );


  }
  ngOnDestroy(): void {
    this.suscripciones.forEach(suscripcion => suscripcion.unsubscribe())
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
      tipoResolucion: [null]
    })
  }

  private listarTipoResolucion(): void {
    this.suscripciones.push(
      this.cuadernosEjecucionService.listaClasificadorExpediente()
        .subscribe({
          next: (rs) => {
            this.listaTipoResolucion = rs.data
          }
        })
    )
  }
  protected cambiarTipoFiltro(): void {
    const control = this.form.get('busquedaTexto');
    if (!control) return;

    control.setValue('');

    this.mostrarFiltro = !this.mostrarFiltro;
    
    if (this.mostrarFiltro) {
      control.disable()
    }
    else {
      control.enable()
      this.buscarCuadernosEjecucion()
    }
  }


  protected buscarCuadernosEjecucion(): void {
    const datos = this.form.getRawValue()
    const request: CuadernoEjecucionFiltro = {
      ultimos6meses: !this.mostrarFiltro ? obtenerFiltroUltimoMeses(datos.filtroTiempo) : null,
      busquedaTexto: datos.busquedaTexto.toLowerCase().trim(),
      fechaNotificacionInicio: this.mostrarFiltro ? datos.fechaInicio : null,
      fechaNotificacionFin: this.mostrarFiltro ? datos.fechaFin : null,
      idTipoCuaderno: datos.tipoResolucion,
      page: 1,
      perPage: 9,
    }
    if (datos.fechaInicio && datos.fechaFin) {
      if (this.validarFechas()) {
        this.messageService.clear()
        this.messageService.add({ severity: 'warn', summary: '', detail: 'La fecha inicial no puede ser mayor a la fecha final', life: 5000 })
        return
      }
    }
    this.eventoBuscarCuaderno.emit(request)
  }
  private validarFechas(): boolean {
    const fechaInicio = this.form.get('fechaInicio')?.value
    const fechaFin = this.form.get('fechaFin')?.value
    if (!fechaInicio || !fechaFin) return false
    return convertirFechaStringToDate(fechaInicio) > convertirFechaStringToDate(fechaFin)
  }
  protected limpiarFiltros(): void {
    const fechaPorDefecto = rangoFechaXDefecto()
    this.form.setValue({
      busquedaTexto: '',
      filtroTiempo: '0',
      fechaInicio: obtenerFechaDDMMYYYY(fechaPorDefecto.inicio),
      fechaFin: obtenerFechaDDMMYYYY(fechaPorDefecto.fin),
      tipoResolucion: null
    })
    this.buscarCuadernosEjecucion()
  }

}