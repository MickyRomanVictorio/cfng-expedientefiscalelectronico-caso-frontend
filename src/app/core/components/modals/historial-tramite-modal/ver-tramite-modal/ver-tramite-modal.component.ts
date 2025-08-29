import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertaData } from '@interfaces/comunes/alert';
import { ReusableHistorialTramiteService } from '@services/reusables/reusable-historial-tramite.service';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { EncabezadoModalComponent } from '@components/modals/encabezado-modal/encabezado-modal.component';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
  standalone: true,
  selector: 'app-visor-efe-modal',
  templateUrl: './ver-tramite-modal.component.html',
  styleUrls: ['./ver-tramite-modal.component.scss'],
  imports: [
    EncabezadoModalComponent,
    CmpLibModule,
    SharedModule,
    TableModule,
    CommonModule,
    ButtonModule,
  ],
})
export class VerTramiteModalComponent {
  public idDocumentoVersion;

  pdfUrl: any;

  constructor(
    private dialogRef: DynamicDialogRef,
    private reusableHistorialTramiteService: ReusableHistorialTramiteService,
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    protected _sanitizer: DomSanitizer,
    public referenciaModal: DynamicDialogRef
  ) {
    this.idDocumentoVersion = this.config.data.idDocumentoVersion;
  }

  async ngOnInit() {
    let nroDocumento = this.idDocumentoVersion;
    await this.reusableHistorialTramiteService
      .verDocumentoTramite(nroDocumento)
      .subscribe({
        next: (resp) => {
          console.log('data');
          console.log(resp);
          if (resp.code === 200) {
            this.pdfUrl = this._sanitizer.bypassSecurityTrustResourceUrl(
              `data:application/pdf;base64,${String(resp.data[0].archivo)}`
            );
            console.log(this.pdfUrl);
          } else if (resp.code == 204) {
            this.mensajeError('Aviso', 'Documento sin contenido');
          }
        },
      });
  }

  close() {
    this.dialogRef.close();
  }

  mensajeError(mensaje: string, submensaje: string) {
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

  protected readonly obtenerIcono = obtenerIcono;

  public cerrarModal(): void {
    // this.alCerrarModal()
    this.referenciaModal.close();
  }
}
