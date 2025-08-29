import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReusablesCargarDocumentos } from '@core/services/reusables/reusable-cargar-documentos.service';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  standalone: true,
  selector: 'app-preview-doc-modal',
  templateUrl: './preview-doc-modal.component.html',
  styleUrls: ['./preview-doc-modal.component.scss'],
  imports: [
    CommonModule,
    NgxCfngCoreModalDialogModule
  ],
  providers: [
    NgxCfngCoreModalDialogService
  ],
})
export class PreviewDocModalComponent {

  protected documentoRuta: SafeResourceUrl | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private reusableCargarDocumentos: ReusablesCargarDocumentos
  ) {
    this.abrirModal(config.data);
  }

  abrirModal(idDocumento: string) {
    this.cargarDocumento(idDocumento);
  }

  cargarDocumento(idDocumento: string) {
    this.reusableCargarDocumentos.verPdf(idDocumento).subscribe({
      next: (resp) => {
        if (resp && resp.archivo) {
          const archivoBase64 = resp.archivo;
          this.documentoRuta = this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:application/pdf;base64,${archivoBase64}`
          );
        } else {
          console.error('La respuesta del backend no contiene el archivo esperado.');
          this.documentoRuta = null; // Manejar caso de error
        }
      },
      error: (err) => {
        console.error('Error al cargar el documento:', err);
        this.documentoRuta = null; // Manejar caso de error
      },
    });
  }

  public closeAction(): void {
    this.dialogRef.close('closed');
  }
}