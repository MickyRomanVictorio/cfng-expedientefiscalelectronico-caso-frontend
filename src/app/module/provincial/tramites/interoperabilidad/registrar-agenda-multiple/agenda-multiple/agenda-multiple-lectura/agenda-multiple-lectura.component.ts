import { Component } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { IconUtil } from 'ngx-cfng-core-lib';
import { ButtonModule } from 'primeng/button';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { AgregarAgendaMultipleComponent } from '../agregar-agenda-multiple/agregar-agenda-multiple.component';
import { AgendaNotificacionInterface } from '@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface';

@Component({
  selector: 'app-agenda-multiple-lectura',
  standalone: true,
  imports: [
    CmpLibModule,
    ButtonModule,
    AgregarAgendaMultipleComponent
  ],
  templateUrl: './agenda-multiple-lectura.component.html',
  styleUrl: './agenda-multiple-lectura.component.scss'
})
export class AgendaMultipleLecturaComponent {

  protected agendaNotificacion!: AgendaNotificacionInterface;
  protected modoLectura: boolean = true;
  protected mostrarFechaNotificacion: boolean = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    protected iconUtil: IconUtil
  ) {
    this.agendaNotificacion = this.config.data.agendaNotificacion;
  }

}
