import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MaestroService } from '@services/shared/maestro.service';
import { DescripcionModalComponent } from '@components/modals/descripcion-modal/descripcion-modal.component';
import { DateMaskModule } from '@directives/date-mask.module';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { TipoArchivoType } from "@core/types/exportar.type";
import { DateFormatPipe } from "@pipes/format-date.pipe";
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { FilterOptionModel } from '@models/filter-option.model';
import { FilterComponent } from '@components/generales/filter/filter.component';
import { ResponseCatalogModel } from '@models/response.model';
import { ReasignadosModalComponent } from '@components/modals/reasignados-modal/reasignados-modal.component';
import {
  DelitosYPartesModalComponent
} from '@components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
//import { CasoIdRequest, CasoPorRecepcionar, RequestRecepcionarCasos } from "@core/interfaces/provincial/recepcion/CasoPorRecepcionar";
import { ExportarService } from "@services/shared/exportar.service";
import { RequestLista } from '@interfaces/comunes/RequestLista';
import { NgxSpinnerService } from 'ngx-spinner';
import { RadioButtonModule } from "primeng/radiobutton";
import { iFolderMagnifyingGlass, iFolderExclamation } from 'ngx-mpfn-dev-icojs-regular';
import { obtenerIcono } from "@utils/icon";
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { Subscription, take } from 'rxjs';
import { CasoLeidoRequest } from '@interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest';
import { AsuntoObservacionesComponent } from '@components/modals/asunto-observaciones/asunto-observaciones.component';
import { AlertaModalComponent } from "@components/modals/alerta-modal/alerta-modal.component";
import { AlertaData } from "@interfaces/comunes/alert";
import { VisorEfeModalComponent } from '@components/modals/visor-efe-modal/visor-efe-modal.component';
import { RecepcionCasosSuperiorService } from '@services/superior/recepcion/recepcion-superior-consultas.service';
import { VisorEfeService } from '@services/visor/visor.service';
import { RecepcionContienda, RequestRecepcionarContienda } from '@interfaces/superior/administracion-casos/recepcion/recepcion-contienda';
import { CasoPorRecepcionar } from '@interfaces/provincial/recepcion/CasoPorRecepcionar';
import { cleanEmptyFields } from '@utils/utils';
import { BuscarCasosRecibirRequest } from '@interfaces/superior/administracion-casos/recepcion/buscar-casos-recibir-request';

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
    DateFormatPipe,
    MenuModule,
    DateMaskModule,
    DynamicDialogModule,
    FormsModule,
    ReactiveFormsModule,
    FilterComponent,
    RadioButtonModule,
    CmpLibModule,
  ],
  templateUrl: './listar-casos-por-recepcionar.component.html',
  styleUrls: ['./listar-casos-por-recepcionar.component.scss'],
  providers: [MessageService, DialogService, DatePipe],
})
export class ListarCasosPorRecepcionarComponent implements OnInit {

  public ICONO_FOLDER = iFolderMagnifyingGlass;
  public ICONO_EXCLAMACION = iFolderExclamation;

  filterOptions: FilterOptionModel[];

  public referenciaModal!: DynamicDialogRef
  public formularioFiltrarCasos!: FormGroup;
  public fiscaPorAsignar = new FormControl(null);
  public casosSeleccionados = [];
  public request!: RequestLista;
  public subscriptions: Subscription[] = []
  private casosPorRecepcionarFiltradosTmp: RecepcionContienda[] = [];
  private primeraVez: boolean = true;
  private busquedaAvanzada: boolean = false;
  public totalDentroPlazo: number = 0;
  public totalPorVencer: number = 0;
  public totalVencido: number = 0;
  private filtroTiempo: number = 0;

  items: (data: any) => MenuItem[] = ()=>[];

  //public casosPorRecepcionarFiltrados: CasoPorRecepcionar[] = [];
  public casosPorRecepcionarFiltrados: RecepcionContienda[] = [];

  plazos: ResponseCatalogModel;
  origen: ResponseCatalogModel;

