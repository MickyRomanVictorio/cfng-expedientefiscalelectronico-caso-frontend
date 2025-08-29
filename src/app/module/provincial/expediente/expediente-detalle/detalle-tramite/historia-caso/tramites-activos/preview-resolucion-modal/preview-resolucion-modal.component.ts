import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertaModalComponent } from '@core/components/modals/alerta-modal/alerta-modal.component';
import { AlertaData } from '@core/interfaces/comunes/alert';
import { Tab } from '@core/interfaces/comunes/tab';
import { ReusableArchivoService } from '@core/services/reusables/reusable-archivos.service';
import { ReusablesCargarDocumentos } from '@core/services/reusables/reusable-cargar-documentos.service';
import { ReusableHistorialTramiteService } from '@core/services/reusables/reusable-historial-tramite.service';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TabsViewComponent } from "../../../../../../../../core/components/tabs-view/tabs-view.component";
import { TabViewModule } from 'primeng/tabview';
import { obtenerIcono } from '@core/utils/icon';
import { CmpLibModule } from 'dist/cmp-lib';
import { firstValueFrom, Subscription } from 'rxjs';
import { TramitesActivosService } from '@core/services/reusables/efe/tramites-activos.service';

@Component({
  standalone: true,
  selector: 'app-preview-resolucion-modal',
  templateUrl: './preview-resolucion-modal.component.html',
  styleUrls: ['./preview-resolucion-modal.component.scss'],
  imports: [
    CommonModule,
    NgxCfngCoreModalDialogModule,
    TabsViewComponent,
    TabViewModule,
    CmpLibModule,
],
  providers: [
    NgxCfngCoreModalDialogService
  ],
})
export class PreviewResolucionModalComponent implements OnInit{

  protected documentoRuta: SafeResourceUrl | null = null;
  protected obtenerIcono = obtenerIcono;
  private readonly suscripciones: Subscription[] = [];

  /**public tabs: any[] = [
    {
      header: 'Cargo de documento',
      idNode: '3b109f1a-f2cb-4e8a-98b4-33b4e84756db'
    },
    {
      header: 'Documento',
      idNode: 'c0793636-f9cb-4112-a910-abc020aaa263'
    },
  ];**/

  public tabs: any[] = [];
  public indexActivo: number = 0;
  protected titulo: string = '';
  protected fechaIngreso: string = ''
  public pdfUrl: any;

  constructor(
    private sanitizer: DomSanitizer,
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private spinner: NgxSpinnerService,
    private readonly tramitesActivosService: TramitesActivosService,
    private readonly reusableArchivo: ReusableArchivoService,
    private readonly dialogService: DialogService,
  ) {
    this.titulo = this.config.data.titulo;
  }

  async ngOnInit() {
    this.obtenerDocumentosResolucion();
  }

  private async obtenerDocumentosResolucion(): Promise<void> {
    this.tabs = [];
    try {
      const resp = await firstValueFrom(
        this.tramitesActivosService.obtenerDocumentosResolucion(this.config.data.idActoTramiteCaso)
      );
      console.log('resp = ' , resp)
      this.tabs = resp;
      console.log('tabssss = ', this.tabs)

      if (this.tabs.length) {
        this.initializar();
      }
      
    } catch (error) {
      console.error(error);
    }
  }

  private initializar():void{
    const value = {
      index: 0
    };
    this.cambiarTab(value)
  }

  /**private obtenerDocumentosResolucion(): void {
    this.tabs = []
    this.suscripciones.push(
      this.tramitesActivosService.obtenerDocumentosResolucion(this.config.data.idActoTramiteCaso).subscribe({
        next: (resp: any) => {
          this.tabs = resp;
        },
        error: (error: any) => {
          console.error(error)
        }
      })
    )
  }**/

  cambiarTab(value: any) {
    console.log('value = ', value);
    console.log('value.index = ', value.index)
    console.log('this.tabs = ', this.tabs)

    const tabObject = this.tabs[value.index];
    console.log('tabObject = ', tabObject);

    if (tabObject) {
      const cachedFile = this.tabs.find(
        (f) => f.idNode === tabObject.idNode
      );
      if (cachedFile) {
        console.log('entro cachedFile')
        this.fechaIngreso = tabObject.fechaCreacion;
        this.verDocumentopdf(tabObject.idNode);
      }
    } else {
      this.pdfUrl = null;  // Asignar null si tabObject no existe
      this.fechaIngreso = '';
    }
  }

  verDocumentopdf(iddocumento: string) {
    this.spinner.show();
    this.reusableArchivo.verArchivo(iddocumento, "documento.pdf").subscribe({
      next: (resp: Blob) => {
        this.spinner.hide();
        if (resp.size > 0) {
          const fileUrl = window.URL.createObjectURL(resp);
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
        } else {
          this.mensajeError('Aviso', 'Documento sin contenido');
        }
      },
      error: () => {
        this.mensajeError('Aviso', 'No se encontro el documento');
        this.spinner.hide();
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

  public closeAction(): void {
    this.dialogRef.close('closed');
  }

}