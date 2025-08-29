import { tr } from 'date-fns/locale';
import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  input,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { MaestroService } from '@core/services/shared/maestro.service';
import { rangoFechaXDefecto } from '@core/utils/date';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil, TipoProceso } from 'ngx-cfng-core-lib';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subscription } from 'rxjs';
import { TipoVistaEnum } from '../../models/listar-casos.model';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-filtrar-consulta-caso',
  standalone: true,
  templateUrl: './filtrar-consulta-caso.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    RadioButtonModule,
    CalendarModule,
    DateMaskModule,
    ToastModule
  ],
  providers: [MessageService, DialogService, DatePipe ],
})
export class FiltrarConsultaCasoComponent implements OnInit {
  @Output()
  public buscar = new EventEmitter<any>();

  @Input()
  public tipoVista: TipoVistaEnum = TipoVistaEnum.Grilla;

  @Output()
  public buscarPorTexto = new EventEmitter<string>();

  public datosRutaCondicion = input.required<any>();

  protected ordenarPor: SelectItem[] = [
    { label: 'Fecha de ingreso', value: '1' },
    { label: 'Fecha de último trámite', value: '2' },
  ];
  protected tipoOrden = [
    { label: 'Ascendente', value: '1' },
    { label: 'Descendente', value: '2' },
  ];
  protected esVisibleFiltros = false;
  protected TipoVistaEnum = TipoVistaEnum;
  protected tipoProcesos: SelectItem[] = [];
  protected subtipoProcesos: SelectItem[] = [];
  protected etapas: SelectItem[] = [];
  protected actoProcesales: SelectItem[] = [];
  protected tramites: SelectItem[] = [];
  protected fiscaliasPronvinciales: SelectItem[] = [];
  protected fiscales: SelectItem[] = [];
  protected despachos: SelectItem[] = [];
  protected form!: FormGroup;
  private readonly subscriptions: Subscription[] = [];
  protected fechaActual!: Date;
  protected temporizadorBusqueda: any;
  protected condicionMostrarFiltros = signal({
    tipoProceso: true,
    subProceso: true,
    etapa: true,
  });
  private esPaste: boolean = false;
  public valorPasteado: string = '';
  public valorInicial: string = '';
  constructor(
    private readonly fb: FormBuilder,
    private readonly Casos: Casos,
    private readonly maestrosService: MaestroService,
    protected iconUtil: IconUtil,
    private readonly datePipe: DatePipe,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.datosPorDefecto();
    //
    this.fechaActual = new Date();
    //
    this.verificarCondicionMostrarFiltros();
  }

  private verificarCondicionMostrarFiltros() {
    if (this.datosRutaCondicion().concluido === '1') {
      this.condicionMostrarFiltros.set({
        tipoProceso: true,
        subProceso: false,
        etapa: true,
      });
      this.obtenerTipoProceso();
      this.obtenerSubtipoProceso(
        this.datosRutaCondicion().tipo_proceso
          ? this.datosRutaCondicion().tipo_proceso
          : 1
      );
    } else if (this.datosRutaCondicion().generico) {
      this.condicionMostrarFiltros.set({
        tipoProceso: true,
        subProceso: true,
        etapa: true,
      });
      this.obtenerTipoProceso();
      this.obtenerSubtipoProceso(
        this.datosRutaCondicion().tipo_proceso
          ? this.datosRutaCondicion().tipo_proceso
          : 1
      );
    } else if (this.datosRutaCondicion().tipo_proceso === TipoProceso.Comun) {
      this.condicionMostrarFiltros.set({
        tipoProceso: false,
        subProceso: false,
        etapa: false,
      });
      //
      this.obtenerSubtipoProceso(this.datosRutaCondicion().tipo_proceso);
      this.obtenerActosProcesales(this.datosRutaCondicion().id_etapa);
    } else if (
      this.datosRutaCondicion().tipo_proceso === TipoProceso.Especial
    ) {
      this.condicionMostrarFiltros.set({
        tipoProceso: false,
        subProceso: true,
        etapa: true,
      });
      this.obtenerSubtipoProceso(this.datosRutaCondicion().tipo_proceso);
    }
  }  
  protected eventoBuscarSegunTexto(): void {

    clearTimeout(this.temporizadorBusqueda);
    this.temporizadorBusqueda = setTimeout(() => {
      const buscado = this.form.get('buscar')!.value;
      this.buscarPorTexto.emit(buscado);
    }, 200);
  }
  protected eventoMostrarOcultarFiltros(): void {
    this.esVisibleFiltros = !this.esVisibleFiltros;
  }
  private crearFormulario(): void {
    const fechaRango = rangoFechaXDefecto(1);
    this.form = this.fb.group({
      buscar: [''],
      filtroTiempo: ['0'],
      tipoFecha: ['0'],
      fechaInicio: [fechaRango.inicio],
      fechaFin: [fechaRango.fin],
      proceso: [null],
      subtipoProceso: [null],
      etapa: [null],
      actoProcesal: [null],
      tramite: [null],
      ordenarPor: [null],
      tipoOrden: [null],
    });
  }

