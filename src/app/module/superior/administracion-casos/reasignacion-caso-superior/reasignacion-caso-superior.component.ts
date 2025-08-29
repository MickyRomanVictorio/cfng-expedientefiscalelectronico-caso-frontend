import {CommonModule} from '@angular/common';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {CalendarModule} from 'primeng/calendar';
import {TableModule} from 'primeng/table';
import {DividerModule} from 'primeng/divider';
import {CasosAsignados} from '@core/interfaces/comunes/casosAsignados';
import {
  ReasignacionConsultasSuperiorService
} from '@services/reusables/superior/reasignacion-consultas-superior-service';
import {MenuItem, MessageService} from 'primeng/api';
import {MaestroService} from '@services/shared/maestro.service';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {obtenerIcono} from "@utils/icon";
import {RadioButtonModule} from "primeng/radiobutton";
import {DateMaskModule} from "@directives/date-mask.module";
import {DateFormatPipe} from "@pipes/format-date.pipe";
import {AlertaModalComponent} from "@components/modals/alerta-modal/alerta-modal.component";
import {AlertaData} from "@interfaces/comunes/alert";
import {
  ReasignarCasoRequest
} from "@interfaces/provincial/administracion-casos/reasignacion-casos/reasignar-caso-request.interface";
import {ToastModule} from "primeng/toast";
import {TipoArchivoType} from "@core/types/exportar.type";
import {ExportarService} from "@services/shared/exportar.service";
import {MenuModule} from "primeng/menu";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {AsignacionConsultasService} from "@services/provincial/asignacion/asignacion-consultas.service";
import {NgxSpinnerService} from "ngx-spinner";
import {VisorEfeModalComponent} from "@components/modals/visor-efe-modal/visor-efe-modal.component";
import {ActivatedRoute} from '@angular/router';
import {AsuntoObservacionesComponent} from "@components/modals/asunto-observaciones/asunto-observaciones.component";
import {ReasignacionService} from '@services/provincial/administracion-casos/reasignacion/reasignacion.service';
import {
  FiltrarCasosPorReasignar
} from '@interfaces/superior/administracion-casos/reasignacion-casos/filtrar-casos-por-reasignar.interface';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    TableModule,
    DividerModule,
    RadioButtonModule,
    DateFormatPipe,
    DateMaskModule,
    ToastModule,
    MenuModule
  ],
  selector: 'app-reasignacion-caso-superior',
  templateUrl: './reasignacion-caso-superior.component.html',
  styleUrls: ['./reasignacion-caso-superior.component.scss'],
  providers: [ MessageService, DialogService ]
})
export class ReasignacionCasoSuperiorComponent implements OnInit {

  @Output() filter = new EventEmitter<object>()

  mostrarFechaReasignacionTemporal: boolean = true // true

  casosAsignados: CasosAsignados[] = [];
  casosPorAsignarFiltrados: CasosAsignados[] = [];

  casosSeleccionados: CasosAsignados[] = [];

  formReasignacion: FormGroup;
  formOpcionesReasignacion: FormGroup

  fiscalAReasignar = new FormControl('')
  fiscalAsignado = new FormControl('')

  private idTipoElevacion!: string;

  public leyenda:any[] = []
  tiposAsignacion: any[] = [];
  tiposReasignacion: any[] | undefined
  listaFiscalesAsignacion: any[] = [];
  listaFiscalesReasignacion: any[] = [];

  public referenciaModal!: DynamicDialogRef;

  public mostrarFiltros = false; // true

