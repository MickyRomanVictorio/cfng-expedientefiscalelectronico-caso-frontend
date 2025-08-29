import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BuscarCasosAnuladosRequest } from '@interfaces/provincial/administracion-casos/anulados/BuscarCasosAnuladosRequest';
import { CasoAnuladoRequest } from '@interfaces/provincial/administracion-casos/anulados/CasoAnuladoRequest';
import { CasosAnulados } from '@interfaces/provincial/administracion-casos/anulados/CasosAnulados';
import { ArchivoExportService } from '@services/shared/archivo.export.service';
import { ExportarService } from '@services/shared/exportar.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { CasosAnuladosService } from '@services/provincial/anulados/casos-anulados.service';
import { AsuntoObservacionesComponent } from '@components/modals/asunto-observaciones/asunto-observaciones.component';
import { DelitosYPartesModalComponent } from '@components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { LecturaModalComponent } from '@components/modals/lectura-modal/lectura-modal.component';
import { VisorEfeModalComponent } from '@components/modals/visor-efe-modal/visor-efe-modal.component';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { DateMaskModule } from '@directives/date-mask.module';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import {
  StringUtil,
  IconUtil,
  cleanEmptyFields,
  validarRangoUltimo6MesesForm,
  DateFormatPipe,
} from 'ngx-cfng-core-lib';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';

