import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AdjuntoData } from '@components/generales/visor-pdf-frame/adjunto-data.interface';
import { descargarArchivoB64 } from '@utils/file';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

@Component({
  selector: 'app-visor-pdf-cargo',
  standalone: true,
  templateUrl: './visor-pdf-cargo.component.html',
  styleUrls: ['./visor-pdf-cargo.component.scss'],
  imports: [CommonModule, CmpLibModule],
})
export class VisorPdfCargoComponent {
  obtenerIcono = obtenerIcono;
  descargarArchivoB64 = descargarArchivoB64;
  closable: boolean = false;

  @Input() documentoAdjunto!: AdjuntoData;
  @Input() soloVistaPrevia: boolean = false

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
