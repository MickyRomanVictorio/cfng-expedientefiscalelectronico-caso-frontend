import { Component } from '@angular/core';
import { TabDocumentosComponent } from '@core/components/tab-documentos/tab-documentos.component';
import { obtenerIcono } from '@core/utils/icon';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-modal-visualizar-documento-cuaderno-pruebas',
  standalone: true,
  imports: [CmpLibModule, TabDocumentosComponent],
  templateUrl: './modal-visualizar-documento-cuaderno-pruebas.component.html',
  styleUrl: './modal-visualizar-documento-cuaderno-pruebas.component.scss',
})
export class ModalVisualizarDocumentoCuadernoPruebasComponent {
  protected obtenerIcono = obtenerIcono;
  protected idDocumentos: string[];

  constructor(
    protected referenciaModal: DynamicDialogRef,
    private readonly configuracion: DynamicDialogConfig
  ) {
    this.idDocumentos = this.configuracion.data.idDocumentos;
  }

  protected cancelar() {
    this.referenciaModal.close();
  }
}
