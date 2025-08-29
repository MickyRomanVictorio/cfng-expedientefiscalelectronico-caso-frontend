import { Injectable } from '@angular/core';
import { EliminarTramiteRequest } from '@core/interfaces/reusables/eliminar-tramite/eliminar-tramite-request';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TramitesActivosService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/tramites/activos`

  constructor(private apiBase: ApiBaseService) { }

  obtenerTramitesActivos(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${idCaso}`
    )
  }

  obtenerSujetosDelitosTramite(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/sujetosdelitos/${idActoTramiteCaso}`
    )
  }

  obtenerObservacionTramite(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/obtieneobservacion/${idActoTramiteCaso}`
    )
  }

  obtenerMotivoReversion(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/obtienereversion/${idActoTramiteCaso}`
    )
  }

  revertirTramite(request: EliminarTramiteRequest): Observable<any> {
    return this.apiBase.post(`${this.url}/revertir`, request);
  }

  obtenerDocumentosResolucion(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/documentosResolucion/${idActoTramiteCaso}`
    )
  }

}