  private datosPorDefecto(): void {
    const fechaRango = rangoFechaXDefecto(6);
    this.form.patchValue({
      proceso: this.datosRutaCondicion().tipo_proceso
        ? this.datosRutaCondicion().tipo_proceso
        : 1,
      filtroTiempo: '0',
      tipoFecha: '0',
      fechaInicio: fechaRango.inicio,
      fechaFin: fechaRango.fin,
    });
  }
  //#endregion

  //#region  Eventos de Acciones Principales
  protected eventoLimpiar() {
    this.form.reset();
    this.datosPorDefecto();
  }

  protected eventoBuscar() {
    this.form.get('buscar')!.setValue('');
    let body = { ...this.form.value };
    //
    delete body.buscar;
    delete body.filtroTiempo;
    for (let key in body) {
      if (body[key] === null) {
        delete body[key];
      }
    }
    //
    if (this.condicionMostrarFiltros().tipoProceso === false) {
      body.proceso = this.datosRutaCondicion().tipo_proceso;
    }
    if (this.condicionMostrarFiltros().etapa === false) {
      body.etapa = this.datosRutaCondicion().id_etapa;
    }

    //Para el formato de la fecha tambien se puede usar this.datePipe.transform(body.fechaFin, 'dd/MM/yyyy')
    body = {
      ...body,
      fechaInicio: body.fechaInicio
        ? this.datePipe.transform(body.fechaInicio, 'dd/MM/yyyy')
        : null,
      fechaFin: body.fechaFin
        ? this.datePipe.transform(body.fechaFin, 'dd/MM/yyyy')
        : null,
    };
    this.buscar.emit({ ...body });
  }
  //#endregion

  //#region Eventos para consultar los datos a de los servicios
  protected eventoCambiarFiscaliaProvincial(item: any) {
    this.obtenerDespachosXFiscalia(item.value);
    this.resetearFiscales();
  }
  protected eventoCambiarDespacho(item: any) {
    this.obtenerFiscalesXDespacho(item.value);
  }
  protected eventoCambiarTramite(item: any) {
    const idActoProcesal = item.value;
    this.obtenerTiposTramite(idActoProcesal);
  }

  protected eventoCambiarFiltroTiempo(filtroTiempo: any) {
    this.form.get('buscar')!.setValue('');
    this.buscar.emit({
      filtroTiempo: filtroTiempo,
    });
  }

  protected eventoCambiarTipoProceso(idTipoProceso: any) {
    this.resetearSubtipoProceso();
    this.resetearEtapa();
    this.resetearActoProcesal();
    this.resetearTramite();
    if (idTipoProceso !== null) {
      this.obtenerSubtipoProceso(idTipoProceso);
    }
  }

  protected eventoCambiarSubtipoProceso(idSubtipoProceso: any) {
    this.resetearEtapa();
    this.resetearActoProcesal();
    this.resetearTramite();
    if (idSubtipoProceso !== null) {
      const idProceso = this.form.get('proceso')!.value;
      this.obtenerEtapas(idProceso, idSubtipoProceso);
    }
  }

  protected eventoCambiarEtapa(idEtapa: any) {
    this.resetearActoProcesal();
    this.resetearTramite();
    if (idEtapa !== null) {
      this.obtenerActosProcesales(idEtapa);
    }
  }

  protected eventoCambiarActoProcesal(idActoProcesal: any) {
    this.resetearTramite();
    if (idActoProcesal !== null) {
      this.obtenerTiposTramite(idActoProcesal);
    }
  }
  //#endregion

