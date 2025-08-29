import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AlertaData } from '@interfaces/comunes/alert';
import { AnularAsignacionRequest } from '@interfaces/provincial/administracion-casos/anulacion/AnularAsignacionRequest';
import { CasosAsignados } from '@core/interfaces/comunes/casosAsignados';
import { AnularAsignacionTransaccionalService } from '@services/provincial/anulacion/anular-asignacion-transaccional.service';
import { AsignacionConsultasService } from '@services/provincial/asignacion/asignacion-consultas.service';
import { ReasignacionConsultasSuperiorService } from '@services/reusables/superior/reasignacion-consultas-superior-service';
import { ExportarService } from '@services/shared/exportar.service';
import { MaestroService } from '@services/shared/maestro.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { VisorEfeModalComponent } from '@components/modals/visor-efe-modal/visor-efe-modal.component';
import { DateMaskModule } from '@directives/date-mask.module';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { DateFormatPipe } from '@pipes/format-date.pipe';

@Component({
  standalone: true,
  selector: 'app-anulacion-caso-superior',
  templateUrl: './anulacion-caso-superior.component.html',
  styleUrls: ['./anulacion-caso-superior.component.scss'],
  imports: [
    CommonModule,
    CmpLibModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    RadioButtonModule,
    DateMaskModule,
    ToastModule,
    MenuModule,
    DateFormatPipe
  ]
})
export class AnulacionCasoSuperiorComponent implements OnInit {

  formAnulacion: FormGroup;

  public leyenda:any[] = [];
  casosAsignados: CasosAsignados[] = [];
  casosPorAnularFiltrados: CasosAsignados[] = [];
  casosSeleccionados: CasosAsignados[] = [];
  fiscalAsignado = new FormControl('');
  tiposAsignacion: any[] = [];
  listaFiscalesAsignacion: any[] = [];
  public referenciaModal!: DynamicDialogRef;
  public mostrarFiltros = false;
  public formReseteado: boolean = false;

