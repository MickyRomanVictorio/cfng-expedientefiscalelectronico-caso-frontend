import { Injectable } from '@angular/core';
import { AgendaNotificacion } from '@core/interfaces/provincial/tramites/comun/calificacion/agenda-notificacion/agenda-notificacion.interface';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AgendaNotificacionService {
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/agendas`;

  constructor(private apiBase: ApiBaseService) {}

  registrarAgendaNotificacion( datos: AgendaNotificacion ): Observable<any> {
    return this.apiBase.post(`${this.url}/agendanotificacion`, datos);
  }
  
}
