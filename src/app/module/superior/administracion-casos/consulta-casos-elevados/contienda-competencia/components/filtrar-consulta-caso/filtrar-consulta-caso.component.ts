import {CommonModule, DatePipe} from '@angular/common';
import {Component, EventEmitter, input, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TipoVistaEnum} from '@core/components/consulta-casos/models/listar-casos.model';
import {ConsultaCasosGestionService} from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import {DateMaskModule} from '@core/directives/date-mask.module';
import {UsuarioAuthService} from '@core/services/auth/usuario.service.ts.service';
import {Casos} from '@core/services/provincial/consulta-casos/consultacasos.service';
import {MaestroService} from '@core/services/shared/maestro.service';
import {rangoFechaXDefecto} from '@core/utils/date';
import {IconUtil} from 'ngx-cfng-core-lib';
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {SelectItem} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {CalendarModule} from 'primeng/calendar';
import {DropdownModule} from 'primeng/dropdown';
import {DialogService} from 'primeng/dynamicdialog';
import {InputTextModule} from 'primeng/inputtext';
import {RadioButtonModule} from 'primeng/radiobutton';
import {Subscription} from 'rxjs';


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
    DateMaskModule
  ],
  providers: [DialogService, DatePipe],
})
export class FiltrarConsultaCasoComponent implements OnInit{

  @Output()
  public buscar = new EventEmitter<any>();

  @Input()
  public tipoVista:TipoVistaEnum = TipoVistaEnum.Tarjeta;

  @Output()
  public buscarPorTexto = new EventEmitter<string>();

  public datosRutaCondicion = input.required<any>();

  protected etapas: SelectItem[] = [
    {
      value: "01",
      label: "Calificación"
    },
    {
      value: "02",
      label: "Preliminar"
    }
  ];
  protected actoProcesales: SelectItem[] = [
    {
      value: "000004",
      label: "Archivo"
    },
    {
      value: "000011",
      label: "Principio de oportunidad"
    },{
      value: "000013",
      label: "Reserva provisional"
    },
    {
      value: "000108",
      label: "Reapertura de investigación"
    },
  ];
  protected ordenarPor: SelectItem[] = [
    {label: 'Etapa', value: '1'},
    {label: 'Fiscal', value: '2'},
    {label: 'Fiscalía', value: '3'},
    {label: 'Fecha de elevación', value: '4'},
    {label: 'Plazo de pronunciamiento', value: '5'},
  ];
  protected tipoOrden = [
    { label: 'Ascendente', value: '0' },
    { label: 'Descendente', value: '1' },
  ];
  protected plazos:SelectItem[] = [];
  protected esVisibleFiltros = true;
  protected TipoVistaEnum = TipoVistaEnum;
  protected fiscaliasPronvinciales: SelectItem[] = [];
  protected despachos: SelectItem[] = [];
  protected form!: FormGroup;
  private readonly subscriptions: Subscription[] = [];
  protected fechaActual!:Date;
  protected temporizadorBusqueda: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly Casos: Casos,
    private readonly maestrosService: MaestroService,
    protected iconUtil: IconUtil,
    private readonly datePipe:DatePipe,
    private readonly consultaCasosGestionService:ConsultaCasosGestionService,
    private usuarioAuthService: UsuarioAuthService
  ) {
    this.plazos =this.consultaCasosGestionService.getLeyendaPlazos().map(leyenda => ({label:leyenda.nombre, value:leyenda.codigo}));
  }

  ngOnInit(): void {
    this.crearFormulario();
    this.datosPorDefecto();
    this.obtenerFiscaliasXEntidad();
    //
    this.fechaActual = new Date();
    //
  }

  //#region Principal
  protected eventoBuscarSegunTexto():void {
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
    const fechaRango = rangoFechaXDefecto();
    this.form = this.fb.group({
      buscar: [""],
      filtroTiempo: ['0'],
      tipoFecha: ['0'],
      fechaInicio: [fechaRango.inicio],
      fechaFin: [fechaRango.fin],
      ordenarPor: [null],
      tipoOrden: [null],
      fiscaliaProvincial:[null],
      despacho:[null],
      plazos:[null],
      etapa: [null],
      actoProcesal: [null],
    });
  }

  private datosPorDefecto():void{
    const fechaRango = rangoFechaXDefecto(6);
    this.form.patchValue({
      proceso:this.datosRutaCondicion().tipo_proceso ? this.datosRutaCondicion().tipo_proceso : 1,
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
  protected eventoCambiarFiscaliaProvincial(item: any){
    this.obtenerDespachosXFiscalia(item.value);
  }
  protected eventoCambiarFiltroTiempo(filtroTiempo: any) {
    this.form.get('buscar')!.setValue('');
    this.buscar.emit({
      filtroTiempo:filtroTiempo
    });
  }
  //#endregion

  //#region Consultar los datos a través de los servicios
  private obtenerFiscaliasXEntidad(){
    this.subscriptions.push(
      this.maestrosService.obtenerFiscaliasXEntidad( this.usuarioAuthService.obtenerDatosUsuario().codDependencia ).subscribe({
        next: (resp) => {
          this.fiscaliasPronvinciales = resp.data.map( (item: { id: any; nombre: any }) => ({ value: item.id, label: item.nombre }) );
        },
        error: (error) => {},
      })
    );
  }
  private obtenerDespachosXFiscalia(codigoEntidad:string){
    this.subscriptions.push(
      this.maestrosService.listarDespacho(codigoEntidad).subscribe({
        next: (resp) => {
          this.despachos = resp.map( (item: { id: any; nombre: any }) => ({ value: item.id, label: item.nombre }) );
        },
        error: (error) => {},
      })
    );
  }
  //#endregion


}