  opcionesMenu: (data: any) => MenuItem[] = (data: any)=>[];

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private asignacionConsultaService: AsignacionConsultasService,
    private reasignacionConsultasService: ReasignacionConsultasSuperiorService,
    private anularAsignacionTransaccionalService: AnularAsignacionTransaccionalService,
    private maestroService: MaestroService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private exportarService: ExportarService,
  ) {
    this.formAnulacion = this.fb.group({
      tiempoAFiltrar: ['ultimosMeses'],
      buscar: [''],
      fechaAsignacionIni: [''],
      fechaAsignacionFin: [''],
      tipoAsignacion: [''],
    })
  }

  ngOnInit() {
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
          // this.registarCasoLeido(data.id, data.leido)
        }
      },
      {
        label: 'Ver asuntos y observaciones',
        icon: 'file-search-icon',
        command: () => {
          // this.registarCasoLeido(data.id, data.leido)
        }
      },
      {
        label: 'Anular caso',
        icon: 'trash-icon',
        command: () => {
          // this.registarCasoLeido(data.id, data.leido);
          // this.anularCaso(data.numeroCaso)
        }
      },
    ];
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

  loadTiposAsignacion() {
    this.maestroService.getTipoAsignacion()
      .subscribe(
        (result: any) => {
          this.tiposAsignacion = result.data;
        }
      );
  }

  loadFiscalesAsignados() {
    this.asignacionConsultaService.obtenerFiscales()
      .subscribe(
        (result: any) => {
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

  private obtenerLeyenda(casosPorAnularFiltrados:any): void {
    var nroCasosDentroPlazo = 0;
    var nroCasosPorVencer = 0;
    var nroCasosFueraplazo = 0;

    casosPorAnularFiltrados.forEach( (caso:any) => {
        if ((caso.semaforoNro == "1")) {
            nroCasosDentroPlazo += 1;
        } else if ((caso.semaforoNro == "2")) {
            nroCasosPorVencer += 1;
        } else if ((caso.semaforoNro == "3")) {
            nroCasosFueraplazo += 1;
        }
    })

    let respuesta = [];
    let leyenda = { "nombrePlazo": "Dentro del plazo", "cantidad": nroCasosDentroPlazo };
    respuesta.push(leyenda);
    leyenda = { "nombrePlazo": "Plazo por vencer", "cantidad": nroCasosPorVencer };
    respuesta.push(leyenda);
    leyenda = { "nombrePlazo": "Plazo vencido", "cantidad": nroCasosFueraplazo };
    respuesta.push(leyenda);
    this.leyenda = respuesta;
  }

  private busquedaDinamica(): void {
    this.formAnulacion.get('buscar')!.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.filtrarCasosAsignadosPorCampo();
      })
  }

  public filtrarCasosAsignadosPorCampo(): void {

    if (this.formAnulacion.valid) {
      const textoBusqueda = this.formAnulacion.get('buscar')!.value;
      if (!textoBusqueda) {
        this.casosPorAnularFiltrados = [...this.casosAsignados];
        this.obtenerLeyenda(this.casosPorAnularFiltrados);
      } else {
        this.casosPorAnularFiltrados = this.casosAsignados.filter((data) =>
          Object.values(data).some(
            (fieldValue: any) =>
              (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
              fieldValue?.toString()?.toLowerCase().includes(textoBusqueda.toLowerCase())
          )
        );
        this.obtenerLeyenda(this.casosPorAnularFiltrados);
      }
    }
  }

  public limpiarFiltros(): void {
    this.formAnulacion.reset();
    this.fiscalAsignado = new FormControl('');
    this.loadListaCasosAsignados();
  }

  loadListaCasosAsignados() {
    // let tipoElevacion = "724";
    // this.reasignacionConsultasService.getListaCasosAsignadosSuperior(1, tipoElevacion,0)
    //   .subscribe((result: any) => {
    //       this.casosAsignados = result;
    //       this.casosPorAnularFiltrados = [...this.casosAsignados];
    //     }
    //   );
  }

  public obtenerClaseDeTipoAsignacion(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase()
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
    this.mostrarFiltros && this.formAnulacion.get('tiempoAFiltrar')!.setValue('ultimosMeses')
  }

  anularAsignacion(): void {
    if (this.fiscalAsignado.value === null)
      return this.messageService.add({
        severity: 'warn',
        detail: 'Debe seleccionar un fiscal asignado para realizar la anulación'
      })

    let casosPorAnular: any = [];

    this.casosSeleccionados.forEach((caso: CasosAsignados) => {
      let nroCaso = {numeroCaso: caso.idCaso}
      casosPorAnular.push(nroCaso)
    })

    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `CONFIRMAR ANULACIÓN DE ASIGNACIÓN DE CASOS`,
        description: `Por favor confirme la acción de anular la asignación de casos.
                      Recuerde que el Fiscal ya no tendrá acceso a los
                      casos que se les fueron asignados; el sistema le enviará una alerta informando la acción.`,
        confirmButtonText: 'Aceptar',
        confirm: true,
      }
    } as DynamicDialogConfig<AlertaData>)

    this.referenciaModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.spinner.show();

          let request: AnularAsignacionRequest = {
            idFiscalAsignado: '',
            idBandejaElevacion: ''
          }
          console.log(request)
          this.confirmarAnularAsignacion(request);

        }
      }
    })

  }

  private confirmarAnularAsignacion(request: AnularAsignacionRequest): void {

    this.anularAsignacionTransaccionalService.anularAsignacion(request).subscribe({
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
              title: `ASIGNACIÓN DE CASOS ANULADOS`,
              description: `Se realizó la anulación de la asignación del caso correctamente`,
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

  public obtenerClaseDeOrigen(name: string): string {
    let semaforo = 'dentro-del-plazo';
    if (name == "2") {
        semaforo = 'plazo-por-vencer';
    } else if (name == "3") {
        semaforo = 'plazo-vencido';
    }
    return semaforo;
}

}
