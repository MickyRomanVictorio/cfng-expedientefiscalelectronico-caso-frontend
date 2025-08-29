import {Injectable} from '@angular/core';
import {BACKEND} from '@environments/environment';
import {ApiBaseService} from "@core/services/shared/api.base.service";
import {Observable} from 'rxjs';
import { ResolucionIncoacionInmediata } from '@core/interfaces/provincial/tramites/especiales/incoacion/registrar-resolucion';
import { MensajeFirma } from '@interfaces/reusables/firma-digital/mensaje-firma.interface';
import { AlertaFormalizar } from '@interfaces/provincial/tramites/comun/preliminar/formalizar-preparatoria.interface';
import { BaseResponse, Response } from '@interfaces/comunes/genericos.interface';

// import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegistroResolucionIncoacionService {

  urlTramites = `${BACKEND.CFE_EFE_TRAMITES}/v1/procesosespeciales/incoacion`

  constructor(
    private apiBase: ApiBaseService,
  ) {
  }

  obtenerInfoIncoacion(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}/listar/resolucion/${idActoTramiteCaso}`
    );
  }

  reiniciarInfoIncoacion(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}/reiniciar/resolucion/${idActoTramiteCaso}`
    );
  }

  registrarinocoacion(request: ResolucionIncoacionInmediata): Observable<MensajeFirma> {
    return this.apiBase.post(
      `${this.urlTramites}/registrar/resolucion`, request
    );
  }

  validarAudiosDeAudiencia(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}/valida/audioaudiencia/${idActoTramiteCaso}`
    );
  }

  validarResultadosDeAudiencia(request: ResolucionIncoacionInmediata): Observable<any> {
    return this.apiBase.post(
      `${this.urlTramites}/valida/resultadoaudiencia`, request
    );
  }

  validarAlertas(idActoTramiteCaso: string): Observable<Response<string>> {
    return this.apiBase.get(`${this.urlTramites}/valida/alerta/${idActoTramiteCaso}`);
  }

  registraAlertas(etapa: string, data: AlertaFormalizar): Observable<BaseResponse> {
    return this.apiBase.post(`${this.urlTramites}/alerta/resolucion`, data);
  }

}
