import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { obtenerIcono } from '@core/utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-visualizar-documento-actos-investigacion-modal',
  standalone: true,
  imports: [CmpLibModule],
  templateUrl:
    './visualizar-documento-actos-investigacion-modal.component.html',
  styleUrl: './visualizar-documento-actos-investigacion-modal.component.scss',
})
export class VisualizarDocumentoActosInvestigacionModalComponent {
  protected obtenerIcono = obtenerIcono;
  protected pdfUrl: SafeResourceUrl;

  constructor(
    protected referenciaModal: DynamicDialogRef,
    private configuracion: DynamicDialogConfig,
    private sanitizer: DomSanitizer
  ) {
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.configuracion.data?.url
    );
  }

  protected cancelar() {
    this.referenciaModal.close();
  }
}
