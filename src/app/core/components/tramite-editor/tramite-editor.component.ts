import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { TramiteLineaComponent } from './tramite-linea/tramite-linea.component';
import { TramiteManualComponent } from './tramite-manual/tramite-manual.component';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { TramiteResponse } from '@core/interfaces/comunes/crearTramite';
@Component({
  selector: 'app-tramite-editor',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    TramiteLineaComponent,
    TramiteManualComponent
  ],
  templateUrl: './tramite-editor.component.html',
})
export class TramiteEditorComponent {
  @Input() codigoDespacho!: string;
  @Input() esFirmado!: boolean;
  @Input() tramiteSeleccionado!: TramiteProcesal ;
  @Input() tramiteResponse! : TramiteResponse;

  activeIndex = 0;

  indexEmitted(number: number) {
    this.activeIndex= number;
  }
}