  //#region Resetear los filtros
  private resetearFiscales() {
    this.form.get('fiscal')!.reset();
    this.fiscales = [];
  }
  private resetearSubtipoProceso() {
    this.form.get('subtipoProceso')!.reset();
    this.subtipoProcesos = [];
  }

  private resetearEtapa() {
    this.form.get('etapa')!.reset();
    this.etapas = [];
  }

  private resetearActoProcesal() {
    this.form.get('actoProcesal')!.reset();
    this.actoProcesales = [];
  }

  private resetearTramite() {
    this.form.get('tramite')!.reset();
    this.tramites = [];
  }
  //#endregion

  //#region Consultar los datos a través de los servicios
  private obtenerFiscalesXDespacho(codDespacho: string) {
    this.subscriptions.push(
      this.maestrosService.obtenerFiscalesXDespacho(codDespacho).subscribe({
        next: (resp) => {
          this.fiscales = resp.data.map(
            (item: { codigo: any; nombre: any }) => ({
              value: item.codigo,
              label: item.nombre,
            })
          );
        },
        error: (error) => {},
      })
    );
  }

  private obtenerDespachosXFiscalia(codigoEntidad: string) {
    this.subscriptions.push(
      this.maestrosService.listarDespacho(codigoEntidad).subscribe({
        next: (resp) => {
          this.despachos = resp.map((item: { id: any; nombre: any }) => ({
            value: item.id,
            label: item.nombre,
          }));
        },
        error: (error) => {},
      })
    );
  }

  private obtenerTipoProceso(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerTipoProceso().subscribe({
        next: (resp) => {
          this.tipoProcesos = resp.data.map(
            (item: { id: any; nombre: any }) => ({
              value: item.id,
              label: item.nombre,
            })
          );
        },
        error: (error) => {},
      })
    );
  }

  private obtenerTiposTramite(idActoProcesal: string): void {
    this.Casos.getTramiteByActoProcesal(idActoProcesal).subscribe(
      (data: any) => {
        this.tramites = data.data.map((item: { codigo: any; nombre: any }) => ({
          value: item.codigo,
          label: item.nombre,
        }));
      }
    );
  }

  private obtenerSubtipoProceso(proceso: number) {
    this.subscriptions.push(
      this.maestrosService.obtenerSubtipoProcesos(proceso).subscribe({
        next: (resp) => {
          this.subtipoProcesos = resp.data.map(
            (item: { id: any; nombre: any }) => ({
              value: item.id,
              label: item.nombre,
            })
          );
          this.form.patchValue({
            subtipoProceso: this.subtipoProcesos[0].value,
          });
          this.eventoCambiarSubtipoProceso(this.subtipoProcesos[0].value);
        },
        error: (error) => {},
      })
    );
  }

  protected obtenerEtapas(proceso: number, subtipoProceso: string) {
    this.subscriptions.push(
      this.maestrosService.obtenerEtapas(proceso, subtipoProceso).subscribe({
        next: (resp) => {
          this.etapas = resp.data.map((item: { id: any; nombre: any }) => ({
            value: item.id,
            label: item.nombre,
          }));
        },
        error: (error) => {},
      })
    );
  }

  protected obtenerActosProcesales(etapa: string) {
    this.subscriptions.push(
      this.maestrosService.obtenerActosProcesales(etapa).subscribe({
        next: (resp) => {
          this.actoProcesales = resp.data.map(
            (item: { id: any; nombre: any }) => ({
              value: item.id,
              label: item.nombre,
            })
          );
        },
        error: (error) => {},
      })
    );
  }
  //#endregion
  validarFechas(controlName: String): void {
    const fechaInicio = this.form.get('fechaInicio')?.value;
    const fechaFin = this.form.get('fechaFin')?.value;

    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
     
      if (controlName === 'fechaInicio') {
        this.form.get('fechaInicio')?.setValue(null);
        this.form.get('fechaInicio')?.setErrors({ incorrect: true });
      } else {
        this.form.get('fechaFin')?.setValue(null);
      }
    return this.messageService.add({
        severity: 'warn',
        detail: 'La fecha de inicio no puede ser mayor a la fecha fin',
      });
    }
  }
  eventoCambiarOrdenarPor(event: any) {
    this.form.get('ordenarPor')?.setValue(event.value);
  }
  eventoCambiarTipoOrden(event: any) {
    this.form.get('tipoOrden')?.setValue(event.value);
  }
  
}
