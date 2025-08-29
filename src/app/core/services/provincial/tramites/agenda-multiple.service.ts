import { Injectable } from '@angular/core';
import { AgendaNotificacionInterface } from '@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AgendaMultipleService {
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/agendas`;

  constructor(private readonly apiBase: ApiBaseService) {}

  listarAgendaMultiple(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/multiples/${idActoTramiteCaso}`);
  }

  guardarAgendaMultiple(data: AgendaNotificacionInterface[]): Observable<any> {
    return this.apiBase.post(`${this.url}/multiples`, data);
  }

  reprogramarNotificacionAudiencia(
    data: AgendaNotificacionInterface
  ): Observable<any> {
    return this.apiBase.post(
      `${this.url}/multiples/reprogramar-audiencia`,
      data
    );
  }

  listarAgendaAnteriores(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/multiples/${idActoTramiteCaso}/anteriores`
    );
  }

  obtenerAgendaReprogramada(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/reprogramacion/${idActoTramiteCaso}`);
  }


  obtenerAgendaAnterior(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/agendaAnterior/${idActoTramiteCaso}`
    );
  }

  obtenerReprogramacionNotificacion(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/reprogramacionNotificacionAudiencia/${idActoTramiteCaso}`);
  }

  
}
