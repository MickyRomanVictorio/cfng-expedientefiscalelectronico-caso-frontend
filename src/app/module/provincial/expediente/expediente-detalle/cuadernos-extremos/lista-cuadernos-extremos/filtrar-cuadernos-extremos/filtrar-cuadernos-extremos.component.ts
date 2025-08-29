import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, input, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { MaestroService } from '@core/services/shared/maestro.service';
import { rangoFechaXDefecto } from '@core/utils/date';
import { Expediente } from '@core/utils/expediente';
import { TipoVistaEnum } from '@modules/provincial/administracion-casos/consulta-casos/listar-casos/models/listar-casos.model';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'ngx-cfng-core-lib';
import { SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-filtrar-cuadernos-extremos',
  standalone:true,
  templateUrl: './filtrar-cuadernos-extremos.component.html',
  styleUrls: ['./filtrar-cuadernos-extremos.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    RadioButtonModule,
    CalendarModule,
    DateMaskModule
  ],
  providers: [DialogService, DatePipe],
})
export class FiltrarCuadernosExtremosComponent implements OnInit {


  @Output()
  public buscar = new EventEmitter<any>();

  @Input()
  public tipoVista:TipoVistaEnum = TipoVistaEnum.Grilla;

  @Output()
  public buscarPorTexto = new EventEmitter<string>();


  protected ordenarPor: SelectItem[] = [
    { label: 'Fecha de creación', value: '0' },
    { label: 'Fecha de último trámite', value: '1' }
  ];
  protected tipoOrden = [
    { label: 'Ascendente', value: '0' },
    { label: 'Descendente', value: '1' },
  ];
  protected esVisibleFiltros = true;
  protected TipoVistaEnum = TipoVistaEnum;
  protected actoProcesales: SelectItem[] = [];
  protected tramites: SelectItem[] = [];
  protected form!: FormGroup;
  private readonly subscriptions: Subscription[] = [];
  protected fechaActual!:Date;
  protected temporizadorBusqueda: any;
  private caso!: Expediente;

  constructor(
    private readonly fb: FormBuilder,
    private readonly Casos: Casos,
    private readonly maestrosService: MaestroService,
    protected iconUtil: IconUtil,
    private readonly datePipe:DatePipe,
    private readonly gestionCasoService: GestionCasoService,
  ) {

  }

  ngOnInit(): void {
    this.crearFormulario();
    this.datosPorDefecto();
    this.fechaActual = new Date();
    this.caso = this.gestionCasoService.casoActual;
    this.obtenerActosProcesales(this.caso.idEtapa);

  }


  //#region Principal

  protected eventoBuscarSegunTexto():void {
    clearTimeout(this.temporizadorBusqueda);
    this.temporizadorBusqueda = setTimeout(() => {
      const buscado = this.form.get('buscar')!.value;
      this.buscarPorTexto.emit(buscado);
    }, 200);
  }
  private crearFormulario(): void {
    const fechaRango = rangoFechaXDefecto(1);
    this.form = this.fb.group({
      buscar: [''],
      filtroTiempo: ['0'],
      tipoFecha: ['0'],
      fechaInicio: [fechaRango.inicio],
      fechaFin: [fechaRango.fin],
      actoProcesal: [null],
      tramite: [null],
      ordenarPor: [null],
      tipoOrden: [null],
    });
  }

  private datosPorDefecto():void{
    const fechaRango = rangoFechaXDefecto(6);
    this.form.patchValue({
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
    //Para el formato de la fecha tambien se puede usar this.datePipe.transform(body.fechaFin, 'dd/MM/yyyy')
    body = {
      ...body,
      fechaInicio: body.fechaInicio ?  this.datePipe.transform(body.fechaInicio, 'dd/MM/yyyy'): null,
      fechaFin: body.fechaFin ? this.datePipe.transform(body.fechaFin, 'dd/MM/yyyy'): null
    };
    this.buscar.emit({ ...body });
  }
  //#endregion

  //#region Eventos para consultar los datos a de los servicios

  protected eventoCambiarTramite(item: any) {
    const idActoProcesal = item.value;
    this.obtenerTiposTramite(idActoProcesal);
  }

  protected eventoCambiarFiltroTiempo(filtroTiempo: any) {
    this.form.get('buscar')!.setValue('');
    this.buscar.emit({
      filtroTiempo:filtroTiempo
    });
  }


  protected eventoCambiarActoProcesal(idActoProcesal: any) {
    this.resetearTramite();
    if (idActoProcesal !== null) {
      this.obtenerTiposTramite(idActoProcesal);
    }
  }
  //#endregion

  //#region Resetear los filtros



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

  protected obtenerActosProcesales(etapa: string) {
    this.subscriptions.push(
      this.maestrosService.obtenerActosProcesales(etapa).subscribe({
        next: (resp) => {
          this.actoProcesales = resp.data.map( (item: { id: any; nombre: any }) => ({ value: item.id, label: item.nombre }) );
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

  //#endregion

}
