import {CommonModule, DatePipe} from "@angular/common";
import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {AlertaData} from "@interfaces/comunes/alert";
import {
  AsignarCasoRequest,
  CasoLeidoRequest
} from "@interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest";
import {ElevacionActuadosService} from "@services/superior/elevacion-actuados/elevacion-actuados.service";
import {AsignacionTransaccionalService} from "@services/provincial/asignacion/asignacion-transaccional.service";
import {ExportarService} from "@services/shared/exportar.service";
import {MaestroService} from "@services/shared/maestro.service";
import {TipoArchivoType} from "@core/types/exportar.type";
import {AlertaModalComponent} from "@components/modals/alerta-modal/alerta-modal.component";
import {
  DelitosYPartesModalComponent
} from "@components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component";
import {
  DescripcionModalComponent
} from "@components/modals/descripcion-modal/descripcion-modal.component";
import {DateMaskModule} from "@directives/date-mask.module";
import {DateFormatPipe} from "@pipes/format-date.pipe";
import {cleanEmptyFields} from "@utils/utils";
import {MenuItem, MessageService} from "primeng/api";
import {RadioButtonModule} from 'primeng/radiobutton';
import {CalendarModule} from "primeng/calendar";
import {CheckboxModule} from "primeng/checkbox";
import {DialogModule} from "primeng/dialog";
import {DividerModule} from "primeng/divider";
import {DropdownModule} from "primeng/dropdown";
import {DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef} from "primeng/dynamicdialog";
import {InputTextModule} from "primeng/inputtext";
import {MenuModule} from "primeng/menu";
import {MessagesModule} from "primeng/messages";
import {TableModule} from "primeng/table";
import {ToastModule} from "primeng/toast";
import {Subscription} from 'rxjs';
import {NgxSpinnerService} from 'ngx-spinner';
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {obtenerIcono} from "@utils/icon";
import {
  AsuntoObservacionesComponent
} from "@components/modals/asunto-observaciones/asunto-observaciones.component";
import {
  PrevisualizarDocumentoModalComponent
} from "@components/modals/visor-documental-caso-elevado/previsualizar-documento-modal.component";
import {
  BuscarCasosElevacionActuadosRequest
} from "@interfaces/provincial/tramites/elevacion-actuados/BuscarCasosElevacionActuadosRequest";
import {CasoElevacionActuado} from "@interfaces/provincial/tramites/elevacion-actuados/CasoElevacionActuado";
import {ActivatedRoute} from "@angular/router";
import {
  ResponderCasoElevadoModalComponent
} from "@components/modals/responder-casos-elevados-modal/responder-casos-elevados-modal.component";
import {VisorEfeService} from "@services/visor/visor.service";
import {BuscarContiendasRequest} from "@interfaces/superior/contiendas/buscarContiendasRequest";
import {LECTURA_CASO} from "@core/types/efe/provincial/administracion-casos/asignacion/recepcion-casos.type";
import {PaginatorComponent} from "@components/generales/paginator/paginator.component";

@Component({
  selector: 'app-listar-casos-elevacion-actuados',
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
    PaginatorComponent
  ],
  templateUrl: './listar-casos-elevacion-actuados.component.html',
  styleUrls: ['./listar-casos-elevacion-actuados.component.scss'],
  providers: [MessageService, DialogService, DatePipe],
})
export class ListarCasosElevacionActuadosComponent implements OnInit {

  public fiscalesPorAsignar:any[] = [];
  public fiscalias:any[] = [];
  public despachos:any[] = [];
  public origen:any[] = [];
  public leyenda:any[] = [];
  public casoElevacionActuado: CasoElevacionActuado[] = [];
  public casoElevacionActuadoFiltrados: CasoElevacionActuado[] = [];
  public casosSeleccionados: CasoElevacionActuado[] = [];
  public mostrarFiltros = false;
  private totalCasosAsignar: number = 0;
  public formularioFiltrarCasos!: FormGroup;
  public fiscalPorAsignar = new FormControl(null);
  protected LECTURA_CASO = LECTURA_CASO;
  public referenciaModal!: DynamicDialogRef;
  public subscriptions: Subscription[] = [];
  public nombreFiscal!: String;
  public nombreFiscalia!: String;

