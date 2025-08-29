import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { AlertaData } from '@interfaces/comunes/alert';
import { ReusableHistorialTramiteService } from '@services/reusables/reusable-historial-tramite.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-tab-documentos',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    NgxExtendedPdfViewerModule,
    TabMenuModule,
  ],
  templateUrl: './tab-documentos.component.html',
  providers: [DialogService],
})
export class TabDocumentosComponent implements OnInit {
  @Input() idDocumentos: string[] = [];
  @Input() tipoOrigen: number = 0;

  indexActivo = 0;

  maxIndexFile = 2;
  cachedFiles: { idDocumento: string; file: string }[] = [];

  base64PdfFile = '';
  public tabs: any[] = [
    {
      label: 'Cargo',
      ancho: 110,
    },
    {
      label: 'Documento',
      ancho: 160,
    },
  ];

  constructor(
    private documentoService: ReusableHistorialTramiteService,
    private spinner: NgxSpinnerService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    console.log('tipoOrigen', this.tipoOrigen);

    if (Array.isArray(this.idDocumentos)) {
      this.cargarDocumento(this.idDocumentos[0]);
    }
  }

  cambiarTab(evt: any) {
    this.spinner.show();

    if (evt.index > this.maxIndexFile) {
      return;
    }

    this.indexActivo = evt.index;
    const idDocumento = this.idDocumentos[evt.index];
    const cachedFile = this.cachedFiles.find(
      (f) => f.idDocumento === idDocumento
    );
    if (cachedFile) {
      this.base64PdfFile = cachedFile.file;
      this.spinner.hide();
      return;
    }

    this.cargarDocumento(idDocumento);
  }

  openModal() {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error', //'info',
        title: 'ERROR',
        description: 'Error al recuperar el documento',
        confirmButtonText: 'OK',
        confirm: false,
      },
    } as DynamicDialogConfig<AlertaData>);
  }

  onPageRendered() {
    this.spinner.hide();
  }

  cargarDocumento(idDocumento: string) {
    this.spinner.show();
    this.documentoService.verDocumentoTramite(idDocumento).subscribe({
      next: (d) => {
        this.base64PdfFile = `${d.archivo}`;
        this.cachedFiles.push({
          idDocumento: idDocumento,
          file: this.base64PdfFile,
        });
      },
      error: () => {
        this.base64PdfFile = '';
        this.openModal();
        this.spinner.hide();
      },
    });
  }
}
