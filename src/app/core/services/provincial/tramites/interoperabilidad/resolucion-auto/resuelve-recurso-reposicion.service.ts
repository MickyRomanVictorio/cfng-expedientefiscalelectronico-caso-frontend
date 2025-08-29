import {Injectable} from '@angular/core';
import {ApiBaseService} from '@core/services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';
import {AutoResuelveCalificacionSuperiorRequest} from "@interfaces/comunes/AutoResuelveCalificacionSuperiorRequest";

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoResuelveRecursoReposicionService {
  urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/resuelverecursoreposicion`;

  constructor(private readonly apiBase: ApiBaseService) {
  }

  obtenerTramite(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  registrarTramite(data: AutoResuelveCalificacionSuperiorRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}`, data);
  }
  devolverProvincial(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/${idActoTramiteCaso}/devolver`,{});
  }
  registrarTramiteRecurso(data: AutoResuelveCalificacionSuperiorRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/recurso`, data);
  }

}
