import {CommonModule, DatePipe} from "@angular/common";
import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DomSanitizer} from "@angular/platform-browser";
import {AlertaData} from "@interfaces/comunes/alert";
import {
  AsignarCasoRequest,
  CasoLeidoRequest
} from "@interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest";
import {
  CasoPorAsignar,
  FiscalPorAsignados
} from "@interfaces/provincial/administracion-casos/asignacion/CasoPorAsignar";
import {AsignacionConsultasService} from "@services/provincial/asignacion/asignacion-consultas.service";
import {AsignacionTransaccionalService} from "@services/provincial/asignacion/asignacion-transaccional.service";
import {MaestroService} from "@services/shared/maestro.service";
import {TipoArchivoType} from "@core/types/exportar.type";
import {AlertaModalComponent} from "@components/modals/alerta-modal/alerta-modal.component";
import {DelitosYPartesModalComponent} from "@components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component";
import {DescripcionModalComponent} from "@components/modals/descripcion-modal/descripcion-modal.component";
import {DateMaskModule} from "@directives/date-mask.module";
import {DateFormatPipe} from "@pipes/format-date.pipe";
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
import {AsuntoObservacionesComponent} from "@components/modals/asunto-observaciones/asunto-observaciones.component";
import {VisorEfeModalComponent} from "@components/modals/visor-efe-modal/visor-efe-modal.component";
import {
  ResponderCasoElevadoModalComponent
} from "@components/modals/responder-casos-elevados-modal/responder-casos-elevados-modal.component";
import {Tab} from "@interfaces/comunes/tab";
import {TabsViewComponent} from "@components/tabs-view/tabs-view.component";
import {TabViewModule} from "primeng/tabview";
import {ReasignacionCasoSuperiorComponent} from "../../reasignacion-caso-superior/reasignacion-caso-superior.component";
import {AnulacionCasoSuperiorComponent} from "../../anulacion-caso-superior/anulacion-caso-superior.component";
import {TIEMPO_CONSULTAS_CASOS} from "ngx-cfng-core-lib";
import {ActivatedRoute} from "@angular/router";
import {AsignacionConsultasSuperiorService} from "@services/superior/asignacion/asignacion-consultas.service";
import {AsignacionTransaccionalSuperiorService} from "@services/superior/asignacion/asignacion-transaccional.service";
import {RevertirCasosSuperiorService} from "@services/superior/revertir/revertir-caso-superior.service";
import {VisorEfeService} from "@services/visor/visor.service";
import { EscenarioUno } from '@interfaces/maestros/escenarios.interface';

@Component({
  selector: 'app-listar-casos-por-asignar',
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
    TabsViewComponent,
    TabViewModule,
    ReasignacionCasoSuperiorComponent,
    AnulacionCasoSuperiorComponent
  ],
  templateUrl: './listar-casos-por-asignar.component.html',
  styleUrls: ['./listar-casos-por-asignar.component.scss'],
  providers: [MessageService, DialogService, DatePipe],
})
export class ListarCasosSuperiorPorAsignarComponent implements OnInit {

  //public fiscalesPorAsignar = []
  public fiscalesPorAsignar: FiscalPorAsignados[] = []
  public plazos = []
  public origen: EscenarioUno[] = []
  public leyenda:any[] = []
  public casosPorAsignar: CasoPorAsignar[] = []
  public casosPorAsignarFiltrados: CasoPorAsignar[] = []
  public casosSeleccionados: CasoPorAsignar[] = []
  public mostrarFiltros = false

  public formularioFiltrarCasos!: FormGroup;
  public fiscalPorAsignar = new FormControl(null);

  public referenciaModal!: DynamicDialogRef;
  public subscriptions: Subscription[] = [];
  public nombreFiscal!: String;
  public nombreOrigen: any = '*';
  public nombrePlazo: any = '*';
  public fechaOrigenSeleccionada: any = '*';
  public fechaFinSeleccionada: any = '*';
  public formReseteado: boolean = false;
  leido: any = 1;
  public tiempo: number = TIEMPO_CONSULTAS_CASOS.SEISMESES;

