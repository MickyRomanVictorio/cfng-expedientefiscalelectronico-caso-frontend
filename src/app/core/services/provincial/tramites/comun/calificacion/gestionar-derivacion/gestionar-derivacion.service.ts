import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BACKEND } from '@environments/environment'
import { BehaviorSubject, Observable } from 'rxjs'
import { AlertaFormalizar } from '@interfaces/provincial/tramites/comun/preliminar/formalizar-preparatoria.interface'
import { BaseResponse } from '@interfaces/comunes/genericos.interface'
import { DerivacionInformacion } from '@core/interfaces/provincial/tramites/derivacion/derivacion-informacion.interface'
import { AlertaDerivacion } from '@core/interfaces/provincial/tramites/derivacion/alerta-derivacion.interface'

@Injectable({
  providedIn: 'root'
})
export class GestionarDerivacionService {

  url: string = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/tramite`

  private readonly notificarMensajeAdvertenciaSubject = new BehaviorSubject<boolean>(false)
  notificarMensajeAdvertenciaObservable = this.notificarMensajeAdvertenciaSubject.asObservable()

  constructor(private readonly http: HttpClient) { }

  validarExistenciaCaso( etapa: string, numeroCaso: string, despacho: string): Observable<any> {
    return this.http.get(`${this.url}/${ etapa }/validarcaso/${ numeroCaso }/${ despacho }`, { responseType: 'text' })
  }

  obtenerDatosDerivacion( etapa: string, idActoTramiteCaso: string ): Observable<any> {
    return this.http.get(`${this.url}/${ etapa }/${ idActoTramiteCaso }/gestionarderivacion`)
  }

  guardarDerivacion( idActoTramiteCaso: string, datos: DerivacionInformacion ): Observable<any> {
    return this.http.post(`${this.url}/${ datos.etapa }/${ idActoTramiteCaso }/gestionarderivacion`, datos, { responseType: 'text' })
  }

  validarCasoAcumular( etapa: string, despacho: string, numeroCaso: string ): Observable<any> {
    return this.http.get(`${this.url}/${ etapa }/validarCasoAcumular/${ numeroCaso }/${ despacho }`)
  }

  validarSolicitudAcumulacion( etapa: string, idCaso: string): Observable<any> {
    return this.http.get(`${this.url}/${ etapa }/validarSolicitudAcumulacion/${idCaso}`);
  }

  registraAlertas(etapa: string, data: AlertaDerivacion): Observable<BaseResponse> {
    return this.http.post<BaseResponse>(`${this.url}/${etapa}/alerta/derivacion`, data)
  }

  public notificarMensajeAdvertencia(valor: boolean) {
    this.notificarMensajeAdvertenciaSubject.next(valor)
  }

}