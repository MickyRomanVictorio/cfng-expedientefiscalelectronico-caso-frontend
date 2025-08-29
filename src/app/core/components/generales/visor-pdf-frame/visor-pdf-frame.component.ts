import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { descargarArchivoB64 } from '@core/utils/file';
import { obtenerIcono } from '@core/utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { AdjuntoData } from './adjunto-data.interface';

@Component({
  selector: 'app-visor-pdf-frame',
  standalone: true,
  imports: [CommonModule, CmpLibModule],
  templateUrl: './visor-pdf-frame.component.html',
  styleUrls: ['./visor-pdf-frame.component.scss'],
})
export class VisorPdfFrameComponent {
  obtenerIcono = obtenerIcono;
  descargarArchivoB64 = descargarArchivoB64;
  closable: boolean = false;

  @Input() documentoAdjunto!: AdjuntoData;

  get pdfIcon(): string {
    return 'assets/icons/pdf.png';
  }

  descargarArchivo() {
    descargarArchivoB64(
      this.documentoAdjunto.base64!,
      this.documentoAdjunto.namePdf
    );
  }
}
