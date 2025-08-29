import { Injectable } from '@angular/core';
import { ContiendaCompetencia } from '@core/interfaces/provincial/tramites/comun/calificacion/contienda-competencia/contienda-competencia';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ResuelveContienda
} from "@interfaces/provincial/tramites/comun/calificacion/contienda-competencia/resuelve-contienda.interface";
import { SolicitudContiendaCompetencia } from '@core/interfaces/provincial/tramites/comun/calificacion/contienda-competencia/solicitud-contienda-competencia';

@Injectable({
  providedIn: 'root',
})
export class ContiendaCompetenciaService {

  url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/calificacion`;

  private readonly notificarMensajeAdvertenciaSubject = new BehaviorSubject<string>('')
  notificarMensajeAdvertenciaObservable = this.notificarMensajeAdvertenciaSubject.asObservable()

  constructor(private readonly apiBase: ApiBaseService) {}

  listarDistritosFiscales(): Observable<any> {
    return this.apiBase.get(`${this.url}/distritosfiscales`);
  }

  listarFiscaliasSuperioresYPresidencia(coDistritoFiscal: string): Observable<any> {
    return this.apiBase.get(`${this.url}/fiscaliassuperioresypresidencia/${coDistritoFiscal}`)
  }

  obtenerDatosContiendaCompetencia(idActoTramiteCaso: string ): Observable<any> {
    return this.apiBase.get(`${this.url}/contiendacompetencia/${ idActoTramiteCaso }`);
  }

  guardarContiendaCompetencia(datos: ContiendaCompetencia ): Observable<any> {
    return this.apiBase.post(`${this.url}/guardarcontiendacompetencia`, datos)
  }

  actualizarInformacionContienda(datos: any ): Observable<any> {
    return this.apiBase.post(`${this.url}/contiendacompetencia/actualizafiscalia`, datos)
  }

  obtenerResuelveContienda(etapa: string, idActoTramiteCaso: string): Observable<any> {

    return this.apiBase.get(`${this.url}/resuelvecontienda/${idActoTramiteCaso}`);
  }

  registrarResuelveContienda(request: ResuelveContienda): Observable<any> {
    return this.apiBase.post(`${this.url}/resuelvecontienda`, request);
  }

  guardarSolicitudContienda(datos: SolicitudContiendaCompetencia ): Observable<any> {
    return this.apiBase.post(`${this.url}/guardarsolicitudcontienda`, datos)
  }

  obtenerSolicitudContienda(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/obtenersolicitudcontienda/${idActoTramiteCaso}`);
  }
  aceptaResuelveContiendaEfe(request: ResuelveContienda): Observable<any> {
    return this.apiBase.post(`${this.url}/resuelvecontiendaefe`, request);
  }

  /**
   * @deprecated No se ha identificado su uso
   * @param idActoTramiteCaso
   * @returns
   */
  obtenerResuelveContiendaIdActoTramite(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/obtieneresuelvecontiendaefe/${idActoTramiteCaso}`);
  }

  public notificarMensajeAdvertencia(valor: string) {
    this.notificarMensajeAdvertenciaSubject.next(valor)
  }

}