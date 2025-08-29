import { Component } from '@angular/core';
import { IconUtil, RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { AgendaNotificacionInterface } from '@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface';
import { AgendaMultipleComponent } from '@modules/provincial/tramites/interoperabilidad/registrar-agenda-multiple/agenda-multiple/agenda-multiple.component';

@Component({
  selector: 'app-agregar-audiencia',
  standalone: true,
  imports: [
    ButtonModule,
    CmpLibModule,
    AgendaMultipleComponent
  ],
  templateUrl: './agregar-audiencia.component.html',
  styleUrl: './agregar-audiencia.component.scss'
})
export class AgregarAudienciaComponent {

  protected modoLectura: boolean = false;
  protected mostrarFechaNotificacion: boolean = false;
  protected agendasMultiples: AgendaNotificacionInterface[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    protected iconUtil: IconUtil
  ) {
    this.agendasMultiples = config.data.agendasMultiples;
  }

  protected dataAudiencia(): void {
    this.ref.close( { estado: RESPUESTA_MODAL.OK, agendasMultiples: this.agendasMultiples }  );
  }

  protected cerrarModal(): void {
    this.ref.close( { estado: RESPUESTA_MODAL.ERROR, agendasMultiples: null } );
  }
}
