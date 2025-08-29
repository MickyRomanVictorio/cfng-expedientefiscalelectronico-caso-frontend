import {Injectable} from '@angular/core';
import {ApiBaseService} from '@core/services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';
import {AutoResuelveRequest} from "@interfaces/comunes/AutoResuelveRequerimientoRequest";

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoResuelveRequerimientoService {
  urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucion`;
  urlTramite2 = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/pestanas`;
  constructor(private readonly apiBase: ApiBaseService) {
  }

  obtenerSujetosProcesales(idActoTramiteCaso: string, flConRespuesta: any): Observable<any> {
    let url = `${this.urlTramite}/autoresuelve/sujetos/${idActoTramiteCaso}/${flConRespuesta}`;
    return this.apiBase.get(url);
  }

  eliminarApelacionResultado(idApelacionResultado: string): Observable<any> {
    let url = `${this.urlTramite}/autoresuelve/sujetos/${idApelacionResultado}`;
    return this.apiBase.delete(url);
  }

  obtenerProcesoInmediato(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/autoresuelve/sujetos/apelacion/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  obtenerSujetosProcesalesPestanas(idActoTramiteCaso: string, flConRespuesta: any): Observable<any> {
    let url = `${this.urlTramite2}/autoresuelve/sujetos/${idActoTramiteCaso}/${flConRespuesta}`;
    return this.apiBase.get(url);
  }

  obtenerTramite(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/autoresuelve/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  registrarTramite(data: AutoResuelveRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/autoresuelve/registrar`, data);
  }

}
