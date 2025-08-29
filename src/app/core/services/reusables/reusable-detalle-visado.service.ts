import { inject, Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReusableDetalleVisadoService {

  urlvisado = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/visado`;

  private readonly apiBase = inject(ApiBaseService);

  verDetalleVisado(idBandejaActoTramite: string): Observable<any> {
    return this.apiBase.get(`${this.urlvisado}/detalle/${idBandejaActoTramite}`);
  }

  cancelarInvitacionVisado(idBandejaActoTramite: string): Observable<any> {
    return this.apiBase.delete(`${this.urlvisado}/cancelarinvitacion/${idBandejaActoTramite}`);
  }

}
