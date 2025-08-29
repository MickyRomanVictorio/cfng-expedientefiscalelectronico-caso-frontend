import {Component, OnInit} from '@angular/core';
import {MenuItem, MessageService} from "primeng/api";
import {DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef} from "primeng/dynamicdialog";
import {CommonModule, DatePipe} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {CheckboxModule} from "primeng/checkbox";
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {DateFormatPipe} from "@pipes/format-date.pipe";
import {DateMaskModule} from "@directives/date-mask.module";
import {DialogModule} from "primeng/dialog";
import {DividerModule} from "primeng/divider";
import {DropdownModule} from "primeng/dropdown";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {MenuModule} from "primeng/menu";
import {MessagesModule} from "primeng/messages";
import {RadioButtonModule} from "primeng/radiobutton";
import {TableModule} from "primeng/table";
import {ToastModule} from "primeng/toast";
import {Subscription} from "rxjs";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {NgxSpinnerService} from "ngx-spinner";
import {MaestroService} from "@services/shared/maestro.service";
import {ExportarService} from "@services/shared/exportar.service";
import {ElevacionActuadosService} from "@services/superior/elevacion-actuados/elevacion-actuados.service";
import {AsignacionTransaccionalService} from "@services/provincial/asignacion/asignacion-transaccional.service";
import {obtenerIcono} from "@utils/icon";
import {
  DelitosYPartesModalComponent
} from "@components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component";
import {DescripcionModalComponent} from "@components/modals/descripcion-modal/descripcion-modal.component";
import {VisorEfeModalComponent} from "@components/modals/visor-efe-modal/visor-efe-modal.component";
import {
  AsuntoObservacionesComponent
} from "@components/modals/asunto-observaciones/asunto-observaciones.component";
import {
  ResponderCasoElevadoModalComponent
} from "@components/modals/responder-casos-elevados-modal/responder-casos-elevados-modal.component";
import {CasoLeidoRequest} from "@interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest";
import {AlertaModalComponent} from "@components/modals/alerta-modal/alerta-modal.component";
import {AlertaData} from "@interfaces/comunes/alert";
import {TipoArchivoType} from "@core/types/exportar.type";
import {EncabezadoTooltipComponent} from "@components/modals/encabezado-tooltip/encabezado-tooltip.component";
import {PaginatorComponent} from "@components/generales/paginator/paginator.component";
import {LECTURA_CASO} from "@core/types/efe/provincial/administracion-casos/asignacion/recepcion-casos.type";
import {ContiendasCompetenciaService} from "@services/superior/contiendas/contiendasCompetencia";
import {BuscarContiendasRequest} from "@interfaces/superior/contiendas/buscarContiendasRequest";
import {ContiendasCompetencias} from "@interfaces/superior/contiendas/ContiendasCompetencia";
import {DataService} from "@modules/superior/administracion-casos/consulta-casos/listar-casos/DataService";
import {
  ResponderContiendasSuperiorComponent
} from "@components/modals/responder-contiendas-superior/responder-contiendas-superior.component";

@Component({
  selector: 'app-listar-exclusion-fiscal-superior',
  templateUrl: '../../contiendas-superior/listar-contiendas/listar-contiendas.component.html',
  styleUrls: ['./listar-exclusiones.component.scss'],
  standalone: true,
  imports: [
    CalendarModule,
    CheckboxModule,
    CmpLibModule,
    CommonModule,
    DateFormatPipe,
    DateMaskModule,
    DialogModule,
    DividerModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    FormsModule,
    InputTextModule,
    MenuModule,
    MessagesModule,
    RadioButtonModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    EncabezadoTooltipComponent,
    PaginatorComponent
  ],
  providers: [MessageService, DialogService, DatePipe],
})
export class ListarExclusionFiscalSuperiorComponent implements OnInit {

  protected tituloTootip: string = "Se mostrará en color:";
  protected LECTURA_CASO = LECTURA_CASO
  protected query: any = {limit: 10, page: 1, where: {}}
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  ref!: DynamicDialogRef;
  public fiscalias:any[] = [];
  public despachos:any[] = [];
  protected motivos:any[] = [];
  public origen:any[] = [];
  public leyenda:any[] = [];
  private totalCasosAsignar: number = 0;
  protected contiendasCompetenciasList: ContiendasCompetencias[] = [];
  public contiendasFiltrados: ContiendasCompetencias[] = [];
  public casosSeleccionados: ContiendasCompetencias[] = [];
  public mostrarFiltros = false;