  opcionesMenu: (data: any) => MenuItem[] = ()=>[];

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private reasignacionConsultasService: ReasignacionConsultasSuperiorService,
    private asignacionConsultaService: AsignacionConsultasService,
    private maestroService: MaestroService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private reasignacionService: ReasignacionService,
    private exportarService: ExportarService,
    private route: ActivatedRoute,
  ) {

    this.formReasignacion = this.fb.group({
      tiempoAFiltrar: ['ultimosMeses'],
      buscar: [''],
      fechaAsignacionIni: [''],
      fechaAsignacionFin: [''],
      tipoAsignacion: [''],
    })

    this.formOpcionesReasignacion = this.fb.group({
      tipoReasignacion: [''],
      motivo: [''],
      fechaReasignacionIni: [''],
      fechaReasignacionFin: [''],
    })

  }

  ngOnInit() {
     this.idTipoElevacion = this.route.snapshot.data['idTipoElevacion'];
    console.log("id tipo elevacion",this.route.snapshot.data['idTipoElevacion']);

    this.busquedaDinamica();
    this.loadListaCasosAsignados();
    this.loadTiposAsignacion();
    this.loadFiscalesAsignados();

    this.opcionesMenu = (data: any) => [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarVisorDocumental(data.id, data.numeroCaso)
        }
      },
      {
        label: 'Ver asuntos y observaciones',
        icon: 'file-search-icon',
        command: () => {
            this.mostrarAsuntoObservaciones(data.id, data.numeroCaso)
        }
      },
    ];

  }

  private mostrarVisorDocumental(idCaso: string, numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      data: {
        caso: '506150101-2023-1-0',
        numeroCaso: numeroCaso,
        idCaso: idCaso,
        title: 'Visor documental del caso:',
        description: 'Hechos del caso',
      }
    })
  }


  private busquedaDinamica(): void {
    this.formReasignacion.get('buscar')!.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.filtrarCasosAsignadosPorCampo();
      })
  }

  public filtrarCasosAsignadosPorCampo(): void {
    console.log("Buscar");
    if (this.formReasignacion.valid) {
      const textoBusqueda = this.formReasignacion.get('buscar')!.value;
      if (!textoBusqueda) {
        this.casosPorAsignarFiltrados = [...this.casosAsignados];
      } else {
        this.casosPorAsignarFiltrados = this.casosAsignados.filter((data) =>
          Object.values(data).some(
            (fieldValue: any) =>
              (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
              fieldValue?.toString()?.toLowerCase().includes(textoBusqueda.toLowerCase())
          )
        );
      }
    }
  }

  private mostrarAsuntoObservaciones(idCaso: string, numeroCaso: string): void {
    this.referenciaModal = this.dialogService.open(AsuntoObservacionesComponent, {
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
public obtenerClaseDeOrigen( name: string ): string {
  let semaforo = 'dentro-del-plazo';
  if (name == "2") {
      semaforo = 'plazo-por-vencer';
  } else if (name == "3") {
      semaforo = 'plazo-vencido';
  }
  return semaforo;
}

  private obtenerLeyenda(casoElevacionActuadoFiltrados:any): void {
    let nroCasosDentroPlazo = 0;
    let nroCasosPorVencer = 0;
    let nroCasosFueraPlazo = 0;

    casoElevacionActuadoFiltrados.forEach( (caso:any) => {
        if ((caso.semaforoNro == "1")) {
            nroCasosDentroPlazo += 1;
        } else if ((caso.semaforoNro == "2")) {
            nroCasosPorVencer += 1;
        } else if ((caso.semaforoNro == "3")) {
          nroCasosFueraPlazo += 1;
        }
        })

    let respuesta = [];
    let leyenda = { "nombrePlazo": "Dentro del plazo", "cantidad": nroCasosDentroPlazo };
    respuesta.push(leyenda);
    leyenda = { "nombrePlazo": "Plazo por vencer", "cantidad": nroCasosPorVencer };
    respuesta.push(leyenda);
    leyenda = {"nombrePlazo": "Plazo vencido", "cantidad": nroCasosFueraPlazo};
    respuesta.push(leyenda);
    this.leyenda = respuesta;
}

  public limpiarFiltros(): void {
    this.formReasignacion.reset();
    this.fiscalAsignado = new FormControl('');

    this.formOpcionesReasignacion.reset();
    this.fiscalAReasignar = new FormControl('');

    this.loadListaCasosAsignados();
  }

  loadListaCasosAsignados() {
    let request: FiltrarCasosPorReasignar = {
      tipoElevacion: Number(this.idTipoElevacion),
      idFiscalAsignado: null,
      busqueda: "",
      fechaInicioAsignacion: null,
      fechaFinAsignacion: null,
      tipoAsignacion: 1,
    }
    this.reasignacionConsultasService.getListaCasosAsignadosSuperior(request)
      .subscribe((result: any) => {
          this.casosAsignados = result;
          this.casosPorAsignarFiltrados = [...this.casosAsignados];
          this.obtenerLeyenda(this.casosPorAsignarFiltrados)
        }
      );
  }

  public obtenerClaseDeTipoAsignacion(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase()
  }

  loadTiposAsignacion() {
    this.maestroService.getTipoAsignacion()
      .subscribe(
        (result: any) => {
          this.tiposAsignacion = result.data;
          this.tiposReasignacion = result.data;
        }
      );
  }

  loadFiscalesAsignados() {

    this.asignacionConsultaService.obtenerFiscales()
      .subscribe(
        (result: any) => {
          this.listaFiscalesReasignacion = result;
          this.listaFiscalesAsignacion = result;
        }
      );

  }


  formatearNumCaso(numeroCaso: string): string {
    const partes = numeroCaso.split('-');
    return `${partes[0]}-${
      '<span class="text-orange-500">' + partes[1] + '-' + partes[2] + '</span>'
    }-${partes[3]}`;
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros
    this.mostrarFiltros && this.formReasignacion.get('tiempoAFiltrar')!.setValue('ultimosMeses')
  }

  eventChangeFiscal(idFiscal:any) {
    let request: FiltrarCasosPorReasignar = {
      tipoElevacion: Number(this.idTipoElevacion),
      idFiscalAsignado: idFiscal.value,
      busqueda: "",
      fechaInicioAsignacion: null,
      fechaFinAsignacion: null,
      tipoAsignacion: 1,
    }
    this.reasignacionConsultasService.getListaCasosAsignadosSuperior(request)
      .subscribe((result: any) => {
          this.casosAsignados = result;
          this.casosPorAsignarFiltrados = [...this.casosAsignados];
        }
      );
    this.listaFiscalesReasignacion = this.listaFiscalesAsignacion;
    this.listaFiscalesReasignacion = this.listaFiscalesReasignacion.filter(elemento => elemento.idFiscal !== idFiscal.value);
  }

  reasignarCaso(): void {

    if (this.fiscalAsignado.value === null)
      return this.messageService.add({
        severity: 'warn',
        detail: 'Debe seleccionar un fiscal asignado para realizar la reasignación'
      })

    if (this.formOpcionesReasignacion.get('tipoReasignacion')!.value === null)
      return this.messageService.add({
        severity: 'warn',
        detail: 'Debe seleccionar el tipo de reasignación para realizar la reasignación'
      })

    if (this.casosSeleccionados.length === 0)
      return this.messageService.add({
        severity: 'warn',
        detail: 'Debe seleccionar al menos un caso para realizar la reasignación'
      })

    if (this.fiscalAReasignar.value === null)
      return this.messageService.add({
        severity: 'warn',
        detail: 'Debe seleccionar un fiscal a reasignar para realizar la reasignación'
      })

    let casosPorAsignar: any = [];

    this.casosSeleccionados.forEach((caso: CasosAsignados) => {
      let nroCaso = {numeroCaso: caso.idCaso}
      casosPorAsignar.push(nroCaso)
    })

    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `CONFIRMAR REASIGNACIÓN DE CASOS`,
        description: `Por favor confirme la acción de reasignación de casos.
                      Recuerde que el Fiscal inicial ya no tendrá acceso a los
                      casos que serán reasignados; el sistema le enviará una alerta informando la acción.`,
        confirmButtonText: 'Aceptar',
        confirm: true,
      }
    } as DynamicDialogConfig<AlertaData>)

    this.referenciaModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {

          this.spinner.show();

          const tipoReasignacion = this.formOpcionesReasignacion.get('tipoReasignacion')!.value;

          let request: ReasignarCasoRequest = {
            idFiscal: Number(this.fiscalAReasignar.value),
            casos: casosPorAsignar,
            tipoAsignacion: tipoReasignacion
          }
          console.log(request)
          this.confirmarReasignarCaso(request);

        }
      }
    })

  }

  private confirmarReasignarCaso(request: ReasignarCasoRequest): void {

    this.reasignacionService.reasignarCaso(request).subscribe({
      next: resp => {
        console.log("respuestas")
        console.log(resp);

        this.limpiarFiltros();
        this.spinner.hide();

        if (resp.code === 0) {
          this.limpiarFiltros();
          this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: `CASO REASIGNADO`,
              description: `Reasignación de caso realizada correctamente`,
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

        this.spinner.hide();
        this.messageService.add({severity: 'error', detail: `Ha ocurrido un error inesperado`})

      }
    })

  }

  public exportarPdfExcel(exportType: TipoArchivoType): void {

    if (this.casosAsignados.length > 0) {

      const headers = ['Número de caso', 'Etapa', 'Acto Procesal', 'Trámite', 'Fiscal Asignado', 'Fecha Ingreso', 'Fecha Asignación']
      const data:any[] = [];

      this.casosAsignados.forEach((caso: CasosAsignados) => {
        const row = {
          'Número de caso': caso.numeroCaso,
          'Etapa': caso.etapa,
          'Acto Procesal': caso.actoProcesal,
          'Trámite': caso.tramite,
          'Fiscal Asignado': caso.fiscalAsignado,
          'Fecha Ingreso': caso.fechaIngreso,
          'Fecha Asignación': caso.fechaAsignacion,
        }
        data.push(row)
      })

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos para reasignar')
        : this.exportarService.exportarAExcel(data, headers, 'Casos para reasignar')
      return;
    }

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`
    })
  }

}
