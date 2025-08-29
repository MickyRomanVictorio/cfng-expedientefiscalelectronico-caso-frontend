import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { EncabezadoTooltipComponent } from "@components/modals/encabezado-tooltip/encabezado-tooltip.component";
import { PaginatorComponent } from "@components/generales/paginator/paginator.component";
import { PaginacionInterface } from '@interfaces/comunes/paginacion.interface';
import { CasoLeidoRequest } from '@interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest';
import { CasoIdRequest, CasoPorRecepcionar, } from '@interfaces/provincial/recepcion/CasoPorRecepcionar';
import {
  CONSTANTE_PAGINACION,
  LECTURA_CASO,
  NOMBRES_CABECERA_RECEPCION,
} from '@core/types/efe/provincial/administracion-casos/asignacion/recepcion-casos.type';
import { TipoArchivoType } from '@core/types/exportar.type';
import { DateMaskModule } from '@directives/date-mask.module';
import { AlertaData } from '@interfaces/comunes/alert';
import { ResponseCatalogModel } from '@models/response.model';
import { RecepcionConsultasService } from '@services/provincial/recepcion/recepcion-consultas.service';
import { ExportarService } from '@services/shared/exportar.service';
import { MaestroService } from '@services/shared/maestro.service';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import {
  AsuntoObservacionesComponent
} from '@components/modals/asunto-observaciones/asunto-observaciones.component';
import {
  DelitosYPartesModalComponent
} from '@components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import {
  DescripcionModalComponent
} from '@components/modals/descripcion-modal/descripcion-modal.component';
import { HistorialDerivacionComponent } from '@components/modals/historial-derivacion/historial-derivacion.component';
import {
  ReasignadosModalComponent
} from '@components/modals/reasignados-modal/reasignados-modal.component';
import { VisorEfeModalComponent } from '@components/modals/visor-efe-modal/visor-efe-modal.component';
import { FilterComponent } from '@components/generales/filter/filter.component';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef, } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { delay, of, Subscription } from 'rxjs';
import { StringUtil, IconUtil, IconAsset, DateUtil, DateFormatPipe } from 'ngx-cfng-core-lib';
import { TokenService } from '@core/services/shared/token.service';