  public formularioFiltrarCasos!: FormGroup;
  public fiscalPorAsignar = new FormControl(null);

  public referenciaModal!: DynamicDialogRef;
  public subscriptions: Subscription[] = [];
  public nombreFiscal!: String
  public nombreFiscalia!: String

  public nombreOrigen: any = '*';
  public nombreDespacho: any = '*';
  public nombrePlazo: any = '*';
  public nombreRemitente: any = '*';
  public fechaOrigenSeleccionada: any = '*';
  public fechaFinSeleccionada: any = '*';
  public formReseteado: boolean = false;
  leido: any = 1;

  opcionesMenu: (data: any) => MenuItem[] = ()=>[];

  constructor(
    private formulario: FormBuilder,
    private sanitizer: DomSanitizer,
    //private spinner: NgxSpinnerService,
    private maestrosService: MaestroService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private exportarService: ExportarService,
    private datePipe: DatePipe,
    public maestroService: MaestroService,
    public contiendasService: ContiendasCompetenciaService
  ) {
  }

  ngOnInit(): void {
    this.formBuild()
    //this.obtenerOrigen()
    this.getDependenciaFiscal()
    //this.getMotivos()
    //this.obtenerCasosElevacionActuados()
    this.listarContiendas()
    this.opcionesMenu = (data: any) => [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarVisorDocumental(data.idCaso, data.codCaso);
          this.registarCasoLeido(data.idCaso, data.esLeido);
        }
      },
      {
        label: 'Ver asuntos y observaciones',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarAsuntoObservaciones(data.idCaso, data.codCaso)
          this.registarCasoLeido(data.idCaso, data.leido)
        }
      },
      {
        label: 'Responder caso',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarModalResponderContienda(data)
        }
      },
    ];
  }

  private formBuild(): void {

    this.formularioFiltrarCasos = this.formulario.group({
      buscar: [''],
      fiscalia: [null],
      despacho: [null],
      remitente: [null],
      tiempoAFiltrar: ['ultimoSeisMeses'],
      fechaDesde: [new Date(new Date().setMonth(new Date().getMonth() - 6))],
      fechaHasta: [new Date()],
      motivo: [null],
    })

  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  getDependenciaFiscal(): void {
    this.subscriptions.push(
      this.maestroService.getFiscalias().subscribe({
        next: resp => {
          this.fiscalias = resp.data
        },
        error: (error) => {
          this.fiscalias = []
        }
      })
    )
  }

  getDespacho(idFiscalias: number): void {

    if (idFiscalias === null) {
      this.despachos = []
    } else {
      this.subscriptions.push(
        this.maestroService.getDespacho(idFiscalias).subscribe({
          next: resp => {
            this.despachos = resp.data
          },
          error: (error) => {
            this.despachos = []
          }
        })
      )
    }
  }

  getMotivos(): void {
    this.subscriptions.push(
      this.maestroService.getCatalogo("IN_N_MOTIVO_COMPETENCIA").subscribe({
        next: resp => {
          this.motivos = resp.data
        },
        error: (error) => {
          this.motivos = []
        }
      })
    )
  }

  private obtenerOrigen(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerOrigen().subscribe({
        next: resp => [
          this.origen = resp.data
        ]
      })
    )
  }

  private obtenerLeyenda(contiendasFiltrados: Array<ContiendasCompetencias>): void {
    var nroCasosDentroPlazo = 0;
    var nroCasosPorVencer = 0;
    var nroCasosFueraplazo = 0;

    contiendasFiltrados.forEach(caso => {
      if ((caso.semaforoNumero == "1")) {
        nroCasosDentroPlazo += 1;
      } else if ((caso.semaforoNumero == "2")) {
        nroCasosPorVencer += 1;
      } else if ((caso.semaforoNumero == "3")) {
        nroCasosFueraplazo += 1;
      }
    })

    let respuesta = [];
    let leyenda = {"nombrePlazo": "Dentro del plazo", "cantidad": nroCasosDentroPlazo};
    respuesta.push(leyenda);
    leyenda = {"nombrePlazo": "Plazo por vencer", "cantidad": nroCasosPorVencer};
    respuesta.push(leyenda);
    leyenda = {"nombrePlazo": "Plazo vencido", "cantidad": nroCasosFueraplazo};
    respuesta.push(leyenda);
    this.leyenda = respuesta;
  }

  seleccionarFechaInicio(event:any) {
    let d = new Date(Date.parse(event));
    this.fechaOrigenSeleccionada = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  }

  seleccionarFechaFin(event:any) {
    let d = new Date(Date.parse(event));
    this.fechaFinSeleccionada = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  changeFiscalia(idFiscalia: number) {
    this.getDespacho(idFiscalia);
  }

  DateToNumber(fecha: String) {
    let arrayFecha: any = fecha.split("/");
    return (arrayFecha[0] * 1) + (arrayFecha[1] * 1) * 30 + (arrayFecha[2] * 1) * 360;
  }

  public buscarDataPorMeses() {
    let fechaInicio = new Date(new Date().setMonth(new Date().getMonth() - 6))
    if (this.formularioFiltrarCasos.get('tiempoAFiltrar')!.value === 'todosLosMeses')
      fechaInicio = new Date('1999-01-01T00:00:01')

    this.formularioFiltrarCasos.patchValue({
      buscar: '',
      fechaDesde: fechaInicio,
      fechaHasta: new Date(),
      fiscalia: null,
      despacho: null,
      motivo: null,
    })

    this.listarContiendas()
  }

  protected listarContiendas(): void {
    console.log("recargando la lista....")
    let form = this.formularioFiltrarCasos.getRawValue()
    if (!form.fechaDesde || !form.fechaHasta) {
      this.formularioFiltrarCasos.get('tiempoAFiltrar')!.setValue('todosLosMeses')
      this.buscarDataPorMeses()
      return
    }

    let request: BuscarContiendasRequest = {
      fechaDesde: this.datePipe.transform(form.fechaDesde, 'dd-MM-yyyy')!,
      fechaHasta: this.datePipe.transform(form.fechaHasta, 'dd-MM-yyyy')!,
      fiscalia: form.fiscalia,
      despacho: form.despacho,
      motivo: form.motivo,
    }

    this.subscriptions.push(
      this.contiendasService.contiendasCompetenciasList(request).subscribe({
        next: resp => {
          if (resp.code === 0) {
            this.contiendasCompetenciasList = resp.data.map( (caso:any) => ({...caso, seleccionado: false}))
            this.contiendasFiltrados = this.contiendasCompetenciasList
            this.casosSeleccionados = []
            this.itemPaginado.data.data = this.contiendasFiltrados
            this.itemPaginado.data.total = this.totalCasosAsignar = this.contiendasCompetenciasList.length
            this.obtenerLeyenda(this.contiendasFiltrados)
            this.actualizarPaginaRegistros(this.contiendasCompetenciasList)
          }
        },
        error: error => {
          console.error(error)
        }
      })
    )
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros
    this.mostrarFiltros && this.formularioFiltrarCasos.get('tiempoAFiltrar')!.setValue('ultimoSeisMeses');
    this.mostrarFiltros && this.buscarDataPorMeses()
  }

  public filtrarCasos(): void {
    //console.log("mostrando vlaores del texto:")
    let textoBusqueda = this.formularioFiltrarCasos.get('buscar')!.value;
    this.contiendasFiltrados = this.contiendasCompetenciasList.filter(item =>
      Object.values(item).some((fieldValue: any) =>
        (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
        fieldValue?.toString()?.toLowerCase().includes(textoBusqueda?.toLowerCase())
      )
    );
    console.log("text: ", textoBusqueda," ;mostrando vlaores del texto:", this.contiendasFiltrados.length)
    this.itemPaginado.data.data = this.contiendasFiltrados
    this.itemPaginado.data.total = this.totalCasosAsignar = this.contiendasFiltrados.length
    this.actualizarPaginaRegistros(this.contiendasFiltrados)

    this.casosSeleccionados = []
  }

  public limpiarFiltros(): void {
    this.formBuild()
    this.listarContiendas()
  }

  public verDelitosPartes(numeroCaso: string, idCaso: string, leido: string): void {
    this.registarCasoLeido(idCaso, leido);
    const verDelitosPartesRef = this.dialogService.open(DelitosYPartesModalComponent, {
      showHeader: false,
      data: {
        numeroCaso,
      }
    })
    verDelitosPartesRef.onClose.subscribe({
      next: (data) => {
      },
      error: error => console.error(error)
    })
  }

  public clasificacionCaso(numeroCaso: string, idCaso: string, leido: string, clasificacion: string): void {
    this.registarCasoLeido(idCaso, leido);
    this.referenciaModal = this.dialogService.open(DescripcionModalComponent, {
      showHeader: false,
      data: {
        tipo: 'clasificacion',
        idCaso: idCaso,
        caso: numeroCaso,
        titulo: 'Clasificación de caso (Opcional)',
        descripcion: 'Ingrese la clasificación del caso',
        contenido: clasificacion,
      }
    });

    this.referenciaModal.onClose.subscribe({
      next: () => {
      },
      error: error => console.error(error)
    })
  }

  private mostrarVisorDocumental(idCaso: string, numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      //   contentStyle: { 'padding':'0', 'border-radius': '15px' },
      data: {
        caso: idCaso,
        numeroCaso: numeroCaso,
        idCaso: idCaso,
        title: 'Visor documental del caso:',
        description: 'Hechos del caso',
      }
    })
  }

  private mostrarAsuntoObservaciones(idCaso: string, numeroCaso: string): void {
    console.log("mostrarAsuntoObservaciones: " , idCaso, numeroCaso)
    this.referenciaModal = this.dialogService.open(AsuntoObservacionesComponent, {
      showHeader: false,
      data: {
        numeroCaso: numeroCaso,
        idCaso: idCaso,
        title: 'Asunto Observaciones',
        description: 'Hechos del caso',
      }
    })
  }

  private mostrarModalResponderContienda(registroElevacion: any): void {
    this.referenciaModal = this.dialogService.open(ResponderContiendasSuperiorComponent, {
      showHeader: false,
      closable: false,
      closeOnEscape: false,
      data: {
        titulo: 'RESPONDER CONTIENDA DE COMPETENCIA',
        registroElevacion: registroElevacion
      }
    })
    this.referenciaModal.onClose.subscribe((confirm) => {
      //console.log("confirm", confirm)
        this.listarContiendas();
    });
  }

  private registarCasoLeido(idCaso: String, leido: string): void {
    if (leido == "1") return
    let request: CasoLeidoRequest = {
      numeroCaso: idCaso,
      idEstadoCaso: 10// 10: contienda de competencia
    }

    //this.spinner.show()
    this.contiendasService.registrarCasoLeido(request).subscribe({
      next: resp => {
        //this.spinner.hide()
        if (resp.code === 200) {
          this.listarContiendas()
        }
      },
      error: (error) => {
        console.log(`${error.error.code} ${error.error.message}`)
        //this.spinner.hide()
      }
    })
  }

  public exportarPdfExcel(exportType: TipoArchivoType): void {
    console.log("LENGTH: ", this.contiendasCompetenciasList.length)
    if (this.contiendasCompetenciasList.length > 0) {

      const headers = ['Número de caso', 'Tipo - Motivo', 'Fisalia de procedencia', 'Fecha elevación al despacho']
      const data:any[] = [];

      this.contiendasCompetenciasList.forEach((caso: ContiendasCompetencias) => {
        const row = {
          'Número de caso': caso.codCaso,
          'Tipo - Motivo': caso.descripContienda+  " - "+ caso.tipoContienda,
          'Fisalia de procedencia': caso.fiscalAsignado+" "+caso.despacho+" "+caso.entidad+ " "+ caso.jerarquia,
          'Fecha elevación al despacho': caso.fechaIngreso+ " - "+caso.hora
        }
        data.push(row)
      })

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Contiendas')
        : this.exportarService.exportarAExcel(data, headers, 'Contiendas por competencia')
      return;
    }
    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`
    })
  }

  public obtenerClaseDeOrigen(name: string): string {
    let semaforo = 'dentro-del-plazo';
    if (name == "2") {
      semaforo = 'plazo-por-vencer';
    } else if (name == "3") {
      semaforo = 'plazo-vencido';
    }
    //console.log("semaforo: ", semaforo," nombre: ", name)
    return semaforo;
  }

  public obtenerClaseDeOrigen2(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase()
  }

  public obtenerNumeroCaso(numeroCaso: string, plazo: string): SafeHtml {
    const caso = numeroCaso.split('-')
    const plazoHtml = `<span class="plazo-item ${this.obtenerClaseDeOrigen(plazo)}"></span>`
    const casoHtml = `<div class="cfe-caso">${caso[0]}-<span>${caso[1]}-${caso[2]}</span>-${caso[3]}</div>`
    return this.sanitizer.bypassSecurityTrustHtml(plazoHtml + casoHtml);
  }

  mensajeInfo(mensaje:any, submensaje:any) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'info',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      }
    } as DynamicDialogConfig<AlertaData>)
  }

  onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.actualizarPaginaRegistros(this.contiendasCompetenciasList)
  }

  actualizarPaginaRegistros(data: any) {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.contiendasFiltrados = data.slice(start, end);
  }


}
