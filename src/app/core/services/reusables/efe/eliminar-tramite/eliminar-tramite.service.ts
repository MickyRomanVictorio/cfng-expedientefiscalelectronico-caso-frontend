import { Injectable } from '@angular/core';
import { EliminarTramiteRequest } from '@core/interfaces/reusables/eliminar-tramite/eliminar-tramite-request';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EliminarTramiteService {
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/eliminarTramite`;

  constructor(private apiBase: ApiBaseService) {}

  validarEliminarTramite(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}/validar`
    );
  }

  eliminarTramite(request: EliminarTramiteRequest): Observable<any> {
    return this.apiBase.post(`${this.url}/eliminar`, request);
  }

}