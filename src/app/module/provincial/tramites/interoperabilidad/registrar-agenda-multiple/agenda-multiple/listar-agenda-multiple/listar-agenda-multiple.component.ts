import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { CommonModule } from '@angular/common';
import { AgendaNotificacionInterface } from '@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface';
import { IconUtil, StringUtil } from 'ngx-cfng-core-lib';
import { DialogService } from 'primeng/dynamicdialog';
import { AgendaMultipleLecturaComponent } from '../agenda-multiple-lectura/agenda-multiple-lectura.component';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';

@Component({
  selector: 'app-listar-agenda-multiple',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    TooltipModule,
    ButtonModule,
    CmpLibModule
  ],
  providers: [DialogService],
  templateUrl: './listar-agenda-multiple.component.html',
  styleUrl: './listar-agenda-multiple.component.scss'
})
export class ListarAgendaMultipleComponent {

  @Input()
  public agendasMultiples: AgendaNotificacionInterface[] = [];

  @Input()
  public modoLectura: boolean = true;

  @Output()
  public validarListaAgenda = new EventEmitter<boolean>()

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  protected readonly iconUtil = inject(IconUtil)

  protected readonly stringUtil = inject(StringUtil)

  protected readonly dialogService = inject(DialogService)

  get agendasMultiplesActivas(): AgendaNotificacionInterface[] {
    return (
      this.agendasMultiples.length > 0 ?
        this.agendasMultiples.filter(item => item.estadoAgendaFiscal == '1') :
        []
    )
  }

  protected visualizarAgendaNotificacion(agendaNotificacion: AgendaNotificacionInterface): void {
    this.dialogService.open(AgendaMultipleLecturaComponent, {
      width: '900px',
      showHeader: false,
      contentStyle: { padding: '10px', 'border-radius': '15px' },
      data: { agendaNotificacion }
    })
  }

  protected eliminarAgendaNotificacion(agendaNotificacion: AgendaNotificacionInterface): void {

    const dialog = this.modalDialogService.question(
      'Eliminar registro',
      'A continuación, se eliminará el registro de audiencia ¿Está seguro de realizar la siguiente acción?',
      'Aceptar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          if (agendaNotificacion.idAgendaFiscal) {
            this.agendasMultiples.forEach(item => {
              if (item.idRegistroTabla === agendaNotificacion.idRegistroTabla) item.estadoAgendaFiscal = '0'
            })
          } else {
            const indexToDelete = this.agendasMultiples.findIndex((i) => i.idRegistroTabla === agendaNotificacion.idRegistroTabla);
            this.agendasMultiples.splice(indexToDelete, 1);
          }
          this.validarListaAgenda.emit(this.agendasMultiples.length > 0)

        }
      },
    });
  }


}
