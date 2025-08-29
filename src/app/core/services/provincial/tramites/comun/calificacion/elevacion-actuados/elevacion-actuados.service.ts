import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProcesarElevacionActuados } from '@core/interfaces/provincial/tramites/comun/calificacion/elevacion-actuados/procesar-elevacion-actuados';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ElevacionActuadosService {

  url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`
  urlDocumento: string = `${BACKEND.CFEMAESTROSDOCUMENTOS}/v1/cftm/gestion`

  private myData = new BehaviorSubject<any>(null);

 constructor(private apiBase: ApiBaseService) { }


  obtenerIdDocumentoSolicitudElevacionActuados( idCaso: string, etapa: string ): Observable<any> {
    return this.apiBase.getTexto(`${this.url}/${ etapa }/${ idCaso }/solicitudelevacionactuados`)
  }

  obtenerSolicitudElevacionActuados ( idDocumento: string): Observable<any> {
    return this.apiBase.get(`${this.urlDocumento}/obtienedocumento/${ idDocumento }`)
  }

  listarFiscaliasSuperiores(etapa: string): Observable<any> {
    return this.apiBase.get(`${this.url}/${etapa}/fiscaliassuperiores`);
  }

  guardarDisposicionElevacionActuados(apelacion: ProcesarElevacionActuados): Observable<any> {
    let datos = { "fiscaliaSuperior": apelacion.fiscaliaSuperior};
    return this.apiBase.post(`${this.url}/${apelacion.etapa}/${apelacion.idActoTramiteCaso}/disposicionlevacionactuados`, datos, { responseType: 'text'} )
  }

  obtenerFiscaliaSuperiorSeleccionada( idActoTramiteCaso: string, etapa: string ): Observable<any> {
    return this.apiBase.get(`${this.url}/${etapa}/${ idActoTramiteCaso }/disposicionlevacionactuados`)
  }

  setData(data: any) {
    this.myData.next(data);
  }

  getData$() {
    return this.myData.asObservable();
  }

}