@Component({
  selector: 'app-listar-casos-anulados',
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
    PaginatorComponent,
  ],
  templateUrl: './listar-casos-anulados.component.html',
  providers: [MessageService, DialogService, DatePipe],
})
export class ListarCasosAnuladosComponent implements OnInit {
  protected formularioFiltrarCasosAnulados!: FormGroup;
  private refModal!: DynamicDialogRef;
  protected mostrarFiltros = false;
  protected casosAnulados!: CasosAnulados[];
  protected casosAnuladosFiltrados: CasosAnulados[] = [];
  protected casosAnuladosSeleccionados: CasosAnulados[] = [];
  private subscriptions: Subscription[] = [];
  protected totalCasosAnulados: number = 0;
  private filtroTiempo: number = 0;
  private today = new Date();
  public resetPage: boolean = false;
  public query: any = { limit: 10, page: 1, where: {} };
  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  public opcionesMenu!: MenuItem[];

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private exportarService: ExportarService,
    private datePipe: DatePipe,
    private casosAnuladosService: CasosAnuladosService,
    private archivoExportService: ArchivoExportService,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil
  ) {}

  ngOnInit(): void {
    this.formBuild();
    this.obtenerCasosAnulados(this.filtroTiempo);
  }

  public obtenerOpcionesMenu(data: any): void {
    this.opcionesMenu = [
      {
        label: 'Ver documentos adjuntos',
        icon: 'file-search-icon',
        command: () => {
          this.verDocumentosAdjuntos(data.idCaso, data.nroCaso);
          this.registarCasoAnuladoLeido(data.idCaso);
        },
      },
      {
        label: 'Ver asuntos y observaciones',
        icon: 'file-search-icon',
        command: () => {
          this.verAsuntosObservaciones(data.idCaso, data.nroCaso);
          this.registarCasoAnuladoLeido(data.idCaso);
        },
      },
      {
        label: 'Ver motivo de anulación',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarMotivoAnulacion(data.nroCaso, data.motivoAnulado);
          this.registarCasoAnuladoLeido(data.idCaso);
        },
      },
    ];
  }

  private formBuild(): void {
    let fechaDesde = new Date(
      this.today.getFullYear(),
      this.today.getMonth() - 6,
      this.today.getDate()
    );
    let fechaHasta = this.today;

    this.formularioFiltrarCasosAnulados = this.fb.group(
      {
        buscar: [''],
        tiempoAFiltrar: ['ultimosMeses'],
        fechaDesde: [fechaDesde],
        fechaHasta: [fechaHasta],
      },
      { validators: validarRangoUltimo6MesesForm }
    );
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
    this.mostrarFiltros &&
      this.formularioFiltrarCasosAnulados
        .get('tiempoAFiltrar')!
        .setValue('ultimosMeses');
  }

  public obtenerCasosAnulados(filtroTiempo: number): void {
    const form = this.formularioFiltrarCasosAnulados.getRawValue();
    const request: BuscarCasosAnuladosRequest = {
      fechaDesde: form.fechaDesde
        ? this.datePipe.transform(form.fechaDesde, 'dd/MM/yyyy')
        : null,
      fechaHasta: form.fechaHasta
        ? this.datePipe.transform(form.fechaHasta, 'dd/MM/yyyy')
        : null,
    };
    request.filtroTiempo = filtroTiempo;
    const payload = cleanEmptyFields(request);

    this.spinner.show();

    this.subscriptions.push(
      this.casosAnuladosService.getCasosAnulados(payload).subscribe({
        next: (resp) => {
          this.spinner.hide();
          this.casosAnulados = resp.map((data: any) => ({
            ...data,
            seleccionado: false,
          }));
          this.casosAnuladosFiltrados = this.casosAnulados;
          this.casosAnuladosSeleccionados = [];
          this.itemPaginado.data.data = this.casosAnuladosFiltrados;
          this.itemPaginado.data.total = this.totalCasosAnulados =
            this.casosAnuladosFiltrados.length;
          this.actualizarPaginaRegistros(this.casosAnuladosFiltrados, false);
        },
        error: (error) => {
          this.spinner.hide();
        },
      })
    );
  }

  public limpiarFiltros(): void {
    this.formBuild();
    this.filtroTiempo = 0;
    this.obtenerCasosAnulados(this.filtroTiempo);
  }

  public filtrarCasosAnulados(): void {
    let textoBusqueda = this.formularioFiltrarCasosAnulados
      .get('buscar')!
      .value.trim();

    this.casosAnuladosFiltrados = this.casosAnulados.filter((item) =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue
            .toString()
            .toLowerCase()
            .includes(textoBusqueda.toLowerCase())
      )
    );

    this.itemPaginado.data.data = this.casosAnuladosFiltrados;
    this.itemPaginado.data.total = this.totalCasosAnulados =
      this.casosAnuladosFiltrados.length;
    this.actualizarPaginaRegistros(this.casosAnuladosFiltrados, true);
  }

  public obtenerClaseTipoOrigen(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase();
  }

  public obtenerNumeroCaso(numeroCaso: string): string {
    return this.stringUtil.obtenerNumeroCaso(numeroCaso);
  }

  public verDelitosPartes(
    idCaso: string,
    numeroCaso: string,
    flagAnulado: number
  ): void {
    this.registarCasoAnuladoLeido(idCaso);
    const verDelitosPartesRef = this.dialogService.open(
      DelitosYPartesModalComponent,
      {
        showHeader: false,
        data: {
          numeroCaso,
          flagAnulado,
        },
      }
    );
    verDelitosPartesRef.onClose.subscribe({
      next: () => this.obtenerCasosAnulados(this.filtroTiempo),
    });
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.casosAnulados.length > 0) {
      const headers = [
        'Número de caso',
        'Origen',
        'Tipo Remitente',
        'Remitente',
        'Teléfono Remitente',
        'Correo Remitente',
        'Fecha Ingreso',
        'Hora Ingreso',
        'Fecha Anulación',
        'Hora Anulación',
      ];
      const data: any[] = [];

      this.casosAnulados.forEach((c: CasosAnulados) => {
        const row = {
          'Número de caso': c.nroCaso,
          Origen: c.origen,
          'Tipo Remitente': c.tipoRemitente,
          Remitente: c.nombreRemitente,
          'Teléfono Remitente': c.telefono,
          'Correo Remitente': c.correo,
          'Fecha Ingreso': c.fechaIngreso,
          'Hora Ingreso': c.horaIngreso,
          'Fecha Anulación': c.fechaAnulacion,
          'Hora Anulación': c.horaAnulacion,
        };
        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(
            data,
            headers,
            'Casos anulados',
            'landscape'
          )
        : this.exportarService.exportarAExcel(data, headers, 'Casos anulados');
      return;
    }

    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
  }

  public mostrarMotivoAnulacion(numeroCaso: string, motivo: string): void {
    const ref = this.dialogService.open(LecturaModalComponent, {
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px' },
      data: {
        numeroCaso: numeroCaso,
        content: motivo,
      },
    });
    ref.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
        }
      },
    });
  }

  private registarCasoAnuladoLeido(idCaso: String): void {
    let request: CasoAnuladoRequest = {
      idCaso: idCaso,
    };
    this.casosAnuladosService.registrarCasoAnuladoLeido(request).subscribe({
      next: (resp) => {
        this.spinner.hide();
        if (resp.code === 0) {
          this.obtenerCasosAnulados(this.filtroTiempo);
        }
      },
      error: (error) => {},
    });
  }

  public obtenerCasosAnuladosPorFiltroFecha(value: number): void {
    this.filtroTiempo = value;
    if (this.filtroTiempo === 0 || this.filtroTiempo === 1) {
      this.obtenerCasosAnulados(this.filtroTiempo);
    }
  }

  exportarArchivoPDF() {
    const tableColumns = [
      'Número de caso',
      'Origen',
      'Remitente',
      'Teléfono remitente',
      'Correo remitente',
      'Fecha ingreso',
      'Hora ingreso',
      'Fecha anulación',
      'Hora anulación',
    ];
    this.archivoExportService.generatePDF(
      this.casosAnulados,
      tableColumns,
      'casos-anulados',
      'landscape'
    );
  }

  generateExcel() {
    const tableColumns = [
      'Número de caso',
      'Origen',
      'Remitente',
      'Teléfono remitente',
      'Correo remitente',
      'Fecha ingreso',
      'Hora ingreso',
      'Fecha anulación',
      'Hora anulación',
    ];
    this.archivoExportService.generateExcel(
      this.casosAnulados,
      tableColumns,
      'casos-anulados'
    );
  }

  private verDocumentosAdjuntos(idCaso: string, numeroCaso: string): void {
    this.refModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      contentStyle: { padding: 0 },
      data: {
        caso: idCaso,
        numeroCaso: numeroCaso,
        idCaso: idCaso,
        title: 'Visor documental del caso:',
        description: 'Hechos del caso',
      },
    });
  }

  private verAsuntosObservaciones(idCaso: string, numeroCaso: string): void {
    this.refModal = this.dialogService.open(AsuntoObservacionesComponent, {
      showHeader: false,
      data: {
        numeroCaso: numeroCaso,
        idCaso: idCaso,
        title: 'Asunto Observaciones',
        description: 'Hechos del caso',
      },
    });
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage);
  }

  actualizarPaginaRegistros(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.casosAnuladosFiltrados = data.slice(start, end);
  }
}
