import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HistorialElevacionInterface } from '@core/interfaces/comunes/historialElevacion';
import { HistorialElevacionService } from '@services/provincial/historial-elevacion/historial-elevacion.service';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { DateFormatPipe } from '@pipes/format-date.pipe';
import { obtenerIcono } from '@utils/icon';
import { capitalizedFirstWord } from '@utils/string';
import { obtenerCasoHtml } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { AlertaData } from '@core/interfaces/comunes/alert';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { ReusableArchivoService } from '@core/services/reusables/reusable-archivos.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { PreviewElevacionModalComponent } from '../preview-elevacion-modal/preview-elevacion-modal';

@Component({
  selector: 'app-historial-elevacion',
  standalone: true,
  imports: [
    CommonModule,
    DateFormatPipe,
    TableModule,
    PaginatorComponent,
    CmpLibModule,
  ],
  templateUrl: './historial-elevacion.component.html',
  providers: [NgxCfngCoreModalDialogService],
})
export class HistorialElevacionComponent implements OnInit, OnDestroy {
  private prefijoTitulo: string = 'Historal de ';
  private nombreTipoElevacion: string = '';
  public codigoCaso: string = '';
  public obtenerIcono = obtenerIcono;
  public obtenerCasoHtml = obtenerCasoHtml;
  private subscriptions: Subscription[] = [];
  public historialElevaciones: HistorialElevacionInterface[] = [];
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

  get tituloModalElevacion(): string {
    return capitalizedFirstWord(
      `${this.prefijoTitulo} ${this.nombreTipoElevacion}`
    );
  }

  constructor(
    public referenciaModal: DynamicDialogRef,
    public configuracion: DynamicDialogConfig,
    private historialElevacionService: HistorialElevacionService,
    protected iconUtil: IconUtil,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly reusableArchivo: ReusableArchivoService,
    private readonly dialogService: DialogService,
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  ngOnInit(): void {
    this.listarHistorialElevacion();
  }

  private listarHistorialElevacion() {
    this.subscriptions.push(
      this.historialElevacionService
        .listarHistorialElevacion(
          this.configuracion.data?.idBandejaElevacion,
          this.query.page,
          this.query.limit
        )
        .subscribe({
          next: (resp) => {
            if (resp?.registros?.length > 0) {
              this.nombreTipoElevacion = resp.registros[0].tipoElevacion;
              this.codigoCaso = resp.registros[0].codigoCaso;
            } else {
              this.nombreTipoElevacion = '';
              this.codigoCaso = '';
            }

            this.historialElevaciones = resp.registros || [];
            this.itemPaginado.data.data = this.historialElevaciones;
            this.itemPaginado.data.total = resp.totalElementos || 0;
          },
          error: (error) => {
            this.historialElevaciones = this.itemPaginado.data.data = [];
            this.itemPaginado.data.total = 0;
            console.error(error);
          },
        })
    );
  }

  validarDocumentopdf(historial: HistorialElevacionInterface){
    return historial.idActoTramiteCaso != null;
  }

  verDocumentopdf(historial: HistorialElevacionInterface) {
    const iddocumento = historial.idNode;
    const idDocumentoVersiones = historial.idDocumentoVersiones;
    const idTramite = historial.idTramite;
    const idActoTramiteCaso = historial.idActoTramiteCaso;
    const idActoTramiteEstado = historial.idActoTramiteEstado;
    this.reusableArchivo.verArchivo(iddocumento, "documento.pdf").subscribe({
      next: (resp: Blob) => {
        if (resp.size > 0) {

          this.dialogService.open(PreviewElevacionModalComponent, {
            showHeader: false,
            width: '1000px',
            height: '90vh',
            data: {
              idDocumentoVersiones: idDocumentoVersiones,
              idActoTramiteCaso: idActoTramiteCaso,
              idTramite: idTramite,
              idActoTramiteEstado: idActoTramiteEstado,
            }
          });

        } else {
          this.mensajeError('Aviso', 'Documento sin contenido');
        }
      },
      error: () => {
        /**this.mensajeError('Aviso', 'No se encontro el documento');**/
        this.modalDialogService.warning(
              'VERSIÓN NO DISPONIBLE',
              `Esta versión ya no se encuentra disponible, para más información comuníquese con el área de soporte del sistema`,
              'Aceptar'
            );
      },
    });
  }

  mensajeError(mensaje: any, submensaje: any) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      },
    } as DynamicDialogConfig<AlertaData>);
  }

  public cerrarModal(): void {
    this.referenciaModal.close();
  }

  public onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.listarHistorialElevacion();
  }
}
