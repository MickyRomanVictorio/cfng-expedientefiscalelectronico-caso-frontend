import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AgendaNotificacionInterface } from '@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface';
import { AgregarAgendaMultipleComponent } from './agregar-agenda-multiple/agregar-agenda-multiple.component';
import { ListarAgendaMultipleComponent } from './listar-agenda-multiple/listar-agenda-multiple.component';

@Component({
  selector: 'app-agenda-multiple',
  standalone: true,
  imports: [
    AgregarAgendaMultipleComponent,
    ListarAgendaMultipleComponent
  ],
  templateUrl: './agenda-multiple.component.html',
  styleUrl: './agenda-multiple.component.scss'
})
export class AgendaMultipleComponent {

  @Input()
  public agendasMultiples: AgendaNotificacionInterface[] = [];

  @Input()
  public modoLectura: boolean = false;

  @Input()
  public esEditableRecibido: boolean = false;

  @Input()
  public mostrarFechaNotificacion: boolean = false;

  @Output()
  public fechaNotificacion = new EventEmitter<string>();

  @Output()
  public validarListaAgenda = new EventEmitter<boolean>();

  protected alCambiarFechaNotificacion(event: any): void {
    this.fechaNotificacion.emit(event);
  }
  protected alValidarListaAgenda(event: any): void {
    this.validarListaAgenda.emit(event);
  }
}
