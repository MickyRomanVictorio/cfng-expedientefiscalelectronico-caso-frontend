import { Component, ViewChild } from '@angular/core';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { obtenerIcono } from '@utils/icon';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { AdjuntarArchivoManualComponent } from '@core/components/modals/fuente-investigacion/adjuntar-archivo-manual/adjuntar-archivo-manual.component';
import { ArchivoAdjunto } from '@interfaces/reusables/fuentes-investigacion/ArchivoAdjunto';
import { setThrowInvalidWriteToSignalError } from '@angular/core/primitives/signals';
import { ID_OAID, TIPO_DOCUMENTO } from '@core/constants/constants';
import { format } from 'date-fns';

@Component({
  selector: 'app-modal-agregar-documento',
  standalone: true,
  imports: [
    CmpLibModule,
    ReactiveFormsModule,
    ButtonModule,
    CalendarModule,
    AdjuntarArchivoManualComponent,
  ],
  templateUrl: './modal-agregar-documento.component.html',
  styleUrl: './modal-agregar-documento.component.scss',
})
export class ModalAgregarDocumentoComponent {
  protected obtenerIcono = obtenerIcono;

  @ViewChild(AdjuntarArchivoManualComponent)
  childComponent?: AdjuntarArchivoManualComponent;

  private archivoAdjunto: ArchivoAdjunto = {
    isSelect: false,
    file: null
  };
  protected archivoParaAgregar = true;
  protected archivosAdjuntos: ArchivoAdjunto[] = [];
  protected mostrarTamanoError: boolean = false;
  protected mensajeErrorTamano: string = '';
  protected formatosAceptados: string[] = ['pdf'];

  constructor(protected referenciaModal: DynamicDialogRef) { }

  protected cancelar() {
    this.referenciaModal.close();
  }

  onSelect(event: ArchivoAdjunto) {
    this.archivoAdjunto = event;
    this.archivoParaAgregar = false;
    console.log('archivo: ', this.archivoAdjunto);
    this.eventoAgregar();
  }

  private eventoAgregar(): void {
    if (this.validarTamanoArchivo(this.archivoAdjunto.file!.size)) {
      return;
    } else {
      this.archivosAdjuntos.push(<ArchivoAdjunto>{ ...this.archivoAdjunto });
      this.removeFileAttach();
    }
  }

  removeFileAttach() {
    this.childComponent?.selectedFileToUndefined();
    this.archivoParaAgregar = true;
  }

  private validarTamanoArchivo(tamano: number): boolean {
    if (tamano > 100 * 1048576) {
      this.mostrarTamanoError = true;
      this.mensajeErrorTamano = 'El archivo no puede exceder los 2GB';
      setTimeout(() => {
        this.mostrarTamanoError = false;
      }, 5000);

      return true;
    }
    return false;
  }

  protected eventoAgregarDocumento() {
    for (let archivo of this.archivosAdjuntos) {
      const formData = new FormData();

      formData.append('archivo', archivo.file!);
      // formData.append('idMovimientoCaso', this.idMovimientoCaso);
      formData.append('idTipoDocumento', TIPO_DOCUMENTO.UNKNOWN);
      formData.append('feCreacion', format(new Date(), 'dd/MM/yyyy'));
      formData.append('idOaid', ID_OAID.UNKNOWN);
      formData.append('nuDocumento', archivo.file!.name);
      formData.append('esDocumento', '1');
    }
  }
}
