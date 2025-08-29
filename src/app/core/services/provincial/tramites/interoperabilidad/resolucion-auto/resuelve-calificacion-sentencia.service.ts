import {Injectable} from '@angular/core';
import {ApiBaseService} from '@core/services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';
import {AutoResuelveRequest} from "@interfaces/comunes/AutoResuelveRequerimientoRequest";
import {AutoResuelveCalificacionSuperiorRequest} from "@interfaces/comunes/AutoResuelveCalificacionSuperiorRequest";
import {AutoResuelveCalificacionSentenciaRequest} from "@interfaces/comunes/AutoResuelveCalificacionSentenciaRequest";

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoResuelveCalificacionSentenciaService {
  urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/autoresuelvecalificacionsentencia`;

  constructor(private readonly apiBase: ApiBaseService) {
  }

  obtenerTramite(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  registrarTramite(data: AutoResuelveCalificacionSentenciaRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}`, data);
  }

  obtenerSujetos(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/sujetos/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  registrarSujetos(data: AutoResuelveCalificacionSuperiorRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/sujetos`, data);
  }

  registrarElevacion(data: any) {
    return this.apiBase.post(`${this.urlTramite}/${data.idActoTramiteCaso}/elevarFiscaliaSuperior`, data);
  }

  validaElevar(idActoTramiteCaso: string) {
    return this.apiBase.get(`${this.urlTramite}/${idActoTramiteCaso}/validaelevar`);
  }

}