  opcionesMenu: (data: any) => MenuItem[] = ()=>[];


  public tabs: Tab[] = [
    {
      titulo: 'Asignacion',
      ancho: 210,

    },
    {
      titulo: 'Reasignación',
      ancho: 210,
    },
    {
      titulo: 'Anulación',
      ancho: 210,
    }
  ];
  public indexActivo: number = 0
  items: (data: any) => MenuItem[] = ()=>[];

  constructor(
    private formulario: FormBuilder,
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private maestrosService: MaestroService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private revertirCasosSuperiorService: RevertirCasosSuperiorService,
    private asignacionConsultaService: AsignacionConsultasService,
    private asignacionTransaccionalService: AsignacionTransaccionalService,
    private dataService: VisorEfeService,
    private route: ActivatedRoute,
    private asignacionTransaccionalSuperiorService: AsignacionTransaccionalSuperiorService,
    private asignacionConsultasSuperiorService: AsignacionConsultasSuperiorService,
  ) {
  }

  ngOnInit(): void {
    console.log("id tipo elevacion asignar", this.route.snapshot.data['idTipoElevacion']);
    console.log("id tipo elevacion asignar 2", this.route.snapshot.data['idtipoElevacionAsunto']);
    this.formBuild()
    this.obtenerPlazos()
    this.obtenerOrigen()
    this.obtenerFiscales()

    this.obtenerCasosPorAsignar(this.tiempo)

    this.opcionesMenu = (data: any) => [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {

          console.log("data: ", data);
          //data.id = "0FB5FD1CF763B38CE0650250569D508A"
          this.dataService.getData(data.id).subscribe(response => {
              console.log("response1: ", response);
              if (response.data == null) {
                this.mensajeInfo(""/*data.idCaso*/, "No se encontraron resultados");
              } else {
                this.mostrarVisorDocumental(data.id, data.numeroCaso);
                this.registarCasoLeido(data.id, data.leido);
              }
            },
            error => {
              this.mensajeInfo(""/*data.idCaso*/, "Identificador de caso nulo");
            },
          )
        }
      },
      {
        label: 'Ver asuntos y observaciones',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarAsuntoObservaciones(data.id, data.numeroCaso)
          this.registarCasoLeido(data.id, data.leido)
        }
      },
      {
        label: 'Revertir aceptación del caso',
        icon: 'file-search-icon',
        command: () => {
          this.registarCasoLeido(data.id, data.leido);
          this.revertirCaso(data)
        }
      },
    ];
    // this.verDelitosPartes("506014501-2021-590-0")
  }

  private formBuild(): void {

    this.formularioFiltrarCasos = this.formulario.group({
      buscar: [''],
      tiempoAFiltrar: ['ultimosMeses'],
      fechaDesde: [null],
      fechaHasta: [null],
      plazo: [null],
      origen: [null],
    })

  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  private obtenerFiscales(): void {
    this.subscriptions.push(
      this.asignacionConsultasSuperiorService.obtenerFiscales().subscribe({
        next: resp => {
          this.fiscalesPorAsignar = resp
        },
        error: error => {
          console.log(error)
        }
      })
    )
  }

  private obtenerPlazos(): void {
    this.subscriptions.push(
      this.maestrosService.getTipoPlazo().subscribe({

        next: resp => {

          this.plazos = resp.data
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

  private obtenerLeyenda(casosPorAsignarFiltrados:any): void {
    var nroCasosDentroPlazo = 0;
    var nroCasosPorVencer = 0;
    var nroCasosFueraplazo = 0;

    casosPorAsignarFiltrados.forEach( (caso:any) => {
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

  seleccionarFechaInicio(event:any) {
    let d = new Date(Date.parse(event));
    this.fechaOrigenSeleccionada = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  }

  seleccionarFechaFin(event:any) {
    let d = new Date(Date.parse(event));
    this.fechaFinSeleccionada = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  changeOrigen(event:any) {
    this.nombreOrigen = event.originalEvent.srcElement.innerText
  }

  changePlazos(event:any) {
    this.nombrePlazo = event.originalEvent.srcElement.innerText
  }

  DateToNumber(fecha: String) {
    let arrayFecha: any = fecha.split("/");
    return (arrayFecha[0] * 1) + (arrayFecha[1] * 1) * 30 + (arrayFecha[2] * 1) * 360;
  }


  obtenerCasosPorAsignarGrilla(): void {
    if (this.formReseteado === true) {
      this.casosPorAsignarFiltrados = this.casosPorAsignar;
      this.formReseteado = false;
      return
    }

    const criterioBusqueda = this.formularioFiltrarCasos.get('buscar')!.value;
    this.casosPorAsignarFiltrados = [];
    let casosSeleccionados: any = [];

    this.casosPorAsignarFiltrados = this.casosPorAsignar.filter(item =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue?.toString()?.toLowerCase().includes(criterioBusqueda?.toLowerCase())
      )
    );
    console.log(this.nombrePlazo);

    if (this.nombrePlazo !== '*' && (typeof this.nombrePlazo !== "undefined")) {
      this.casosPorAsignarFiltrados = casosSeleccionados
      this.casosPorAsignarFiltrados = this.casosPorAsignar.filter(item =>
        Object.values(item).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
            fieldValue?.toString()?.toLowerCase().includes(this.nombrePlazo?.toLowerCase())
        )
      );
    }


    if (this.nombreOrigen !== '*' && (typeof this.nombreOrigen !== "undefined")) {
      this.casosPorAsignarFiltrados = casosSeleccionados
      this.casosPorAsignarFiltrados = this.casosPorAsignar.filter(item =>
        Object.values(item).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
            fieldValue?.toString()?.toLowerCase().includes(this.nombreOrigen?.toLowerCase())
        )
      );
    }

    if (this.fechaOrigenSeleccionada !== '*' && this.fechaFinSeleccionada !== '*') {
      let fechaSeleccionadoNumerosOrigen = this.DateToNumber(this.fechaOrigenSeleccionada)
      let fechaSeleccionadoNumerosDestino = this.DateToNumber(this.fechaFinSeleccionada)
      this.casosPorAsignarFiltrados.forEach(caso => {
        if ((this.DateToNumber(caso.fechaIngreso)) >= fechaSeleccionadoNumerosOrigen &&
          (this.DateToNumber(caso.fechaIngreso)) <= fechaSeleccionadoNumerosDestino) {
          casosSeleccionados.push(caso)
        }
      })
      this.casosPorAsignarFiltrados = casosSeleccionados
    }

    if (this.fechaOrigenSeleccionada !== '*' && (this.fechaFinSeleccionada == "*")) {
      let fechaSeleccionadoNumerosOrigen = this.DateToNumber(this.fechaOrigenSeleccionada)
      this.casosPorAsignarFiltrados.forEach(caso => {
        if ((this.DateToNumber(caso.fechaIngreso)) >= fechaSeleccionadoNumerosOrigen) {
          casosSeleccionados.push(caso)
        }
      })
      this.casosPorAsignarFiltrados = casosSeleccionados
    }

    if (this.fechaOrigenSeleccionada == '*' && (this.fechaFinSeleccionada != "*")) {
      let fechaSeleccionadoNumerosDestino = this.DateToNumber(this.fechaFinSeleccionada)
      this.casosPorAsignarFiltrados.forEach(caso => {
        if ((this.DateToNumber(caso.fechaIngreso)) <= fechaSeleccionadoNumerosDestino) {
          casosSeleccionados.push(caso)
        }
      })
      this.casosPorAsignarFiltrados = casosSeleccionados
    }
    this.obtenerLeyenda(this.casosPorAsignarFiltrados)
    this.formReseteado = false;

  }

  private timeout?: number;

  onInput(value: string): void {
    window.clearTimeout(this.timeout);

    this.timeout = window.setTimeout(() => {
      this.obtenerCasosPorAsignarGrilla();
    }, 700);
  }

  actualizarTiempos() {
    let tiempoFiltrar = this.formularioFiltrarCasos.get('tiempoAFiltrar')!.value;
    if (tiempoFiltrar === "todos") {
      this.tiempo = TIEMPO_CONSULTAS_CASOS.TODOS
    } else {
      this.tiempo = TIEMPO_CONSULTAS_CASOS.SEISMESES;
    }

    this.obtenerCasosPorAsignar(this.tiempo);
  }

  private obtenerCasosPorAsignar(tiempo:any): void {
    this.spinner.show()
    this.subscriptions.push(
      this.asignacionConsultasSuperiorService.obtenerCasosPorAsignarSuperior(tiempo).subscribe({
        next: resp => {
          this.spinner.hide()
          if (resp.code === 0) {
            this.casosPorAsignar = resp.data.map( (caso:any) => ({...caso, seleccionado: false}))
            this.casosPorAsignarFiltrados = [...this.casosPorAsignar]
            this.casosSeleccionados = []
            const criterioBusqueda = this.formularioFiltrarCasos.get('buscar')!.value;
            criterioBusqueda && this.filtrarCasos(criterioBusqueda)
          }
          this.obtenerLeyenda(this.casosPorAsignarFiltrados)
        },
        error: error => {
          this.spinner.hide()
          console.error(error)
        }
      })
    )
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros
    this.mostrarFiltros && this.formularioFiltrarCasos.get('tiempoAFiltrar')!.setValue('ultimosMeses')
  }

  public filtrarCasos(value: string): void {
    this.casosPorAsignarFiltrados = this.casosPorAsignar.filter(item =>
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
    this.fiscalPorAsignar.reset()
    this.obtenerCasosPorAsignar(this.tiempo)
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
      next: () => this.obtenerCasosPorAsignar(this.tiempo),
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
      next: () => this.obtenerCasosPorAsignar(this.tiempo),
      error: error => console.error(error)
    })
  }

  private revertirCaso(registro:any): void {
    console.log(registro)
    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `CONFIRMAR REVERSIÓN DE LA ACEPTACIÓN DEL CASO`,
        description: `Por favor confirme la acción de revertir la aceptación del caso. Recuerde que el caso pasará de su
                                sección "ASIGNACIÓN" a la sección "BANDEJA", y tendrá que responder el caso nuevamente (aceptarlo
                                u observarlo).`,
        confirmButtonText: 'Aceptar',
        confirm: true,
      }
    } as DynamicDialogConfig<AlertaData>)

    this.referenciaModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.revertirAceptacionCaso(registro.idBandeja)
        }
      }
    })


  }

  private mostrarVisorDocumental(idCaso: string, numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      contentStyle: {overflow: 'auto'},
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

    this.referenciaModal = this.dialogService.open(AsuntoObservacionesComponent, {
      width: '95%',
      showHeader: false,
      //   contentStyle: { 'padding':'0', 'border-radius': '15px' },
      data: {
        numeroCaso: numeroCaso,
        idCaso: idCaso,
        title: 'Asunto Observaciones',
        description: 'Hechos del caso',
      }
    })

  }

  eventChangeFiscal(event:any) {
    this.nombreFiscal = event.originalEvent.srcElement.innerText;
  }

  public confirmarAsignacionCaso(): void {
    if (this.casosSeleccionados.length === 0)
      return this.messageService.add({
        severity: 'warn',
        detail: 'Debe seleccionar al menos un caso para realizar la asignación'
      })

    if (this.fiscalPorAsignar.value === null)
      return this.messageService.add({
        severity: 'warn',
        detail: 'Debe seleccionar un fiscal para realizar la asignación'
      })

    let casosPorAsignar: any = []

    this.casosSeleccionados.forEach((caso: CasoPorAsignar) => {
      let nroCaso = {numeroCaso: caso.id}
      casosPorAsignar.push(nroCaso)
    })

    let nombreFiscal = this.nombreFiscal
    let casos: string = casosPorAsignar.length
    let singular: boolean = casosPorAsignar.length === 1
    let nText: string = singular ? '' : 'n'

    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `Confirmar asignación de ${singular ? 'caso' : 'casos'}`,
        description: `Se asignará${nText} ${singular ? 'el caso' : 'los casos'} <span class='bold'>${casos}</span> al fiscal <span class='bold'>${nombreFiscal}</span>.`,
        confirmButtonText: 'Confirmar',
        confirm: true,
      }
    } as DynamicDialogConfig<AlertaData>)

    const selectedFiscal = this.fiscalesPorAsignar.find(j => j.idFiscal == this.fiscalPorAsignar.value);
    if (selectedFiscal) {
      //console.log("fiscal seleccionado: ", JSON.stringify(selectedFiscal))
    }

    this.referenciaModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.spinner.show()
          let request: AsignarCasoRequest = {
            idFiscal: this.fiscalPorAsignar.value!,
            casos: casosPorAsignar,
            tipoAsignacion: '1'
          }
          this.asignarCaso(request, nombreFiscal.toString(), casos);
        }
      }
    })
  }

  private asignarCaso(request: AsignarCasoRequest, nombreFiscal: string, casos: string): void {
    this.asignacionTransaccionalSuperiorService.asignarCasoSuperior(request).subscribe({
      next: resp => {
        this.spinner.hide()
        if (resp.code === 0) {
          this.limpiarFiltros()
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


  private revertirAceptacionCaso(idBandeja:any): void {
    this.revertirCasosSuperiorService.revertirCaso(idBandeja).subscribe({
      next: resp => {

      },
      error: (error) => {
        console.log("error registrar caso leido")
        console.log(error)
      }
    })
  }


  private registarCasoLeido(idCaso: String, leido: string): void {
    if (leido == "1") {
      return;
    }
    let request: CasoLeidoRequest = {
      numeroCaso: idCaso,
      idEstadoCaso: 1, // 1: por asignar
    }
    this.asignacionTransaccionalService.registrarCasoLeido(request).subscribe({
      next: resp => {
        this.spinner.hide()
        if (resp.code === 0) {
          this.obtenerCasosPorAsignar(this.tiempo)
        }
      },
      error: (error) => {
        console.log("error registrar caso leido")
        console.log(error)
      }
    })
  }

  ref!: DynamicDialogRef;

  public exportarPdfExcel(exportType: TipoArchivoType): void {


    this.ref = this.referenciaModal = this.dialogService.open(ResponderCasoElevadoModalComponent, {
      showHeader: false,
      data: {
        titulo: 'RESPONDER ELEVACIÓN DE ACTUADOS',
        nombreFiscalia: 'Fiscalia mixta penal - Lima Centro',
        numeroDespacho: '4563',
        idCaso: '1',
        idActoTramiteCaso: '1',
        idTipoElevacion: '1',
      }
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

  public obtenerNumeroCaso(numeroCaso: string, plazo: string): string {
    const caso = numeroCaso.split('-')
    const plazoHtml = `<span class="plazo-item ${this.obtenerClaseDeOrigen(plazo)}"></span>`
    const casoHtml = `<div class="cfe-caso">${caso[0]}-<span>${caso[1]}-${caso[2]}</span>-${caso[3]}</div>`
    return plazoHtml + casoHtml;
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
}
