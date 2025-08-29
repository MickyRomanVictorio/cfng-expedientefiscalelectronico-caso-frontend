import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { EncabezadoTooltipComponent } from "@components/modals/encabezado-tooltip/encabezado-tooltip.component";
import { PaginatorComponent } from "@components/generales/paginator/paginator.component";
import { BandejaContiendaResponse } from '@interfaces/provincial/bandeja-contiendas/BandejaContiendaResponse';
import { BandejaContiendaRequest } from '@interfaces/provincial/bandeja-contiendas/BandejaContiendasRequest';
import { BandejaContiendasService } from '@services/provincial/bandeja-contiendas/bandeja-contiendas.service';
import { CasoStorageService } from '@services/shared/caso-storage.service';
import {
  CONSTANTE_PAGINACION,
  LECTURA_CASO,
  NOMBRES_CABECERA_RECEPCION,
} from '@core/types/efe/provincial/administracion-casos/asignacion/recepcion-casos.type';
import { TipoArchivoType } from '@core/types/exportar.type';
import { DateMaskModule } from '@directives/date-mask.module';
import { ResponseCatalogModel } from '@models/response.model';
import { ExportarService } from '@services/shared/exportar.service';
import { ActualizarInformacionContiendaComponent } from '@components/modals/actualizar-informacion-contienda/actualizar-informacion-contienda.component';
import { HistorialElevacionComponent } from '@components/modals/historial-elevacion/historial-elevacion.component';
import { ReversionElevacionModalComponent } from '@components/modals/reversion-elevacion-modal/reversion-elevacion-modal.component';
import { FilterComponent } from '@components/generales/filter/filter.component';
import { obtenerRutaParaEtapa } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule, DynamicDialogRef, } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { StringUtil, IconUtil, DateFormatPipe } from 'ngx-cfng-core-lib';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';

@Component({
  selector: 'app-listar-casos-por-contiendas',
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
  templateUrl: './listar-casos-por-contiendas.component.html',
  styleUrl: './listar-casos-por-contiendas.component.scss',
  providers: [MessageService, DialogService, DatePipe, NgxCfngCoreModalDialogService],
})
export class ListarCasosPorContiendasComponent implements OnInit {

  public LECTURA_CASO = LECTURA_CASO;
  protected referenciaModal!: DynamicDialogRef;
  protected formularioFiltrarCasos!: FormGroup;
  private subscriptions: Subscription[] = [];
  protected casosSeleccionados = [];
  public totalCasosAsignar: number = 0
  protected resetPage: boolean = false;
  protected query: any = { limit: 10, page: 1, where: {} }
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  private casosPorContiendasTmp: BandejaContiendaResponse[] = [];
  protected casosPorContiendas: BandejaContiendaResponse[] = [];
  private busquedaAvanzada: boolean = false;
  protected totalPorVencer: number = 0;
  protected totalVencido: number = 0;
  protected tituloTootip: string = "Se mostrará en color:";
  protected tiposContiendas: any[] = [];

  protected items!: (data: any) => MenuItem[];

  protected origen: ResponseCatalogModel;
  protected loading: boolean = true;
  headExportPDF = [NOMBRES_CABECERA_RECEPCION];

