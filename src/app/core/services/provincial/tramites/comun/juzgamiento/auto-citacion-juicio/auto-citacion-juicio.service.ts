import { inject, Injectable } from '@angular/core';
import { AutoCitacionJuicio } from '@core/interfaces/provincial/tramites/comun/juzgamiento/auto-citacion-juicio/auto-citacion-juicio.interface';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoCitacionJuicioService {

  private readonly url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/juzgamiento`;

  protected readonly apiBase = inject(ApiBaseService);

  obtenerAutoCitacionJuicio(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/${idActoTramiteCaso}/autocitacionjuicio`);
  }

  registrarAutoCitacionJuicio(data: AutoCitacionJuicio): Observable<any> {
    return this.apiBase.post(`${this.url}/autocitacionjuicio`, data);
  }

}