@Component({
  selector: 'app-listar-casos-por-recepcionar',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    CalendarModule,
    DividerModule,
    CheckboxModule,
    MessagesModule,
    ToastModule,
    DialogModule,
    DropdownModule,
    MenuModule,
    DateMaskModule,
    DynamicDialogModule,
    FormsModule,
    ReactiveFormsModule,
    FilterComponent,
    RadioButtonModule,
    CmpLibModule,
    DateFormatPipe,
    EncabezadoTooltipComponent,
    PaginatorComponent
  ],
  templateUrl: './listar-casos-por-recepcionar.component.html',
  providers: [MessageService, DialogService],
})
export class ListarCasosPorRecepcionarComponent implements OnInit {
  public tooltipVisible: boolean = false;
  public LECTURA_CASO = LECTURA_CASO;
  //private filterOptions: FilterOptionModel[];
  protected referenciaModal!: DynamicDialogRef;
  protected formularioFiltrarCasos!: FormGroup;
  private subscriptions: Subscription[] = [];
  protected casosSeleccionados = [];
  public totalCasosRecepcionar: number = 0;
  protected query: any = { limit: 10, page: 1, where: {} };
  public resetPage: boolean = false;
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  public casosPorRecepcionar: CasoPorRecepcionar[] = [];
  protected casosPorRecepcionarFiltrados: CasoPorRecepcionar[] = [];
  protected totalDentroPlazo: number = 0;
  protected totalPorVencer: number = 0;
  protected totalVencido: number = 0;
  protected tituloTootip: string = "Se mostrará en color:";
  protected contadorRegistrosPrevio: number = 0;
  protected contadorRegistros: number = 0;
  protected plazos: ResponseCatalogModel;
  protected origen: ResponseCatalogModel;
  protected loading: boolean = true;
  protected headExportPDF = [NOMBRES_CABECERA_RECEPCION];
  protected mostrarFiltros = false;
  public opcionesMenu!: MenuItem[];
  public emptyMessage='  No se encontraron registros.';
  public casoLeidoTemporal: boolean = false;
  public nombreFiscal: string = ''; 
          

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private dialogService: DialogService,
    private messageService: MessageService,
    private maestroService: MaestroService,
    private recepcionConsultasService: RecepcionConsultasService,
    private exportarService: ExportarService,
    protected stringUtil: StringUtil,
    protected iconAsset: IconAsset,
    protected dateUtil: DateUtil,
    protected iconUtil: IconUtil,
    private tokenService: TokenService
  ) {
    //this.filterOptions = FILTER_OPTIONS;

    this.plazos = { isLoading: false, data: [] };
    this.origen = { isLoading: false, data: [] };
  }

  first = CONSTANTE_PAGINACION.FIRST;
  rows = CONSTANTE_PAGINACION.ROWS;

  ngOnInit(): void {
    this.nombreFiscal = this.obtenerNombreFiscal();// this.tokenService.getDecoded().usuario;
    this.loading = false;
    this.getTipoPlazo();
    this.getOrigenCaso();
    this.formBuild();
    this.getCasosPorRecepcionar();
    this.getContador();
  }
  toggleTooltip: () => void = () => {
    
    this.tooltipVisible = !this.tooltipVisible;
  }
  showTooltip(): void {
    this.tooltipVisible = true;
    
  }
  public obtenerOpcionesMenu(data: any): void {
    this.opcionesMenu = [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarVisorDocumental(data.idCaso, data.codCaso);
          this.registarCasoLeido(data.idCaso, data.leido);
        },
      },
      {
        label: 'Ver asuntos y observaciones',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarAsuntoObservaciones(data.idCaso, data.codCaso);
          this.registarCasoLeido(data.idCaso, data.leido);
        },
      },
    ];
  }

  getContador() {
    this.recepcionConsultasService.contadorActual.subscribe(contador => {
      if (this.contadorRegistrosPrevio === 0 && contador > 0) {
        this.getCasosPorRecepcionar();
      }
      this.contadorRegistrosPrevio = this.contadorRegistros;
      this.contadorRegistros = contador;
    });
  }

  getTipoPlazo() {
    this.plazos.isLoading = true;
    this.maestroService
      .getTipoPlazo()
      .subscribe({
        next: (data) => {
          this.plazos.data = data.data;
        },
      })
      .add(() => (this.plazos.isLoading = false));
  }

  getOrigenCaso() {
    this.origen.isLoading = true;
    this.maestroService
      .obtenerOrigen()
      .subscribe({
        next: (data) => {
          this.origen.data = data.data;
        },
      })
      .add(() => (this.origen.isLoading = false));
  }

  public eventoMostrarOcultarFiltros(): void {
    //this.busquedaAvanzada = true;
    this.mostrarFiltros = !this.mostrarFiltros;
    this.mostrarFiltros &&
      this.formularioFiltrarCasos.get('tiempoAFiltrar')!.setValue('1');
    if (!this.mostrarFiltros) {
      this.limpiarFiltros();
      this.getCasosPorRecepcionar();
    }
  }

  public recibirCasos(): void {
    if (this.casosSeleccionados.length === 0)
      return this.messageService.add({
        severity: 'warn',
        detail: 'Debe seleccionar al menos un caso para realizar la recepción',
      });
    const casosPorRecibir: CasoIdRequest[] = [];
    this.casosSeleccionados.forEach((caso: CasoPorRecepcionar) => {
      let idCaso: any = { idCaso: caso.idCaso, codCaso: caso.codCaso };
      casosPorRecibir.push(idCaso);
    });

    const txtCodCasos = casosPorRecibir.map(caso => caso.codCaso).join('<br>');

   
    let casosN: number = casosPorRecibir.length;
    let singular: boolean = casosPorRecibir.length === 1;
    

    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'quest',
        title: '¿Desea confirmar recepción?',//`Confirmar asignación de ${singular ? 'caso' : 'casos'}`,
        description: `Se recepcionará ${casosN} ${
          singular ? ' caso ' : ' casos'
        } al fiscal <span class='bold'>${this.nombreFiscal}</span>.¿Está seguro de realizar la siguiente acción?`,
        confirmButtonText: 'Confirmar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    this.referenciaModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.recepcionarCaso(casosPorRecibir);
        }
      },
    });
  }

  private recepcionarCaso(request: CasoIdRequest[]): void {
    const txtCodCasos = request.map(caso => caso.codCaso).join('<br>');
    this.recepcionConsultasService.recepcionarCasos(request).subscribe({
      next: (resp) => {
        if (resp.code === 200) {
          this.limpiarFiltros();
          const sText = request.length === 1 ? '' : 's';
          const recepcionText =
            request.length === 1 ? 'recepcionó ' : 'recepcionaron ';
          const titlemodal = `Caso${sText} recepcionado${sText} correctamente`;
          const descriptionModal = `Se ${recepcionText}  <span class='bold'>${request.length}</span>  caso${sText} al fiscal <span class='bold'>${this.nombreFiscal}</span>.`;
          this.abrirModalConfirmOrError(
            'success',
            titlemodal,
            descriptionModal
          );
        //  const recepcionText = request.length === 1 ? 'recibio correctamente el' : 'recibieron correctamente los siguientes';
        //  if (this.referenciaModal) this.referenciaModal.close();
  
          this.getCasosPorRecepcionar();
        }
      },
      error: (error) => {
        const titlemodal = `Error al intentar realizar la asignación`;
          const descriptionModal =
            `${error.error.message}` || 'Ha ocurrido un error inesperado';
          this.abrirModalConfirmOrError('error', titlemodal, descriptionModal);
      },
    });
  }
 private abrirModalConfirmOrError(
    icon: String,
    title: String,
    description: String
  ):void {
    of(null).pipe(delay(200)).subscribe(()=>{
      this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
        width: '600px',
        showHeader: false,
        data: {
          icon,
          title,
          description,
          confirmButtonText: 'Aceptar',
        },
      } as DynamicDialogConfig<AlertaData>);
    })
   
  }
  obtenerCasosPorAsignar(): void {
    this.formularioFiltrarCasos.get('tiempoAFiltrar')!.setValue(1);
    this.getCasosPorRecepcionar();
  }

  getLosUltimosSeisMeses() {
    this.formularioFiltrarCasos.get('buscar')!.setValue("");
    this.getCasosPorRecepcionar();
  }

  getTodosLosMeses() {
    this.formularioFiltrarCasos.get('buscar')!.setValue("");
    this.getCasosPorRecepcionar();
  }

  private getCasosPorRecepcionar(): void {
    let filtroTiempo = this.formularioFiltrarCasos.get('tiempoAFiltrar')!.value;
    let fechaDesde =
      filtroTiempo == 1
        ? formatDate(
          this.formularioFiltrarCasos.get('fechaDesde')!.value,
          'yyyy-MM-dd',
          'es-ES'
        )
        : formatDate(new Date(1900, 0, 1), 'yyyy-MM-dd', 'es-ES');
    let fechaHasta = formatDate(
      this.formularioFiltrarCasos.get('fechaHasta')!.value,
      'yyyy-MM-dd',
      'es-ES'
    );
    let idPlazo = this.formularioFiltrarCasos.get('plazo')!.value || null;
    let idOrigen = this.formularioFiltrarCasos.get('origen')!.value || null;


    this.subscriptions.push(
      this.recepcionConsultasService.obtenerListaCasos(fechaDesde, fechaHasta, idPlazo, idOrigen)
        .subscribe({
          next: resp => {
            this.casosPorRecepcionar = resp.map((caso: any) => ({ ...caso, seleccionado: false }))
            this.casosPorRecepcionarFiltrados = this.casosPorRecepcionar
            this.casosSeleccionados = []
            this.itemPaginado.data.data = this.casosPorRecepcionarFiltrados
            this.itemPaginado.data.total = this.totalCasosRecepcionar = this.casosPorRecepcionarFiltrados.length
            this.obtenerContadores(resp);
            this.actualizarPaginaRegistros(this.casosPorRecepcionarFiltrados, true)
            this.filtrarCasos();
          },
          error: error => {
          }
        })
    )
  }

  public filtrarCasos(): void {
    let textoBusqueda = this.formularioFiltrarCasos.get('buscar')!.value;
    this.casosPorRecepcionarFiltrados = this.casosPorRecepcionar.filter((item:any) =>{
      console.log("los items",item)
    return  Object.values(item).some((fieldValue: any) =>
        (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
        fieldValue?.toString()?.toLowerCase().includes(textoBusqueda?.toLowerCase()) 
      ) ||

      (item.delitos &&
        item.delitos.some((delito: any) =>
          delito.nombre.toLowerCase().includes(textoBusqueda.toLowerCase())
        )) 
    
      }
    );
    this.emptyMessage='No se encontraron registros con los criterios de búsqueda ingresados.';
    this.itemPaginado.data.data = this.casosPorRecepcionarFiltrados
    this.itemPaginado.data.total = this.totalCasosRecepcionar = this.casosPorRecepcionarFiltrados.length
    this.actualizarPaginaRegistros(this.casosPorRecepcionarFiltrados, true)
    this.casosSeleccionados = []
  }

  private formBuild(): void {
    this.formularioFiltrarCasos = this.fb.group({
      buscar: [''],
      tiempoAFiltrar: ['1'],
      fechaDesde: [new Date(new Date().setMonth(new Date().getMonth() - 6))],
      fechaHasta: [new Date()],
      plazo: [null],
      origen: [null],
    });
  }

  public limpiarFiltros(): void {
    this.formBuild();
    this.getCasosPorRecepcionar();
    this.emptyMessage='No se encontraron registros.';
  }

  public verDelitosPartes(
    cantidad: number,
    numeroCaso: string,
    idCaso: string,
    leido: string
  ): void {
    this.registarCasoLeido(idCaso, leido);
    if (cantidad == 0) return;
    const verDelitosPartesRef = this.dialogService.open(
      DelitosYPartesModalComponent,
      {
        showHeader: false,
        width: '95%',
        contentStyle: { overflow: 'auto' },
        data: {
          numeroCaso,
        },
      }
    );
    verDelitosPartesRef.onClose.subscribe({
      //  next: () => this.getCasosPorRecepcionar(),
      error: (error) => {},
    });
  }

  public verReasignados(numeroCaso: string, idCaso: string): void {

    this.referenciaModal = this.dialogService.open(ReasignadosModalComponent, {
      showHeader: false,
      //contentStyle: { padding: '0', 'border-radius': '15px' },
      data: {
        idCaso: idCaso,
        caso: numeroCaso,
        titulo: 'Historial de asignación de ',
        descripcion: 'Ingrese una descripción rápida del caso',
      },
    });
  }

  public verHistorialDerivaciones(idTipoOrigen: number, numeroCaso: string, idCaso: string, coCaso: string): void {

    if (idTipoOrigen !== 6) {
      return;
    } else if (idTipoOrigen == 6) {
      this.referenciaModal = this.dialogService.open(HistorialDerivacionComponent, {
        width: '85%',
        contentStyle: { 'overflow-y': 'auto', 'padding': '1.5vw' },
        baseZIndex: 10000,
        showHeader: false,
        data: {
          numeroCaso: coCaso,
          idCaso: idCaso
        },
      })
    }
  }

  public clasificacionCaso(
    numeroCaso: string,
    idCaso: string,
    leido: string,
    clasificacion: string
  ): void {
    const clasificacionTRimmed= clasificacion.trim() || '';
    this.registarCasoLeido(idCaso, leido);
    this.referenciaModal = this.dialogService.open(DescripcionModalComponent, {
      showHeader: false,
      data: {
        tipo: 'clasificacion',
        idCaso: idCaso,
        caso: numeroCaso,
        titulo: 'Clasificación de caso (Opcional)',
        descripcion: 'Ingrese una descripción rápida del caso',
        contenido: clasificacionTRimmed,
      },
    });
    this.referenciaModal.onClose.subscribe({
      next: () => this.getCasosPorRecepcionar(),
      error: (error) => {},
    });
  }

  private mostrarAsuntoObservaciones(idCaso: string, numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(
      AsuntoObservacionesComponent,
      {
        width: '95%',
        contentStyle: { overflow: 'auto' },
        showHeader: false,
        data: {
          numeroCaso: numeroCaso,
          idCaso: idCaso,
          title: 'Asunto Observaciones',
          description: 'Hechos del caso',
        },
      }
    );
  }

  public obtenerClaseTipoOrigen(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase()
  }

  public obtenerNumeroCaso(numeroCaso: string, plazo: string): string {
    return  this.stringUtil.obtenerPlazoItem(plazo) + this.stringUtil.obtenerNumeroCaso(numeroCaso)
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.casosPorRecepcionarFiltrados.length > 0) {
      const data: any[] = [];

      this.casosPorRecepcionarFiltrados.forEach((c: CasoPorRecepcionar) => {
        const row = {
          'Número de Caso': c.codCaso,
          Origen: c.detalleTipoOrigen,
          Remitente: c.remitente,
          'Contacto de Remitente': c.numeroTelefono + ' / ' + c.correo,
          'Fecha de Ingreso': c.fechaIngreso,
          //'Fecha de Asignación': c.fechaAsignacion,
        };
        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(
          data,
          NOMBRES_CABECERA_RECEPCION,
          'Casos por Recepcionar',
          'landscape'
        )
        : this.exportarService.exportarAExcel(
          data,
          NOMBRES_CABECERA_RECEPCION,
          'Casos por Recepcionar'
        );
      return;
    }

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
  }

  private registarCasoLeido(idCaso: String, leido: string): void {
    if (leido == '1') {
      return;
    }
    let request: CasoLeidoRequest = {
      numeroCaso: idCaso,
      idEstadoCaso: 49, // 49: POR RECEPCIONAR
    };
    this.recepcionConsultasService.registrarCasoLeido(request).subscribe({
      next: (resp) => {
        if (resp.code === 0) {
          this.getCasosPorRecepcionar();
          this.casoLeidoTemporal = true;
        }
      },
      error: (error) => {
      },
    });
  }

  private mostrarVisorDocumental(idCaso: string, numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      contentStyle: { "padding": 0 },
      data: {
        caso: idCaso,
        numeroCaso: numeroCaso,
        idCaso: idCaso,
        title: 'Visor documental del caso:',
        description: 'Hechos del caso',
      },
    });
  }

  mensajeInfo(mensaje: any, submensaje: any) {
    this.dialogService.open(AlertaModalComponent, {
      width: '50%',
      showHeader: false,
      data: {
        icon: 'info',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      },
    } as DynamicDialogConfig<AlertaData>);
  }

  obtenerContadores(lista: CasoPorRecepcionar[]): void {
    this.totalDentroPlazo = lista.filter(
      (x) => x.indicadorSemaforo == 1
    ).length;
    this.totalPorVencer = lista.filter((x) => x.indicadorSemaforo == 2).length;
    this.totalVencido = lista.filter((x) => x.indicadorSemaforo == 3).length;
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage)
  }

  actualizarPaginaRegistros(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.casosPorRecepcionarFiltrados = data.slice(start, end);
  }
  validarFechas(controlName: String): void {
    const fechaInicio = this.formularioFiltrarCasos.get('fechaDesde')?.value;
    const fechaFin = this.formularioFiltrarCasos.get('fechaHasta')?.value;

    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
     
      if (controlName === 'fechaDesde') {
        this.formularioFiltrarCasos.get('fechaDesde')?.setValue(null);
        this.formularioFiltrarCasos.get('fechaDesde')?.setErrors({ incorrect: true });
      } else {
        this.formularioFiltrarCasos.get('fechaHasta')?.setValue(null);
        this.formularioFiltrarCasos.get('fechaHasta')?.setErrors({ incorrect: true });
      }
      this.messageService.add({
        severity: 'warn',
        detail: 'La fecha Inicial no puede ser mayor a la fecha Final',
      })
  
    }
  }
  public obtenerNombreFiscal(): string {
    return (
      this.tokenService.getDecoded().usuario.fiscal
    );
  }
  copiarAlPortapapeles(valor:string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(valor).then(() => {
      }).catch(err => {
        console.error('Error al copiar al portapapeles:', err);
      });
    }else {
      const textArea = document.createElement('textarea');
      textArea.value = valor;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
      }
      document.body.removeChild(textArea);
    }
  }
}