  protected mostrarFiltros = false;
  private today = new Date();
  private r: any;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private dialogService: DialogService,
    private messageService: MessageService,
    private exportarService: ExportarService,
    private casoStorageService: CasoStorageService,
    private bandejaContiendasService: BandejaContiendasService,
    private datePipe: DatePipe,
    private router: Router,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
  ) {
    this.origen = { isLoading: false, data: [] };
  }

  first = CONSTANTE_PAGINACION.FIRST;
  rows = CONSTANTE_PAGINACION.ROWS;

  ngOnInit(): void {
    this.loading = false;
    this.formBuild();
    this.obtenerBandejaContiendas();
    this.tiposContiendas = [
      { id: 987, name: 'Positiva' },
      { id: 988, name: 'Negativa' }
    ];
  }

  public eventoMostrarOcultarFiltros(): void {
    this.busquedaAvanzada = true;
    this.mostrarFiltros = !this.mostrarFiltros;
    if (!this.mostrarFiltros) {
      this.limpiarFiltros();
      this.obtenerBandejaContiendas();
    }
  }

  public obtenerBandejaContiendas(): void {
    let fechaDesde = this.datePipe.transform(this.formularioFiltrarCasos.get('fechaDesde')!.value, 'dd/MM/yyyy');
    let fechaHasta = this.datePipe.transform(this.formularioFiltrarCasos.get('fechaHasta')!.value, 'dd/MM/yyyy');
    let body: BandejaContiendaRequest = {
      texto: this.formularioFiltrarCasos.get('texto')!.value,
      idTipoContienda: this.formularioFiltrarCasos.get('idTipoContienda')!.value,
      fechaDesde: fechaDesde,
      fechaHasta: fechaHasta,
    }
    this.subscriptions.push(
      this.bandejaContiendasService.obtenerContiendas(body)
        .subscribe({
          next: resp => {
            this.casosPorContiendasTmp = resp.data.map((caso: any) => ({ ...caso, seleccionado: false }));
            this.casosPorContiendas = this.casosPorContiendasTmp;
            this.casosSeleccionados = [];
            this.itemPaginado.data.data = this.casosPorContiendas
            this.itemPaginado.data.total = this.totalCasosAsignar = this.casosPorContiendasTmp.length
            this.actualizarPaginaRegistros(this.casosPorContiendas, false);
          },
          error: error => {
          }
        })
    )
  }

  public filtrarCasos(): void {
    let textoBusqueda = this.formularioFiltrarCasos.get('texto')!.value;
    this.casosPorContiendas = this.casosPorContiendasTmp.filter(item =>
      Object.values(item).some((fieldValue: any) =>
        (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
        fieldValue?.toString()?.toLowerCase().includes(textoBusqueda?.toLowerCase())
      )
    );
    this.itemPaginado.data.data = this.casosPorContiendas
    this.itemPaginado.data.total = this.totalCasosAsignar = this.casosPorContiendas.length
    this.actualizarPaginaRegistros(this.casosPorContiendas, true)
    this.casosSeleccionados = []
  }

  private formBuild(): void {
    this.formularioFiltrarCasos = this.fb.group({
      texto: [''],
      idTipoContienda: [null],
      fechaDesde: [new Date(new Date().setMonth(new Date().getMonth() - 6))],
      fechaHasta: [new Date()],
    });
  }

  setFormFiltro() {
    let dia = this.today.getDate() - 30 * 6;
    let fechaDesde = new Date(this.today.setDate(dia));
    let fechaHasta = new Date();
    this.formularioFiltrarCasos.get('fechaDesde')!.setValue(fechaDesde);
    this.formularioFiltrarCasos.get('fechaHasta')!.setValue(fechaHasta);
  }

  public limpiarFiltros(): void {
    this.formBuild();
    this.obtenerBandejaContiendas();
  }

  public getClass(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase();
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.casosPorContiendas.length > 0) {
      const data: any[] = [];
      const headers = ['Número de caso', 'Destino', 'Asignado a', 'Fecha elevación', 'Hora de Ingreso']
      this.casosPorContiendas.forEach((c: BandejaContiendaResponse) => {
        const row = {
          'Número de caso': c.coCaso,
          'Destino': c.noEntidad,
          'Asignado a': c.noFiscalAsignado,
          'Fecha elevación': c.fechaElevacion,
          'Hora de Ingreso': c.horaElevacion,
        };
        data.push(row);
      });
      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos por contiendas')
        : this.exportarService.exportarAExcel(data, headers, 'Casos por contiendas')
      return;
    }
    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`,
    });
  }

  public revertirElevacion(numeroCaso: string, idCaso: string, idBandejaDerivacion: string, noEntidad: string, idBandejaElevacion: string, idEtapa: string, idActoTramiteCaso: string): void {
    this.subscriptions.push(
      this.bandejaContiendasService
        .verificarFiscalAsignado(idBandejaElevacion)
        .subscribe({
          next: (resp) => {
            if(resp.message==='EXISTE'){
              this.modalDialogService.error(
                'Este caso no se puede revertir',
                'Este caso ya ha sido asignado a un fiscal superior, por lo que no se puede revertir',
                'Aceptar',
              )
            }else{
              this.abrirReversionElevacion(numeroCaso, idCaso, idBandejaDerivacion, noEntidad, idBandejaElevacion, idEtapa, idActoTramiteCaso);
            }
          },
          error: (error) => {
            console.error(error);
          },
        })
    );
  }

  public abrirReversionElevacion(numeroCaso: string, idCaso: string, idBandejaDerivacion: string, noEntidad: string, idBandejaElevacion: string, idEtapa: string, idActoTramiteCaso: string): void {
    const revertirCasoRef = this.dialogService.open(ReversionElevacionModalComponent, {
      width: '800px',
      contentStyle: { 'overflow-y': 'auto', 'padding': '1.5vw' },
      baseZIndex: 10000,
      showHeader: false,
      data: {
        tipoAccion: "0",
        idBandejaDerivacion: idBandejaDerivacion,
        caso: numeroCaso,
        idCaso: idCaso,
        titulo: 'REVERTIR ELEVACIÓN - ',
        descripcion: 'Detalles reversión',
        noEntidad: noEntidad,
        idBandejaElevacion: idBandejaElevacion,
        idEtapa: idEtapa,
        idActoTramiteCaso: idActoTramiteCaso
      }
    })
    revertirCasoRef.onClose.subscribe({
      next: (data) => {
        if (data === 'confirm') {
          this.obtenerBandejaContiendas();
        }
      },
      error: error => { }
    })
  }

  public actualizarInformacion(idCaso: string, idBandejaElevacion: string, coEntidad: string, idTipoEntidad: number, noEntidad: string): void {
    this.subscriptions.push(
      this.bandejaContiendasService
        .verificarProcedenteImprocedente(idBandejaElevacion)
        .subscribe({
          next: (resp) => {
            if(resp.message==='EXISTE'){
              this.modalDialogService.error(
                'No se puede editar el destino',
                'Este caso ya tiene registrado un trámite de improcedencia o procedencia de contienda de competencia registrada, por lo que no se puede editar el destino',
                'Aceptar',
              ).subscribe((resp: string) => {
                if (resp === 'confirmado') {
                  this.obtenerBandejaContiendas();
                }
              });
            }else{
              this.abrirActualizarInformacionContienda(idCaso, idBandejaElevacion, coEntidad, idTipoEntidad, noEntidad);
            }
          },
          error: (error) => {
            console.error(error);
          },
        })
    );
  }

  public abrirActualizarInformacionContienda(idCaso: string, idBandejaElevacion: string, coEntidad: string, idTipoEntidad: number, noEntidad: string): void {
    console.log('entro abrirActualizarInformacionContienda')
    const actualizarCasoRef = this.dialogService.open(ActualizarInformacionContiendaComponent, {
      width: '800px',
      contentStyle: { 'overflow-y': 'auto', 'padding': '1.5vw' },
      baseZIndex: 10000,
      showHeader: false,
      data: {
        idCaso: idCaso,
        idBandejaElevacion: idBandejaElevacion,
        coEntidad: coEntidad,
        idTipoEntidad: idTipoEntidad,
        /**titulo: 'REVERTIR ELEVACIÓN',
        descripcion: 'Detalles reversión',**/
        presidencia: noEntidad,
      }
    })
    actualizarCasoRef.onClose.subscribe({
      next: (data) => {
        if (data === 'confirm') {
          console.log('entro a cargar bandeja');
          this.obtenerBandejaContiendas();
        }
      },
      error: error => {}
    })
  }

  public async redirectActoProcesal(idEtapa: string, idCaso: string, idActoTramiteCaso: string) {
    await this.casoStorageService.actualizarCasoFiscalTabDetalle(idCaso, '1');
    // const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(idEtapa)}/caso/${idCaso}/actoprocesal/${idActoTramiteCaso}`
    const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(idEtapa)}/caso/${idCaso}/acto-procesal`;
    this.router.navigate([`${ruta}`]);
  }

  public abrirModalHistorial(dataSuperior: any): void {
    this.dialogService.open(HistorialElevacionComponent, {
      showHeader: false,
      width: '90%',
      contentStyle: { overflow: 'auto' },
      data: {
        idBandejaElevacion: dataSuperior.idBandejaElevacion
      }
    });
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
    this.casosPorContiendas = data.slice(start, end);
  }

  public vaidarBotonRevertir(idFiscalAsignado: string, estadoRegistro: number):boolean{
    return idFiscalAsignado != null ? true : estadoRegistro === 943 ? true : false;//BORRADOR
  }

}
