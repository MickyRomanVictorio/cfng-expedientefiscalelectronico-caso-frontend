import {Injectable} from '@angular/core';
import {ApiBaseService} from '@core/services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';
import {AutoResuelveRequest} from "@interfaces/comunes/AutoResuelveRequerimientoRequest";

@Injectable({
  providedIn: 'root',
})
export class RecursoApelacionSentenciaService {
  urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso`;

  constructor(private readonly apiBase: ApiBaseService) {
  }

  obtenerResultadosSentencia(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/sentencia/apelacion/listarsentencias/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }


  obtenerTramite(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/autoresuelve/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  registrarTramite(data: AutoResuelveRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/sentencia/apelacion/registrar`, data);
  }
  registrarTramiteQueja(data: AutoResuelveRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/sentencia/apelacion/registrarQueja`, data);
  }
  registrarTramiteRespuestaQueja(data: AutoResuelveRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/sentencia/apelacion/registrarQuejaResolucion`, data);
  }
    obtenerTramiteRespuestaQueja(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/sentencia/apelacion/obtenerdatostramiteQuejaReso/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }
   registrarTramiteApelacionConsentido(data: AutoResuelveRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/sentencia/apelacion/registrarApelacionConsentido`, data);
  }


}