  public nombreOrigen: any = '*';
  public nombreDespacho: any = '*';
  public nombrePlazo: any = '*';
  public nombreRemitente: any = '*';
  public fechaOrigenSeleccionada: any = '*';
  public fechaFinSeleccionada: any = '*';
  public formReseteado: boolean = false;
  leido: any = 1;
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

  opcionesMenu: (data: any) => MenuItem[] = ()=>[];

  constructor(
    private formulario: FormBuilder,
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private maestrosService: MaestroService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private exportarService: ExportarService,
    private datePipe: DatePipe,
    private elevacionActuadosService: ElevacionActuadosService,
    private asignacionTransaccionalService: AsignacionTransaccionalService,
    private dataService: VisorEfeService,
    public maestroService: MaestroService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.formBuild()
    //this.obtenerPlazos()
    this.obtenerOrigen()
    this.getDependenciaFiscal()
    // this.obtenerFiscales()
    this.obtenerCasosElevacionActuados()
    this.opcionesMenu = (data: any) => [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          //data.id = "0FB5FD1CF763B38CE0650250569D508A"
          this.elevacionActuadosService.getInformacionDocumental(data.idCaso, data.idTipoElevacion, data.idActoTramiteCaso).subscribe(response => {
            if (response.codigoCaso == null) {
              this.mensajeInfo("", "Identificador de caso nulo");
            } else {
              this.mostrarVisorDocumental(response);
            }
            },
            error => {
              //this.mostrarVisorDocumental(data.idCaso, data.codigoCaso);
              this.mensajeInfo(""/*data.idCaso*/, "Identificador de caso nulo");
            },
          )
        }
      },
      {
        label: 'Ver asuntos y observaciones',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarAsuntoObservaciones(data.id, data.codigoCaso)
          this.registarCasoLeido(data.idCaso, data.leido)
        }
      },
      {
        label: 'Responder caso',
        icon: 'trash-icon',
        command: () => {
          this.mostrarModalResponderCasoElevado(data)
          //this.registarCasoLeido(data.idCaso, data.esLeido);
          //this.anularCaso(data.idCaso, data.codigoCaso)
        }
      },
    ];
    // this.verDelitosPartes("506014501-2021-590-0")
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

  /*  private obtenerFiscales(): void {
       this.subscriptions.push(
           this.elevacionActuadosService.obtenerFiscales().subscribe({
             next: resp => {
                 this.fiscalesPorAsignar = resp
             },
             error: error => {
             }
           })
       )
   } */

  getDependenciaFiscal(): void {
    this.subscriptions.push(
      this.maestrosService.getFiscalias().subscribe({
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

  private obtenerPlazos(): void {
    this.subscriptions.push(
      this.maestrosService.getTipoPlazo().subscribe({

        next: resp => {

          this.despachos = resp.data
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

  private obtenerLeyenda(casoElevacionActuadoFiltrados:any): void {
    var nroCasosDentroPlazo = 0;
    var nroCasosPorVencer = 0;
    var nroCasosFueraplazo = 0;

    casoElevacionActuadoFiltrados.forEach( (caso:any) => {
      if ((caso.semaforoNro == "1")) {
        nroCasosDentroPlazo += 1;
      } else if ((caso.semaforoNro == "2")) {
        nroCasosPorVencer += 1;
      } else if ((caso.semaforoNro == "3")) {
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

  seleccionarFechaInicio( event:any) {
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


  obtenerCasosElevacionActuadosGrilla(): void {
    if (this.formReseteado === true) {
      this.casoElevacionActuadoFiltrados = this.casoElevacionActuado;
      this.formReseteado = false;
      return
    }

    const criterioBusqueda = this.formularioFiltrarCasos.get('buscar')!.value
    this.casoElevacionActuadoFiltrados = [];
    let casosSeleccionados: any = []

    this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue?.toString()?.toLowerCase().includes(criterioBusqueda?.toLowerCase())
      )
    );

    const criterioBusqueda2 = this.formularioFiltrarCasos.get('remitente')!.value
    this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue?.toString()?.toLowerCase().includes(criterioBusqueda2?.toLowerCase())
      )
    );

    if (this.nombreFiscalia !== '*' && (typeof this.nombreFiscalia !== "undefined")) {
      this.casoElevacionActuadoFiltrados = casosSeleccionados
      this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
        Object.values(item).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
            fieldValue?.toString()?.toLowerCase().includes(this.nombreFiscalia?.toLowerCase())
        )
      );
    }

    if (this.nombreOrigen !== '*' && (typeof this.nombreOrigen !== "undefined")) {
      this.casoElevacionActuadoFiltrados = casosSeleccionados
      this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
        Object.values(item).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
            fieldValue?.toString()?.toLowerCase().includes(this.nombreOrigen?.toLowerCase())
        )
      );
    }
    if (this.nombreDespacho !== '*' && (typeof this.nombreDespacho !== "undefined")) {
      this.casoElevacionActuadoFiltrados = casosSeleccionados
      this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
        Object.values(item).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
            fieldValue?.toString()?.toLowerCase().includes(this.nombreDespacho?.toLowerCase())
        )
      );
    }

    if (this.fechaOrigenSeleccionada !== '*' && this.fechaFinSeleccionada !== '*') {
      let fechaSeleccionadoNumerosOrigen = this.DateToNumber(this.fechaOrigenSeleccionada)
      let fechaSeleccionadoNumerosDestino = this.DateToNumber(this.fechaFinSeleccionada)
      this.casoElevacionActuadoFiltrados.forEach(caso => {
        if ((this.DateToNumber(caso.fechaElevacion)) >= fechaSeleccionadoNumerosOrigen &&
          (this.DateToNumber(caso.fechaElevacion)) <= fechaSeleccionadoNumerosDestino) {
          casosSeleccionados.push(caso)
        }
      })
      this.casoElevacionActuadoFiltrados = casosSeleccionados
    }

    if (this.fechaOrigenSeleccionada !== '*' && (this.fechaFinSeleccionada == "*")) {
      let fechaSeleccionadoNumerosOrigen = this.DateToNumber(this.fechaOrigenSeleccionada)
      this.casoElevacionActuadoFiltrados.forEach(caso => {
        if ((this.DateToNumber(caso.fechaElevacion)) >= fechaSeleccionadoNumerosOrigen) {
          casosSeleccionados.push(caso)
        }
      })
      this.casoElevacionActuadoFiltrados = casosSeleccionados
    }

    if (this.fechaOrigenSeleccionada == '*' && (this.fechaFinSeleccionada != "*")) {
      let fechaSeleccionadoNumerosDestino = this.DateToNumber(this.fechaFinSeleccionada)
      this.casoElevacionActuadoFiltrados.forEach(caso => {
        if ((this.DateToNumber(caso.fechaElevacion)) <= fechaSeleccionadoNumerosDestino) {
          casosSeleccionados.push(caso)
        }
      })
      this.casoElevacionActuadoFiltrados = casosSeleccionados
    }
    this.obtenerLeyenda(this.casoElevacionActuadoFiltrados)
    this.formReseteado = false;

  }

  private timeout?: number;

  onInput(value: string): void {
    window.clearTimeout(this.timeout);

    this.timeout = window.setTimeout(() => {
      this.obtenerCasosElevacionActuadosGrilla();
    }, 700);
  }

  onInputRemitente(value: string): void {
    window.clearTimeout(this.timeout);

    this.timeout = window.setTimeout(() => {
      this.obtenerCasosElevacionActuadosGrilla();
    }, 700);
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

    this.obtenerCasosElevacionActuados()
  }

  private obtenerCasosElevacionActuados(): void {
    console.log("recargando la lista....")
    let form = this.formularioFiltrarCasos.getRawValue()
    if (!form.fechaDesde || !form.fechaHasta) {
      this.formularioFiltrarCasos.get('tiempoAFiltrar')!.setValue('todosLosMeses')
      this.buscarDataPorMeses()
      return
    }

    let request: BuscarCasosElevacionActuadosRequest = {
      fechaDesde: this.datePipe.transform(form.fechaDesde, 'dd-MM-yyyy')!,
      fechaHasta: this.datePipe.transform(form.fechaHasta, 'dd-MM-yyyy')!,
      fiscalia: form.fiscalia,
      despacho: form.despacho
    }

    this.subscriptions.push(
      this.elevacionActuadosService.elevacionActuadosList(request).subscribe({
        next: resp => {
            this.casoElevacionActuado = resp.map( (caso:any) => ({...caso, seleccionado: false}))
            this.casoElevacionActuadoFiltrados = this.casoElevacionActuado
            this.casosSeleccionados = []
            this.itemPaginado.data.data = this.casoElevacionActuadoFiltrados
            this.itemPaginado.data.total = this.totalCasosAsignar = this.casoElevacionActuado.length
            this.obtenerLeyenda(this.casoElevacionActuadoFiltrados)
            this.actualizarPaginaRegistros(this.casoElevacionActuado)
        },
        error: error => {
          console.error(error)
        }
      })
    )
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros
    //this.mostrarFiltros && this.formularioFiltrarCasos.get('tiempoAFiltrar').setValue('ultimosMeses')
  }

  public filtrarCasos(value: string): void {
    this.casoElevacionActuadoFiltrados = this.casoElevacionActuado.filter(item =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue?.toString()?.toLowerCase().includes(value?.toLowerCase())
      )
    );
    this.casosSeleccionados = []
  }

  public limpiarFiltros(): void {
    this.fechaOrigenSeleccionada = '*';
    this.fechaFinSeleccionada = '*';
    this.formReseteado = true
    this.formularioFiltrarCasos.reset()
    this.obtenerCasosElevacionActuados()
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
      next: () => this.obtenerCasosElevacionActuados(),
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
      next: () => this.obtenerCasosElevacionActuados(),
      error: error => console.error(error)
    })
  }

  private anularCaso(idCaso: string, numeroCaso: string): void {
    const anularCasoRef = this.dialogService.open(DescripcionModalComponent, {
      showHeader: false,
      data: {
        caso: numeroCaso,
        idCaso: idCaso,
        titulo: 'Motivo de anulación del caso',
        descripcion: 'Ingrese motivo de anulación',
      }
    })
    anularCasoRef.onClose.subscribe({
      next: () => this.obtenerCasosElevacionActuados(),
      error: error => console.error(error)
    })
  }

  private mostrarVisorDocumental(informacion: any): void {
    this.referenciaModal = this.dialogService.open(PrevisualizarDocumentoModalComponent, {
      width: '95%',
      showHeader: false,
         contentStyle: { 'padding':'0', 'border-radius': '15px' },
      data: {...informacion}
    })
  }

  private mostrarAsuntoObservaciones(idCaso: string, numeroCaso: string): void {
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

  private mostrarModalResponderCasoElevado(registroElevacion: any): void {
    this.referenciaModal = this.dialogService.open(ResponderCasoElevadoModalComponent, {
      showHeader: false,
      closable: false,
      closeOnEscape: false,
      data: {
        titulo: 'RESPONDER ELEVACIÓN DE ACTUADOS',
        registroElevacion: registroElevacion
      }
    })
    this.referenciaModal.onClose.subscribe((confirm) => {
      console.log("confirm", confirm)
      if (confirm === 'ALLCLOSE') this.obtenerCasosElevacionActuados()
    });
  }

  eventChangeFiscal(event:any) {
    this.nombreFiscal = event.originalEvent.srcElement.innerText;
  }

  /*   public confirmarAsignacionCaso(): void {

        if ( this.casosSeleccionados.length === 0 )
            return this.messageService.add({ severity: 'warn', detail: 'Debe seleccionar al menos un caso para realizar la asignación' })

        if ( this.fiscalPorAsignar.value === null )
            return this.messageService.add({ severity: 'warn', detail: 'Debe seleccionar un fiscal para realizar la asignación' })

        let casosPorAsignar: any = []

        this.casosSeleccionados.forEach( (caso: CasoPorAsignar) => {
            let nroCaso = { numeroCaso: caso.id }
            casosPorAsignar.push(nroCaso)
        })

        let nombreFiscal = this.nombreFiscal
        let casos: string = casosPorAsignar.length
        let singular: boolean = casosPorAsignar.length === 1
        let nText: string = singular ? '' : 'n'

        this.referenciaModal = this.dialogService.open( AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
                icon: 'warning',
                title: `Confirmar asignación de ${ singular ? 'caso' : 'casos' }`,
                description: `Se asignará${nText} ${singular ? 'el caso' : 'los casos'} <span class='bold'>${casos}</span> al fiscal <span class='bold'>${nombreFiscal}</span>.`,
                confirmButtonText: 'Confirmar',
                confirm: true,
            }
        } as DynamicDialogConfig<AlertaData>)

        this.referenciaModal.onClose.subscribe({
            next: resp => {
                if ( resp === 'confirm' ) {

                    this.spinner.show()

                    let request: AsignarCasoRequest = {
                        idFiscal: Number(this.fiscalPorAsignar.value),
                        casos: casosPorAsignar,
                        tipoAsignacion: '1'
                    }
                    console.log(request)
                    this.asignarCaso(request, nombreFiscal.toString(), casos);

                }
            }
        })

    } */


  private asignarCaso(request: AsignarCasoRequest, nombreFiscal: string, casos: string): void {

    // this.subscriptions.push(
    this.asignacionTransaccionalService.asignarCaso(request).subscribe({
      next: resp => {
        console.log("respuestas")
        console.log(resp);

        this.spinner.hide()
        if (resp.code === 1) {
          this.limpiarFiltros()
          // this.obtenerFiscales();
          const sText = request.casos.length === 1 ? '' : 's'
          const asignacionText = request.casos.length === 1 ? 'asignó el' : 'asignaron los'
          this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: `Caso${sText} asignado${sText} correctamente`,
              description: `Se ${asignacionText} caso${sText} <span class='bold'>${casos}</span> al fiscal <span class='bold'>"${nombreFiscal}"</span>.`,
              confirmButtonText: 'OK',
            }
          } as DynamicDialogConfig<AlertaData>)
        }
      },
      error: (error) => {
        console.log(error)

        this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon: 'error',
            title: `Error al intentar realizar la asignación`,
            description: `${error.error.message}`,
            confirmButtonText: 'OK',
          }
        } as DynamicDialogConfig<AlertaData>)


        this.spinner.hide()
        this.messageService.add({severity: 'error', detail: `Ha ocurrido un error inesperado`})

      }
    })
    // )

  }


  private registarCasoLeido(idCaso: String, leido: string): void {
    console.log("casoooo ", idCaso)
    console.log("leio      ", leido)
    if (leido == "1") return

    let request: CasoLeidoRequest = {
      numeroCaso: idCaso,
      idEstadoCaso: 8 // 1: por asignar
    }

    this.spinner.show()
    this.asignacionTransaccionalService.registrarCasoLeido(request).subscribe({
      next: resp => {
        console.log("ueueueueueueue", resp)
        this.spinner.hide()
        if (resp.code === 200) {
          this.obtenerCasosElevacionActuados()
        }
      },
      error: (error) => {
        console.log(`${error.error.code} ${error.error.message}`)
        this.spinner.hide()
      }
    })
  }

  ref!: DynamicDialogRef;

  public exportarPdfExcel(exportType: TipoArchivoType): void {
    this.ref = this.referenciaModal = this.dialogService.open(PrevisualizarDocumentoModalComponent, {
      showHeader: false,
      data: {idDocumentoEscrito: '0F19278C0D40CF1BE0650250569D508A'}
    });
    this.ref.onClose.subscribe((respuesta) => {

    });


    /*   if (this.casosPorAsignar.length > 0) {

           const headers = ['Número de caso','Origen','Tipo Remitente','Remitente','Teléfono Remitente','Correo Remitente','Fecha Ingreso','Hora Ingreso']
           const data = []

           this.casosPorAsignar.forEach( ( caso: CasoPorAsignar ) => {
               const row = {
                   'Número de caso': caso.numeroCaso,
                   'Origen': caso.origen,
                   'Tipo Remitente': caso.tipoRemitente,
                   'Remitente': caso.remitente,
                   'Teléfono Remitente': caso.telefono,
                   'Correo Remitente': caso.correo,
                   'Fecha Ingreso': caso.fechaIngreso,
                   'Hora Ingreso': caso.horaIngreso,
               }
               data.push(row)
           })

           exportType === 'PDF'
               ?   this.exportarService.exportarAPdf(data, headers, 'Casos por asignar')
               :   this.exportarService.exportarAExcel(data, headers, 'Casos por asignar')
           return;
       }

       this.messageService.add({ severity: 'warn', detail: `No se encontraron registros para ser exportados a ${ exportType }` })
*/

  }

  public obtenerClaseDeOrigen(name: string): string {
    let semaforo = 'dentro-del-plazo';
    if (name == "2") {
      semaforo = 'plazo-por-vencer';
    } else if (name == "3") {
      semaforo = 'plazo-vencido';
    }
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
    this.actualizarPaginaRegistros(this.casoElevacionActuado)
  }

  actualizarPaginaRegistros(data: any) {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.casoElevacionActuadoFiltrados = data.slice(start, end);
  }

}
