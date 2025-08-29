import { DatePipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PlazosLeyenda, TipoAsignacion, TipoElevacion } from '@core/constants/superior';
import { UsuarioAuthService } from '@core/services/auth/usuario.service.ts.service';
import { MaestroService } from '@core/services/shared/maestro.service';
import { rangoFechaXDefecto } from '@core/utils/date';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { IconUtil, obtenerFechaDDMMYYYY } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { SelectItem } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filtro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RadioButtonModule,
    CalendarModule,
    DropdownModule,
    NgClass,
    CmpLibModule,
    InputTextModule,
    NgxCfngCoreModalDialogModule
  ],
  templateUrl: './filtro.component.html',
  styleUrl: './filtro.component.scss',
  providers: [DatePipe],
})
export class FiltroComponent implements OnInit {

  @Input()
  public esRecepcion = false;
  @Output()
  public buscar = new EventEmitter<any>();

  @Output()
  public buscarPorTexto = new EventEmitter<string>();
  protected etapas: SelectItem[] = [
    {
      value: "1",
      label: "Calificación"
    },
    {
      value: "2",
      label: "Preliminar"
    },
    {
      value: "3",
      label: "Preparatoria"
    },
    {
      value: "4",
      label: "Intermedia"
    },
    {
      value: "5",
      label: "Juzgamiento"
    }
  ];
  protected fmrBuscar!: FormGroup;
  protected esVisibleFiltros = false;

  protected temporizadorBusqueda: any;
  protected tipoElevacion: SelectItem[] = TipoElevacion;
  protected tipoAsignacion: SelectItem[] = TipoAsignacion;
  protected fiscaliasPronvinciales: SelectItem[] = [];
  protected despachos: SelectItem[] = [];
  private readonly subscriptions: Subscription[] = [];
  protected plazos: SelectItem[] = PlazosLeyenda.map(leyenda => ({ label: leyenda.nombre, value: leyenda.codigo }));

  constructor(
    private readonly fb: FormBuilder,
    private readonly datePipe: DatePipe,
    protected readonly iconUtil: IconUtil,
    private readonly usuarioAuthService: UsuarioAuthService,
    private readonly maestrosService: MaestroService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) { }

  ngOnInit(): void {
    this.crearFormulario();
    this.datosInicio();
    this.datosPorDefecto();
    this.eventoBuscar();
  }

  private datosInicio(): void {
    this.obtenerFiscaliasXEntidad();
  }

  private crearFormulario(): void {
    this.fmrBuscar = this.fb.group({
      buscar: [""],
      periodoFecha: [null],
      tipoFecha: [null],
      fechaDesde: [null],
      fechaHasta: [null],
      tipoElevacion: [null],
      tipoAsignacion: [null],
      idEntidad: [null],
      idDespacho: [null],
      idPlazo: [null],
      etapa: [null],
    });
  }

  private datosPorDefecto(): void {
    const fechaRango = rangoFechaXDefecto();
    this.fmrBuscar.patchValue({
      periodoFecha: this.esVisibleFiltros === false ? '1' : null,
      tipoFecha: this.esRecepcion? '1': '2',
      fechaDesde: fechaRango.inicio,
      fechaHasta: fechaRango.fin
    });
  }

  protected eventoLimpiar() {
    this.fmrBuscar.reset();
    this.datosPorDefecto();
  }
  protected eventoBuscar() {
    const fechaActual = new Date(),
      fechaInicio = this.fmrBuscar.get('fechaDesde')?.value,
      fechaFin = this.fmrBuscar.get('fechaHasta')?.value;
    //
    if (fechaInicio === null || fechaFin === null) {
      this.modalDialogService.warning('Fechas inválidas', 'Debe seleccionar las fechas de inicio y fin de la reasignación', 'Aceptar');
      return;
    }
    //
    if (fechaInicio > fechaFin) {
      this.modalDialogService.warning('Fechas inválidas', 'La fecha de inicio no puede ser mayor a la fecha de fin', 'Aceptar');
      return;
    }
    //
    if (fechaInicio > fechaActual || fechaFin > fechaActual) {
      this.modalDialogService.warning('Fechas inválidas', 'Las fechas de inicio y fin no pueden ser mayor a la fecha actual', 'Aceptar');
      return;
    }
    let body = { ...this.fmrBuscar.value };
    if (this.esVisibleFiltros === true) {
      body.periodoFecha = null;
      body.fechaDesde = this.datePipe.transform(body.fechaDesde, 'dd/MM/yyyy');
      body.fechaHasta = this.datePipe.transform(body.fechaHasta, 'dd/MM/yyyy');
    } else {
      body.fechaDesde = null;
      body.fechaHasta = null;
    }
    console.log('body', body);
    this.buscar.emit({ ...body });
  }
  protected eventoMostrarOcultarFiltros(): void {
    this.esVisibleFiltros = !this.esVisibleFiltros;
    if (this.esVisibleFiltros === false) {
      this.fmrBuscar.patchValue({ periodoFecha: '1' });
    }
  }
  protected eventoBuscarSegunTexto(): void {
    clearTimeout(this.temporizadorBusqueda);
    this.temporizadorBusqueda = setTimeout(() => {
      const buscado = this.fmrBuscar.get('buscar')!.value;
      this.buscarPorTexto.emit(buscado);
    }, 400);
  }

  public eventoCambiarFiltroTiempo(filtroTiempo: any) {
    this.fmrBuscar.get('buscar')!.setValue('');
    let fechaRango = rangoFechaXDefecto(1);
    if (filtroTiempo === '1')
      fechaRango = rangoFechaXDefecto(6);
    else if (filtroTiempo === '2')
      fechaRango = rangoFechaXDefecto(1000);
    //
    this.buscar.emit({
      periodoFecha: filtroTiempo,
      fechaDesde: obtenerFechaDDMMYYYY(fechaRango.inicio),
      fechaHasta: obtenerFechaDDMMYYYY(fechaRango.fin)
    });
  }

  private obtenerFiscaliasXEntidad() {
    this.subscriptions.push(
      this.maestrosService.obtenerFiscaliasXEntidad(this.usuarioAuthService.obtenerDatosUsuario().codDependencia).subscribe({
        next: (resp) => {
          this.fiscaliasPronvinciales = resp.data.map((item: { id: any; nombre: any }) => ({ value: item.id, label: item.nombre }));
        }
      })
    );
  }
  protected eventoCambiarFiscaliaProvincial(item: any) {
    this.obtenerDespachosXFiscalia(item.value);
  }
  private obtenerDespachosXFiscalia(codigoEntidad: string) {
    this.subscriptions.push(
      this.maestrosService.listarDespacho(codigoEntidad).subscribe({
        next: (resp) => {
          this.despachos = resp.map((item: { id: any; nombre: any }) => ({ value: item.id, label: item.nombre }));
        }
      })
    );
  }

  public reiniciar(): void {
    this.fmrBuscar.get('buscar')!.setValue('');
  }

}
