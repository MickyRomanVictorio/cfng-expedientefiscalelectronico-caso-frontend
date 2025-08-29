import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RegistrarAgendaNotificacionesReprogramarComponent } from '@core/components/registrar-agenda-notificacion-reprogramar/registrar-agenda-notificacion-reprogramar.component';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';

@Component({
  selector: 'app-auto-reprogramacion-juicio',
  standalone: true,
  imports: [RegistrarAgendaNotificacionesReprogramarComponent],
  templateUrl: './auto-reprogramacion-juicio.component.html',
  styleUrl: './auto-reprogramacion-juicio.component.scss',
})
export class AutoReprogramacionJuicioComponent {
  
  @Input() idCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() esNuevo: boolean = false;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso;
    }
  }
  @Input() idActoTramiteProcesalEnlace: string = '';
  @Input() tramiteEnModoEdicion: boolean = false;
  @Output() datosFormulario = new EventEmitter<Object>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  private _idActoTramiteCaso: string = '';
}
