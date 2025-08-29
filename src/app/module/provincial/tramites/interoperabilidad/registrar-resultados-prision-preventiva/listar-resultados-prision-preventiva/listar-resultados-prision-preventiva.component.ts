import { NgClass } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil, UNIDAD_MEDIDA, CUADERNO_TIPO_MEDIDA, RES_1ERA_INSTANCIA } from 'ngx-cfng-core-lib';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ResolucionAutoResuelvePrisionPreventivaService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-prision-preventiva.service';
import { Subscription } from 'rxjs';
import { ResultadoPrisionPreventivaInterface } from '@core/interfaces/comunes/AutoResuelvePrisionPreventivaRequest';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { PaginacionInterface } from '@interfaces/comunes/paginacion.interface';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { CatalogoInterface } from '@interfaces/comunes/catalogo-interface';

@Component({
  selector: 'app-listar-resultados-prision-preventiva',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    CmpLibModule,
    ButtonModule,
    TableModule,
    NgxCfngCoreModalDialogModule,
    PaginatorComponent,
    CapitalizePipe
  ],
  templateUrl: './listar-resultados-prision-preventiva.component.html',
  styleUrl: './listar-resultados-prision-preventiva.component.scss'
})
export class ListarResultadosPrisionPreventivaComponent implements OnInit, OnChanges, OnDestroy {

  @Input() idActoTramiteCaso: string = '';
  @Input() eventoActualizarTablaResultados: boolean = false;
  @Input() tramiteEnModoEdicion!: boolean;
  @Input() actualizar!: boolean;
  @Input() prolongacion!: boolean;
  @Input() cesacion!: boolean;
  @Input() adecuacion!: boolean;
  @Input() reo!: boolean;
  @Output() alSeleccionarResultado = new EventEmitter<ResultadoPrisionPreventivaInterface>();
  @Output() limpiarControles = new EventEmitter<null>();
  @Output() listaResultados = new EventEmitter<ResultadoPrisionPreventivaInterface[]>();
  @Output() listaResultadosTodos = new EventEmitter<ResultadoPrisionPreventivaInterface[]>();
  @Output() existeResultadosRegistrados = new EventEmitter<boolean>();

