import {Injectable} from '@angular/core';
import {ApiBaseService} from '@services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PestanaApelacionSujetoService {
  urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/pestanas`;

  constructor(private readonly apiBase: ApiBaseService) {}

  obtenerSujetosProcesales(idCaso: string, flConRespuesta: any): Observable<any> {
    let url = `${this.urlTramite}/autoresuelve/sujetos/${idCaso}/${flConRespuesta}`;
    return this.apiBase.get(url);
  }

  obtenerSujetosProcesalesSalidaExterna(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/autoresuelve/sujetos-salida-externa/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  obtenerSujetosProcesalesPena(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/autoresuelve/sujetos-pena/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  obtenerSujetosProcesalesProceso(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/autoresuelve/sujetos-proceso/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  obtenerSujetosProcesalesSentencia(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/autoresuelve/sujetos-sentencia/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  registrarSujetosProcesales(idActoTramiteCaso: string, propiedad: string, sujetos: any[]): Observable<any> {
    const listSujetos = sujetos.map(s => ({
      idSujetoCaso: s.idSujetoCaso,
      idTipoParteSujeto: s.idTipoParteSujeto,
      idActoTramiteResultadoSujeto: s.idActoTramiteResultadoSujeto,
      idTipoRespuestaPrincipal: s[propiedad],
    }));

    return this.apiBase.post(`${this.urlTramite}/autoresuelve/sujetos`, {
      idActoTramiteCaso: idActoTramiteCaso,
      listSujetos
    });
  }

  registrarSujetosProcesalesSentencia(idActoTramiteCaso: string, propiedad: string, sujetos: any[]): Observable<any> {
    const listSujetos = sujetos.map(s => ({
      idSujetoCaso: s.idSujetoCaso,
      idDelitoSujeto: s.idDelitoSujeto,
      idPena: s.idPena,
      idActoTramiteCasoGuardado: s.idActoTramiteCasoGuardado,
      idTipoRespuestaPrincipal: s[propiedad],
    }));

    return this.apiBase.post(`${this.urlTramite}/autoresuelve/sujetos-sentencia`, {
      idActoTramiteCaso: idActoTramiteCaso,
      listSujetos
    });
  }

}
