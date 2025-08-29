import {CommonModule} from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TabsViewComponent} from '@components/tabs-view/tabs-view.component';
import {
  Documento,
  InformacionDocumental
} from '@core/interfaces/provincial/documentos-ingresados/InformacionDocumental';
import {SafeUrlPipe} from '@core/pipes/safe-url.pipe';
import {ReusableArchivoService} from '@core/services/reusables/reusable-archivos.service';
import {VisorEfeService} from '@core/services/visor/visor.service';
import {AlertaData} from '@interfaces/comunes/alert';
import {Tab} from '@interfaces/comunes/tab';
import {IconAsset, StringUtil} from 'ngx-cfng-core-lib';
import {NgxSpinnerService} from 'ngx-spinner';
import {ButtonModule} from 'primeng/button';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {TabViewModule} from 'primeng/tabview';
import {Subscription} from 'rxjs';
import {AlertaModalComponent} from '../alerta-modal/alerta-modal.component';
import {AtenderDocumentoComponent} from './components/atender-documento/atender-documento.component';
import {TipoVisor} from './model/visor-documento.model';
import {
  EtiquetaCasoComponent
} from "../../consulta-casos/components/carpeta-caso/etiqueta-caso/etiqueta-caso.component";
import {getEtiquetaConfig} from '@core/utils/utils';
import {NombrePropioPipe} from "@pipes/nombre-propio.pipe";
import {DateFormatPipe} from "@pipes/format-date.pipe";

@Component({
  standalone: true,
  selector: 'previsualizar-documento-modal',
  templateUrl: './previsualizar-documento-modal.component.html',
  styleUrls: ['./previsualizar-documento-modal.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TabsViewComponent,
    TabViewModule,
    AtenderDocumentoComponent,
    SafeUrlPipe,
    DateFormatPipe,
    EtiquetaCasoComponent,
    NombrePropioPipe
  ],
})
export class PrevisualizarDocumentoModalComponent implements OnInit, OnDestroy {

  public informacion: InformacionDocumental;
  public subscriptions: Subscription[] = [];
  public numeroCaso = '';
  public indexSelected = 0;
  public listaDocumentos: Documento[] = [];
  public form!: FormGroup;
  public casoSeleccionado: any = {};
  public tipoVisor: TipoVisor = TipoVisor.PorDefecto;
  public TipoVisorEnum = TipoVisor;
  public tabs: Tab[] = [];
  public indexActivo = 0;
  public pdfUrl: string | null = null;
  public datosObservacion: any;

  constructor(
    private readonly dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly dialogService: DialogService,
    private readonly fb: FormBuilder,
    private readonly bandejaDocumentosVisorService: VisorEfeService,
    private readonly reusableArchivo: ReusableArchivoService,
    private readonly spiner: NgxSpinnerService,
    protected readonly iconAsset: IconAsset,
    protected readonly stringUtil: StringUtil
  ) {
    this.informacion = this.config.data.informacion;
    this.casoSeleccionado = this.config.data.caso;
    this.tipoVisor = this.config.data.tipo;
    this.listaDocumentos = this.informacion.documentosAdjuntos;
    this.numeroCaso = this.informacion.codigoCaso;
    this.datosObservacion = this.config.data.observacion;

    this.tabs = [
      {
        titulo: 'Previsualización',
        ancho: 200,
      }
    ];

    if (this.tipoVisor === TipoVisor.AtenderCaso) {
      this.tabs.push({
        titulo: 'Atender caso elevado',
        ancho: 250
      });
    }

  }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({});
    await this.obtenerDocumentoVisor(this.listaDocumentos[0].idDocumento);
  }

  protected eventoAtenderCaso(dato: any): void {
    this.dialogRef.close(dato);
  }

  protected cambioTab(value: number): void {
    this.indexActivo = value;
  }

  protected obtenerNumeroCaso(): string {
    return this.stringUtil.obtenerNumeroCaso(this.numeroCaso);
  }

  protected descargarDocumentoPdf(item: any): void {
    this.spiner.show();
    this.reusableArchivo.verArchivo(item.archivoId, "documento.pdf").subscribe({
      next: (resp: Blob) => {
        this.spiner.hide();
        if (resp.size > 0) {
          const fileUrl = window.URL.createObjectURL(resp);
          const a = document.createElement('a');
          a.href = fileUrl;
          a.download = item.nombre;
          this.mensajeCorrecto('Descarga exitosa', 'Archivo descargado correctamente');
          a.click();
        } else {
          this.mensajeError('Aviso', 'Documento sin contenido');
        }
      },
      error: () => {
        this.mensajeError('Aviso', 'No se encontro el documento');
        this.spiner.hide();
      },
    });
  }

  protected mensajeCorrecto(mensaje: string, submensaje: string): void {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'success',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      },
    } as DynamicDialogConfig<AlertaData>);
  }

  protected mensajeError(mensaje: string, submensaje: string): void {
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

  protected obtenerDocumentoVisor(idDocumento: any): Promise<void> {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
        this.bandejaDocumentosVisorService
          .getArchivoPorCodigoDocumento(idDocumento)
          .subscribe({
            next: (resp) => {
              const blob = new Blob([resp], {type: 'application/pdf'});
              const url = URL.createObjectURL(blob);
              this.pdfUrl = url;
              resolve();
            },
          })
      );
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected getSizeInMb(size: string): string {
    if (!size) return '0';
    return parseFloat(size).toFixed(2);
  }

  protected getEtiquetaConfig(caso: any): any {
    console.log('caso', caso);
    return getEtiquetaConfig(caso);
  }

}