  protected expandedRow: any = {};
  protected readonly iconUtil = inject(IconUtil);
  protected readonly resolucionAutoResuelvePrisionPreventivaService = inject(ResolucionAutoResuelvePrisionPreventivaService);
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly subscriptions: Subscription[] = []
  protected resultadosPrisionPreventivaTodos: ResultadoPrisionPreventivaInterface[] = [];
  protected resultadosPrisionPreventiva: ResultadoPrisionPreventivaInterface[] = [];
  protected tipoResultados: CatalogoInterface[] = []
  protected query: any = { limit: 10, page: 1, where: {} };
  protected resetPage: boolean = false;
  protected itemPaginado: any = {
    isLoading: false, data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  ngOnInit(): void {
    this.obtenerTipoResultados();
    this.obtenerResultadosPrisionPreventiva();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['eventoActualizarTablaResultados']?.currentValue) {
      this.obtenerResultadosPrisionPreventiva();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  get tipoMedida(): string {
    return this.prolongacion ? CUADERNO_TIPO_MEDIDA.PROLONGACION :
    this.cesacion ? CUADERNO_TIPO_MEDIDA.CESACION :
    this.adecuacion ? CUADERNO_TIPO_MEDIDA.ADECUACION :
    CUADERNO_TIPO_MEDIDA.PRISION_PREVENTIVA;
  }

  private obtenerTipoResultados(): void {
    this.tipoResultados = [
      {
        id: RES_1ERA_INSTANCIA.FUNDADO,
        noDescripcion: 'Fundado/Procedente',
        coDescripcion: ''
      },
      {
        id: RES_1ERA_INSTANCIA.FUNDADO_PARTE,
        noDescripcion: 'Fundado en parte/Procedente en parte',
        coDescripcion: ''
      },   {
        id: RES_1ERA_INSTANCIA.INFUNDADO,
        noDescripcion: 'Infundado/Improcedente',
        coDescripcion: ''
      },
    ]
  }

  protected obtenerTipoResultadosNombre(resultado: ResultadoPrisionPreventivaInterface): string {
    return this.tipoResultados.find(r => r.id == resultado.idTipoResultado)?.noDescripcion ?? '';
  }

  private obtenerResultadosPrisionPreventiva(): void {
    this.subscriptions.push(
      this.resolucionAutoResuelvePrisionPreventivaService
      .obtenerResultadosPrisionPreventiva(this.idActoTramiteCaso).subscribe({
        next: resp => {
          //TODO poner los números comos constantes
          this.resultadosPrisionPreventivaTodos = resp;
          this.resultadosPrisionPreventiva = this.reo ?
            resp.filter(r => r.reoAusenteContumaz) :
            this.prolongacion ? resp.filter(r => r.idTipoResultadoProceso  == 1517 ) :
            this.cesacion ? resp.filter(r => r.idTipoResultadoProceso == 1518) :
            this.adecuacion ? resp.filter(r => r.idTipoResultadoProceso == 1785) :
              resp.filter(r => r.idTipoResultadoProceso == 1516);
          this.itemPaginado.data.data = this.resultadosPrisionPreventiva;
          this.itemPaginado.data.total = this.resultadosPrisionPreventiva.length;
          this.existeResultadosRegistrados.emit( this.resultadosPrisionPreventiva.length > 0 )
          this.listaResultados.emit(this.resultadosPrisionPreventiva)
          this.listaResultadosTodos.emit(resp);
          this.actualizarPaginaRegistros(this.resultadosPrisionPreventiva, false);
        },
        error: (err) => {
          this.modalDialogService.error('Error', `Error en el servidor ${err.error.message}`, 'Aceptar');
        },
      })
    )
  }

  protected editarResultado(resultado: ResultadoPrisionPreventivaInterface): void {
    this.actualizarMarcaEdicion(resultado);
    this.establecerValoresEdicion(resultado);
  }

  private actualizarMarcaEdicion(resultado: ResultadoPrisionPreventivaInterface): void {
    this.resultadosPrisionPreventiva = this.resultadosPrisionPreventiva.map(item => ({
      ...item, enEdicion: item.enEdicion ? !item.enEdicion : item.idActoTramiteResultadoSujeto === resultado.idActoTramiteResultadoSujeto
    }));
  }

  private establecerValoresEdicion(resultado: ResultadoPrisionPreventivaInterface): void {

    if (this.prolongacion) {
      const padre = this.resultadosPrisionPreventivaTodos.find(r => r.idActoTramiteResultadoSujeto == resultado.idActoTramiteResultadoSujetoPadre);
      if (!padre) return;
      resultado.plazoProlongado = resultado.plazoOtorgado;
      resultado.idUnidadMedidaProlongado = resultado.idUnidadMedida;
      resultado.fechaCalculadaProlongado = resultado.fechaCalculada;
      resultado.idTipoResultadoProlongada = resultado.idTipoResultado;
      resultado.plazoOtorgado = padre.plazoOtorgado
      resultado.idUnidadMedida = padre.idUnidadMedida
      resultado.fechaInicio = padre.fechaInicio
      resultado.fechaCalculada = padre.fechaFin
      resultado.idTipoResultado = padre.idTipoResultado
    }
    if (this.cesacion || this.adecuacion) {
      const padre = this.resultadosPrisionPreventivaTodos.find(r => r.idActoTramiteResultadoSujeto == resultado.idActoTramiteResultadoSujetoPadre);
      if (!padre) return;
      if (this.cesacion) {
        resultado.fechaInicioCesacion = resultado.fechaInicio;
        resultado.plazoCesacion = resultado.plazoOtorgado;
        resultado.fechaCalculadaCesacion = resultado.fechaFin;
        resultado.idUnidadMedidaCesacion = resultado.idUnidadMedida;
        resultado.idTipoResultadoCesacion = resultado.idTipoResultado;
      }
      if (this.adecuacion) {
        resultado.plazoAdecuacion = resultado.plazoOtorgado;
        resultado.fechaCalculadaAdecuacion = resultado.fechaFin;
        resultado.idUnidadMedidaAdecuacion = resultado.idUnidadMedida;
        resultado.idTipoResultadoAdecuacion = resultado.idTipoResultado;
      }

      let pro = null;
      let pri = null;
      if (padre.idTipoResultadoProceso == 1517) {
        pro = padre;
        pri = this.resultadosPrisionPreventivaTodos.find(r => r.idActoTramiteResultadoSujeto == padre.idActoTramiteResultadoSujetoPadre);
        resultado.idTipoResultado = pro?.idTipoResultado ?? 0;
      } else {
        pri = padre;
        resultado.idTipoResultado = pri?.idTipoResultado ?? 0;
      }

      resultado.plazoProlongado = pro?.plazoOtorgado ?? 0;
      resultado.idUnidadMedidaProlongado = pro?.idUnidadMedida ?? 0;
      resultado.fechaCalculadaProlongado = pro?.fechaFin ?? '';
      resultado.idTipoResultadoProlongada = pro?.idTipoResultado ?? 0;
      resultado.plazoOtorgado = pri?.plazoOtorgado ?? 0;
      resultado.idUnidadMedida = pri?.idUnidadMedida ?? 0;
      resultado.fechaInicio = pri?.fechaInicio ?? '';
      resultado.fechaCalculada = pri?.fechaFin ?? '';
    }
    this.alSeleccionarResultado.emit( {...resultado, enEdicion: true })
  }

  protected onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage);
  }

  private actualizarPaginaRegistros(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.resultadosPrisionPreventiva = data.slice(start, end);
  }