  showFiltros: boolean = false;
  showFiltroMeses!: boolean;
  loading: boolean = true;

  headExport = ['Número de caso', 'Origen', 'Remitente', 'Contacto de remitente', 'Fecha ingreso', 'Fecha asignación'];
  headExportPDF = [this.headExport];
  dataExport: any[] = [];

  public mostrarFiltros = false;
  private pipe = new DatePipe('en-US');
  private today = new Date();
  private r: any;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private dialogService: DialogService,
    private messageService: MessageService,
    private maestroService: MaestroService,
    private recepcionCasosSuperiorService: RecepcionCasosSuperiorService,
    private exportarService: ExportarService,
    private spinner: NgxSpinnerService,
    private dataService: VisorEfeService,
    private datePipe: DatePipe,
  ) {
    this.filterOptions = [
      { name: 'caseCode', isVisible: true },
      { name: 'plazos', isVisible: true },
      { name: 'origen', isVisible: true },
      { name: 'fasignacion', isVisible: true },
    ];

    this.plazos = { isLoading: false, data: [] };
    this.origen = { isLoading: false, data: [] };
  }

  first = 0;
  rows = 10;


  ngOnInit(): void {
    this.formBuild();
    this.loading = false;
    this.getTipoPlazo();
    this.getOrigenCaso();
    this.obtenerCasosPorRecepcionar(this.filtroTiempo);

    this.items = (data: any) => [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          //data.idCaso = '0FC954EE1B0D1E1CE0650250569D508A';
          this.dataService.getData(data.idCaso).subscribe(response => {
            //console.log("response1: ", response);
            if (response.data == null) {
              this.mensajeInfo(""/*data.idCaso*/, "No se encontraron resultados");
            } else {
              this.mostrarVisorDocumental(data.idCaso, data.leido);
              this.registarCasoLeido(data.idCaso, data.leido);
            }
          })
        },
      },
      {
        label: 'Ver asuntos y observaciones',
        icon: 'file-search-icon',
        command: () => {
          console.log(data)
          this.mostrarAsuntoObservaciones(data.idCaso, data.numeroCaso)
          this.registarCasoLeido(data.idCaso, data.leido)
        },
      },
      /*{
        label: 'Anular caso',
        icon: 'trash-icon',
        command: () => {
          this.registarCasoLeido(data.idCaso, data.leido);
          this.anularCaso(data.idCaso,data.codCaso)
        },
      },*/
    ];

  }

  private formBuild(): void {
    let fechaDesde = new Date(this.today.getFullYear(), this.today.getMonth() - 6, this.today.getDate());
    let fechaHasta = this.today;

    this.formularioFiltrarCasos = this.fb.group({
      buscar: [''],
      tiempoAFiltrar: ['ultimosMeses'],
      fechaDesde: [fechaDesde],
      fechaHasta: [fechaHasta],
      plazo: [null],
      origen: [null],
    });
    this.valuesChanges();
  }

  getTipoPlazo() {
    this.plazos.isLoading = true;
    this.maestroService.getTipoPlazo()
      .subscribe({
        next: (data) => {
          this.plazos.data = data.data;
        },

      })
      .add(() => (this.plazos.isLoading = false));
  }

  getOrigenCaso() {
    this.origen.isLoading = true;
    this.maestroService.obtenerOrigen()
      .subscribe({
        next: (data) => {
          this.origen.data = data.data;
        },

      })
      .add(() => (this.origen.isLoading = false));
  }

  getIcon() {
    return `pi pi-angle-double-${this.showFiltros ? 'up' : 'down'}`;
  }

  public eventoMostrarOcultarFiltros(): void {
    this.busquedaAvanzada = true;
    this.mostrarFiltros = !this.mostrarFiltros
    this.mostrarFiltros && this.formularioFiltrarCasos.get('tiempoAFiltrar')!.setValue('todos');
    //this.formularioFiltrarCasos.get('tiempoAFiltrar').setValue('todos');

  }

  public recibirCasos(): void {
    if (this.casosSeleccionados.length === 0)
      return this.messageService.add({ severity: 'warn', detail: 'Debe seleccionar al menos un caso para realizar la recepción' })
    const casosPorRecibir: RequestRecepcionarContienda[] = []

    this.casosSeleccionados.forEach((caso: RequestRecepcionarContienda) => {
      let requestRecepcionarCasos = {
        idCaso: caso.idCaso,
        idBandejaElevacion: caso.idBandejaElevacion
      }
      casosPorRecibir.push(requestRecepcionarCasos)
    })

    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `Confirmar recibir ${this.casosSeleccionados.length > 1 ? 'los casos' : 'el caso'}`,
        description: `¿Está seguro que desea recibir  ${this.casosSeleccionados.length > 1 ? 'los casos' : 'el caso'}?.`,
        confirmButtonText: 'Confirmar',
        confirm: true,
      }
    } as DynamicDialogConfig<AlertaData>)

    this.referenciaModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.spinner.show()
          console.log(casosPorRecibir)
          this.recepcionarCaso(casosPorRecibir);
        }
      }
    })
  }

  private recepcionarCaso(request: RequestRecepcionarContienda[]): void {
    this.recepcionCasosSuperiorService.recepcionarCasos(request).subscribe({
      next: resp => {
        this.spinner.hide()
        if (resp.code === 200) {
          this.limpiarFiltros()
          const sText = request.length === 1 ? '' : 's'
          const recepcionText = request.length === 1 ? 'recepciono el' : 'recepcionaron los'
          this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: `Caso${sText} recepcionado${sText} correctamente`,
              description: `Se ${recepcionText} caso${sText} .`,
              confirmButtonText: 'OK',
            }
          } as DynamicDialogConfig<AlertaData>)
          this.getCasosPorRecepcionar();
        }
      },
      error: (error) => {
        console.log(error)

        this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon: 'error',
            title: `Error al intentar realizar la recepción`,
            description: `${error.error.message}`,
            confirmButtonText: 'OK',
          }
        } as DynamicDialogConfig<AlertaData>)


        this.spinner.hide()
        this.messageService.add({ severity: 'error', detail: `Ha ocurrido un error inesperado` })

      }
    })
  }

  getCasosPorRecepcionar(): void {
    this.spinner.show();
    this.recepcionCasosSuperiorService.obtenerListaCasos().subscribe(
        (data) => {
          this.spinner.hide();
          console.log("Lista recepción:", data);
          this.casosPorRecepcionarFiltrados = data;
          this.obtenerContadores(data);
        },
        (error) => {
          this.spinner.hide();
          console.error('Error al obtener los datos de Casos Recepcionados:', error);
        }
      );
  }

  public obtenerCasosPorRecibirFiltroFecha(value: number): void {
    this.filtroTiempo = value;
    if (this.filtroTiempo === 0 || this.filtroTiempo === 1) {
      this.obtenerCasosPorRecepcionar(this.filtroTiempo);
    }
  }

  obtenerCasosPorRecepcionar(filtroTiempo: number): void {
    const form = this.formularioFiltrarCasos.getRawValue()
    const request: BuscarCasosRecibirRequest = {
        fechaDesde: form.fechaDesde ? this.datePipe.transform(form.fechaDesde, 'dd/MM/yyyy') : null,
        fechaHasta: form.fechaHasta ? this.datePipe.transform(form.fechaHasta, 'dd/MM/yyyy') : null,
        idPlazo: form.plazo,
        idOrigen: form.origen,
    }
    request.filtroTiempo = filtroTiempo;
    const payload = cleanEmptyFields(request)
    console.log(payload);
    this.spinner.show()

    this.subscriptions.push(
        this.recepcionCasosSuperiorService.obtenerCasosPorRecibir( payload ).subscribe({
            next: resp => {
                this.spinner.hide()
                this.casosPorRecepcionarFiltrados = resp;
                this.obtenerContadores(resp);
            },
            error: error => {
                this.spinner.hide()
                console.error( error )
            }
        })
    )
  }

  public verReasignados(numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(ReasignadosModalComponent, {
      showHeader: false,
      contentStyle: { 'padding': '0', 'border-radius': '15px' },
      data: {
        caso: numeroCaso,
      }
    })
  }


  private calcularFecha(fecha:any, dias:any): Date {
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
  }
  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  public limpiarFiltros(): void {
    this.formBuild();
    this.filtroTiempo = 0;
    this.obtenerCasosPorRecepcionar(this.filtroTiempo)
  }

  public verDelitosPartes(cantidad: number, numeroCaso: string, idCaso: string, leido: string): void {
    this.registarCasoLeido(idCaso, leido);
    if (cantidad == 0) return;
    const verDelitosPartesRef = this.dialogService.open(DelitosYPartesModalComponent, {
      showHeader: false,
      data: {
        numeroCaso,
      }
    })
    verDelitosPartesRef.onClose.subscribe({
      next: () => this.getCasosPorRecepcionar(),
      error: error => console.error(error)
    })
  }


  public clasificacionCaso(numeroCaso: string, idCaso: string, clasificacion: string): void {
    this.referenciaModal = this.dialogService.open(DescripcionModalComponent, {

      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px' },
      data: {
        tipo: 'clasificacion',
        idCaso: idCaso,
        caso: numeroCaso,
        titulo: 'Clasificación de caso (Opcional)',
        descripcion: 'Ingrese una descripción rápida del caso',
        contenido: clasificacion,
      },
    });
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
      next: () => this.getCasosPorRecepcionar(),
      error: error => console.error(error)
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

  public getClass(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase()
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

  public getCaso(nroCaso: string, tipoPlazo: any): any {

    const caso = nroCaso.split('-');
    const plazoHtml = `<span class="plazo-item ${this.obtenerClaseDeOrigen(
      tipoPlazo
    )}"></span>`;
    const casoHtml = `<div class="cfe-caso">${caso[0]}-<span>${caso[1]}-${caso[2]}</span>-${caso[3]}</div>`;
    return this.sanitizer.bypassSecurityTrustHtml(plazoHtml + casoHtml);
  }

  public exportar(exportType: TipoArchivoType): void {

    if (this.casosPorRecepcionarFiltrados.length > 0) {

      const headers = ['Número de Caso', 'Origen', 'Remitente', 'Etapa', 'Despacho de procedencia', 'Fecha de elevación al despacho','Fecha de aceptación F.Superior']
      const data:any[] = [];

      this.casosPorRecepcionarFiltrados.forEach((c: RecepcionContienda) => {
        const row = {
          'Número de Caso': c.numeroCaso,
          'Origen': c.tipoOrigen,
          'Remitente': c.remitente,
          'Etapa': c.etapa,
          'Despacho de procedencia': c.despachoProcedencia,
          'Fecha de elevación al despacho': c.fechaElevacion,
          'Fecha de aceptación F.Superior': c.fechaAsignacion,
        }
        data.push(row)
      })

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos por Recepcionar', 'landscape')
        : this.exportarService.exportarAExcel(data, headers, 'Casos por Recepcionar')
      return;
    }

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`
    })
  }
  private registarCasoLeido(idCaso: String, leido: string): void {
    if (leido == "1") {
      return;
    }
    let request: CasoLeidoRequest = {
      numeroCaso: idCaso,
      idEstadoCaso: 1 // falta definir el estado
    }
    /* this.recepcionConsultasService.registrarCasoLeido(request).subscribe({
       next: resp => {
         this.spinner.hide()
         if (resp.code === 0) {
           this.getCasosPorRecepcionar()
         }
       },
       error: (error) => {
         console.log("error registrar caso leido")
         console.log(error)
       }
     })*/
  }

  private mostrarVisorDocumental(idCaso: string, numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      contentStyle: { overflow: 'auto' },
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

  valuesChanges(): void {
    this.formularioFiltrarCasos.get('buscar')!
      .valueChanges
      .subscribe({
        next: value => {
          this.buscar(value);
        }
      });

    this.formularioFiltrarCasos.get('tiempoAFiltrar')!
      .valueChanges
      .subscribe({
        next: value => {
          if (!this.busquedaAvanzada) {
            let filtro = value === 'todos' ? 1 : 0;
            //this.buscarRecepcion(filtro);
            this.obtenerCasosPorRecepcionar(filtro);
          }
        }
      });
  }

  buscar(filtro: string): void {
    if (this.primeraVez) {
      this.casosPorRecepcionarFiltradosTmp = [...this.casosPorRecepcionarFiltrados];
      this.primeraVez = false;
    }

    if (!filtro) {
      this.casosPorRecepcionarFiltrados = [...this.casosPorRecepcionarFiltradosTmp];
    } else {
      const filtroUpper = filtro.toUpperCase();

      this.casosPorRecepcionarFiltrados = this.casosPorRecepcionarFiltradosTmp.filter(x => {
        const idCaso = x.idCaso || '';
        const codCaso = x.numeroCaso || '';
        const remitente = x.remitente || '';
        const tipoRemitente = x.tipoRemitente || '';
        const etapa = x.etapa || '';
        const despachoProcedencia = x.despachoProcedencia || '';
        const fechaElevacion = x.fechaElevacion || '';
        const horaElevacion = x.horaElevacion || '';
        const fechaAsignacion = x.fechaAsignacion || '';
        const horaAsignacion = x.horaAsignacion || '';

        const datos = (
          idCaso +
          codCaso +
          remitente +
          tipoRemitente +
          etapa +
          despachoProcedencia +
          fechaElevacion +
          horaElevacion +
          fechaAsignacion +
          horaAsignacion
        ).toUpperCase();

        return datos.includes(filtroUpper);
      });
    }

    this.obtenerContadores(this.casosPorRecepcionarFiltrados);
  }


  buscarRecepcion(filtroTiempo:any): void {
    this.recepcionCasosSuperiorService
      .obtenerListaCasos()
      .pipe(take(1))
      .subscribe(
        (data) => {
          this.spinner.hide();
          this.casosPorRecepcionarFiltrados = data;
          this.obtenerContadores(data);
        },
        (error) => {
          this.spinner.hide();
          console.error('Error al obtener los datos de Casos Recepcionados:', error);
        }
      );
  }
  obtenerCasosPorAsignar(): void {
    this.spinner.show();
    let filtroTiempo = '2';
    let fechaInicio = this.formularioFiltrarCasos.get('fechaDesde')!.value;
    let fechaFin = this.formularioFiltrarCasos.get('fechaHasta')!.value;
    let idPlazo = this.formularioFiltrarCasos.get('plazo')!.value;
    let idOrigen = this.formularioFiltrarCasos.get('origen')!.value;
    this.recepcionCasosSuperiorService
      .obtenerListaCasos()
      .pipe(take(1))
      .subscribe(
        (data) => {
          this.spinner.hide();
          this.casosPorRecepcionarFiltrados = data;
          this.obtenerContadores(data);
        },
        (error) => {
          this.spinner.hide();
          console.error('Error al obtener los datos de Casos Recepcionados:', error);
        }
      );
  }

  obtenerContadores(lista: CasoPorRecepcionar[]): void {
    this.totalDentroPlazo = lista.filter(x => x.indicadorSemaforo == 1).length;
    this.totalPorVencer = lista.filter(x => x.indicadorSemaforo == 2).length;
    this.totalVencido = lista.filter(x => x.indicadorSemaforo == 3).length;
  }

  obtenerFechaTranscurridas(fechaEmision:string): string {
    var start = new Date(fechaEmision);
    var end = new Date();
    let difference = Math.abs(end.valueOf() - start.valueOf());

    let days = Math.floor(difference / (1000 * 60 * 60 * 24));
    let hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);

    let retorno = days + "d " + hours + "h " + minutes + "m";
    return retorno;
  }
}
