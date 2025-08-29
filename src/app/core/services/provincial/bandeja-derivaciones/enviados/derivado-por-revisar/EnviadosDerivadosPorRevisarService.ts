import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { Observable, map } from 'rxjs';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { EnviadosFiltroRequest } from '../EnviadosFiltroRequest';
import { RevertirDerivacionRequest } from '@core/interfaces/provincial/bandeja-derivacion/RevertirDerivacionRequest';

@Injectable({
  providedIn: 'root'
})
export class EnviadosDerivadoPorRevisarService {

  urlService = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/enviados`

  constructor( private apiBase: ApiBaseService ) { }

  obtenerDerivadosPorRevisar(request : EnviadosFiltroRequest): Observable<any> {
    let tipoFecha = request.tipoFecha;
    let fechaDesde = request.fechaDesde;
    let fechaHasta = request.fechaHasta;
    if (typeof fechaDesde == "undefined") fechaDesde = "";
    if (typeof fechaHasta == "undefined") fechaHasta = "";
    if (typeof tipoFecha == "undefined") tipoFecha = 0;

    //return mock(CASOS_ANULADOS)
    return this.apiBase.post(
      `${ this.urlService}/casosDerivadosPorRevisar`, request);
  }


  revertirDerivadosPorRevisar(request : RevertirDerivacionRequest): Observable<any> {
    //return mock(CASOS_ANULADOS)
    return this.apiBase.post( 
      `${ this.urlService}/casosDerivadosPorRevisar/revertir`, request);
  }

  obtenerCasoFiscal(idCaso: String): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFE_EFE}/v1/e/caso/consulta/${idCaso}`);
  }

}
