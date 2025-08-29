import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TipoVistaEnum } from '../../models/listar-casos.model';
import { SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { MaestroService } from '@core/services/shared/maestro.service';
import { Constants, IconUtil, obtenerFechaDDMMYYYY } from 'ngx-cfng-core-lib';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DialogService } from 'primeng/dynamicdialog';
import { CmpLibModule } from 'dist/cmp-lib';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { rangoFechaXDefecto } from '@core/utils/date';


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
  public tipoVista:TipoVistaEnum = TipoVistaEnum.Grilla;


  @Output()
  public buscarPorTexto = new EventEmitter<string>();

  protected ordenarPor: SelectItem[] = [
    { label: 'Etapa', value: '0' },
    { label: 'Fiscal', value: '1' },
    { label: 'Fiscalía', value: '2' },
    { label: 'Fecha de registro', value: '3' },
    { label: 'Fecha de último trámite', value: '4' },
    { label: 'Fecha de elevación', value: '5' },
    { label: 'Fecha de vencimiento de plazo', value: '6' },
  ];
  protected tipoOrden = [
    { label: 'Ascendente', value: '0' },
    { label: 'Descendente', value: '1' },
  ];
  protected estados:SelectItem[] = [
    { label: 'Dentro del plazo', value: '1' },
    { label: 'Plazo por vencer', value: '2' },
    { label: 'Plazo vencido', value: '3' },
    { label: 'Concluido', value: '4' },
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
  private readonly codDependencia!:string;
  protected fechaActual!:Date;
  protected temporizadorBusqueda: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly Casos: Casos,
    private readonly maestrosService: MaestroService,
    protected iconUtil: IconUtil,
    private readonly datePipe:DatePipe
  ) {
    const helper = new JwtHelperService();
    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);
    const decodedToken = helper.decodeToken(token.token);
    this.codDependencia = decodedToken.usuario.codDependencia;
  }

  ngOnInit(): void {
    this.crearFormulario();
    this.datosInicio();
    this.datosPorDefecto();
    //
    this.eventoBuscar();
    //
    this.fechaActual = new Date();
  }

  //#region Principal
  private datosInicio(){
    this.obtenerTipoProceso();
    this.obtenerFiscaliasXEntidad();
  }
  protected eventoBuscarSegunTexto():void {
    clearTimeout(this.temporizadorBusqueda);
    this.temporizadorBusqueda = setTimeout(() => {
      const buscado = this.form.get('buscar')!.value;
      this.buscarPorTexto.emit(buscado);
    }, 400);

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
      entidad:[null],
      despacho:[null],
      fiscal:[null],
      proceso: [null],/* Por defecto es Proceso Común */
      subtipoProceso: [null],
      etapa: [null],
      actoProcesal: [null],
      tramite: [null],
      estado: [null],
      tipoOrderBy: [null],
      orderBy: [null],
    });
  }

  private datosPorDefecto():void{
    const fechaRango = rangoFechaXDefecto(1);
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
    this.resetearFiscales();
  }
  protected eventoCambiarDespacho(item: any){
    this.obtenerFiscalesXDespacho(item.value);
  }
  protected eventoCambiarTramite(item: any) {
    const idActoProcesal = item.value;
    this.obtenerTiposTramite(idActoProcesal);
  }

  protected eventoCambiarFiltroTiempo(filtroTiempo: any) {
    this.form.get('buscar')!.setValue('');
    let fechaRango = rangoFechaXDefecto(1);
    if(filtroTiempo==='1')
      fechaRango = rangoFechaXDefecto(6);
    else if(filtroTiempo==='2')
      fechaRango = rangoFechaXDefecto(1000);
    this.buscar.emit({
      tipoFecha:'0',
      fechaInicio: obtenerFechaDDMMYYYY( fechaRango.inicio ),
      fechaFin: obtenerFechaDDMMYYYY( fechaRango.fin )
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
  private obtenerFiscalesXDespacho(codDespacho:string){
    this.subscriptions.push(
      this.maestrosService.obtenerFiscalesXDespacho(codDespacho).subscribe({
        next: (resp) => {
          this.fiscales = resp.data.map( (item: { codigo: any; nombre: any }) => ({ value: item.codigo, label: item.nombre }) );
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
  private obtenerFiscaliasXEntidad(){
    this.subscriptions.push(
      this.maestrosService.obtenerFiscaliasXEntidad(this.codDependencia).subscribe({
        next: (resp) => {
          this.fiscaliasPronvinciales = resp.data.map( (item: { id: any; nombre: any }) => ({ value: item.id, label: item.nombre }) );
        },
        error: (error) => {},
      })
    );
  }
  private obtenerTipoProceso(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerTipoProceso().subscribe({
        next: (resp) => {
          this.tipoProcesos = resp.data.map( (item: { id: any; nombre: any }) => ({ value: item.id, label: item.nombre }) );
        },
        error: (error) => {},
      })
    );
  }

  private obtenerTiposTramite(idActoProcesal: string): void {
    this.Casos.getTramiteByActoProcesal(idActoProcesal).subscribe(
      (data: any) => {
        this.tramites = data.data.map((item: { id: any; nombre: any }) => ({
          value: item.id,
          label: item.nombre,
        }));
      }
    );
  }

  private obtenerSubtipoProceso(proceso: number) {
    this.subscriptions.push(
      this.maestrosService.obtenerSubtipoProcesos(proceso).subscribe({
        next: (resp) => {
          this.subtipoProcesos = resp.data.map( (item: { id: any; nombre: any }) => ({ value: item.id, label: item.nombre })
          );
          this.form.patchValue({ subtipoProceso: this.subtipoProcesos[0].value });
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
          this.etapas = resp.data.map((item: { id: any; nombre: any }) => ({ value: item.id, label: item.nombre }));
        },
        error: (error) => {},
      })
    );
  }

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
  //#endregion


}