  protected onToggleExpand(row: any): void {
    this.expandedRow = this.expandedRow === row ? null : row;
  }

  protected mensajeConfirmarEliminacion(resultado: ResultadoPrisionPreventivaInterface): void {
       const dialog = this.modalDialogService.question(
         '',
         `A continuación, se procederá a <strong>eliminar el registro</strong>. ¿Está seguro de realizar la siguiente acción?`,
         'Aceptar',
         'Cancelar'
       );
       dialog.subscribe({
         next: (resp: CfeDialogRespuesta) => {
           if (resp === CfeDialogRespuesta.Confirmado) {
             this.limpiarControles.emit();
             this.eliminarResultadoPrisionPreventiva(resultado.idActoTramiteResultadoSujeto);
           }
         },
       });
  }

  private eliminarResultadoPrisionPreventiva(idActoTramiteResultadoSujeto: string): void {
    this.subscriptions.push(
      this.resolucionAutoResuelvePrisionPreventivaService
      .eliminarResultadoPrisionPreventiva(idActoTramiteResultadoSujeto, this.tipoMedida).subscribe({
        next: resp => {
          this.modalDialogService.success(
            'ELIMINACIÓN CORRECTA',
            `Se eliminó correctamente el resultado`,
            'Aceptar'
          );
          this.obtenerResultadosPrisionPreventiva();
        },
        error: (err) => {
          this.modalDialogService.error('Error', `Error en el servidor ${err.error.message}`, 'Aceptar');
        },
      })
    )
  }

  protected textoPlazoOtorgado(resultado: ResultadoPrisionPreventivaInterface): string {
    if (!resultado.plazoOtorgado) return '-';
    const esDia = resultado.idUnidadMedida === UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS;
    const singular = esDia ? 'día' : 'mes';
    const plural = resultado.unidadMedida.toLocaleLowerCase();
    const unidad = resultado.plazoOtorgado === 1 ? singular : plural;
    return `${resultado.plazoOtorgado} ${unidad}`;
  }

  protected textoPlazoProlongado(resultado: ResultadoPrisionPreventivaInterface): string {
    const padre = this.resultadosPrisionPreventivaTodos.find(r => r.idActoTramiteResultadoSujeto == resultado.idActoTramiteResultadoSujetoPadre);
    if (!padre) return '';
    const esDia = padre.idUnidadMedida === UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS;
    const singular = esDia ? 'día' : 'mes';
    const plural = padre.unidadMedida.toLocaleLowerCase();
    const unidad = padre.plazoOtorgado === 1 ? singular : plural;
    return `${padre.plazoOtorgado} ${unidad}`;
  }

  protected textoPlazoOtorgadoAdecuacion(resultado: ResultadoPrisionPreventivaInterface): string {
    const padre = this.resultadosPrisionPreventivaTodos.find(r => r.idActoTramiteResultadoSujeto == resultado.idActoTramiteResultadoSujetoPadre);
    if (!padre) return '';
    const pri = this.resultadosPrisionPreventivaTodos.find(r => r.idActoTramiteResultadoSujeto == padre.idActoTramiteResultadoSujetoPadre);
    if (!pri) return '';
    const esDia = pri.idUnidadMedida === UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS;
    const singular = esDia ? 'día' : 'mes';
    const plural = pri.unidadMedida.toLocaleLowerCase();
    const unidad = pri.plazoOtorgado === 1 ? singular : plural;
    return `${pri.plazoOtorgado} ${unidad}`;
  }

  protected fechaInicioProlongado(resultado: ResultadoPrisionPreventivaInterface): string {
    const padre = this.resultadosPrisionPreventivaTodos.find(r => r.idActoTramiteResultadoSujeto == resultado.idActoTramiteResultadoSujetoPadre);
    if (!padre) return '';
    return padre.fechaInicio;
  }

  protected fechaFinProlongado(resultado: ResultadoPrisionPreventivaInterface): string {
    const padre = this.resultadosPrisionPreventivaTodos.find(r => r.idActoTramiteResultadoSujeto == resultado.idActoTramiteResultadoSujetoPadre);
    if (!padre) return '';
    return padre.fechaFin;
  }

  protected fechaInicioAdecuacion(resultado: ResultadoPrisionPreventivaInterface): string {
    const padre = this.resultadosPrisionPreventivaTodos.find(r => r.idActoTramiteResultadoSujeto == resultado.idActoTramiteResultadoSujetoPadre);
    if (!padre) return '';
    const pri = this.resultadosPrisionPreventivaTodos.find(r => r.idActoTramiteResultadoSujeto == padre.idActoTramiteResultadoSujetoPadre);
    if (!pri) return '';
    return pri.fechaInicio;
  }

  protected fechaFin(resultado: ResultadoPrisionPreventivaInterface): string {
    return resultado.fechaFin;
  }

  protected fechaInicio(resultado: ResultadoPrisionPreventivaInterface): string {
    return resultado.fechaInicio;
  }
}
