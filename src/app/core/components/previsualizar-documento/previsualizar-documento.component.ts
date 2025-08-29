import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { obtenerIcono } from '@utils/icon';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-previsualizar-documento',
  standalone: true,
  imports: [CommonModule, NgxExtendedPdfViewerModule, CmpLibModule],
  templateUrl: './previsualizar-documento.component.html',
  styleUrls: ['./previsualizar-documento.component.scss'],
})
export class PrevisualizarDocumentoComponent {
  public pdfUrl: string;
  public pdfIcon: string = 'assets/icons/pdf.png';
  public nombreArchivo: string = '';
  public obtenerIcono = obtenerIcono;

  constructor(
    public config: DynamicDialogConfig,
    public referenciaModal: DynamicDialogRef
  ) {
    this.pdfUrl = config.data.pdfUrl;
    this.nombreArchivo = config.data.nombreArchivo;
  }

  public cerrarPrevisualizacion() {
    this.referenciaModal.close();
  }
}
