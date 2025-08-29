import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { RevertirDerivacionRequest } from '@core/interfaces/provincial/bandeja-derivacion/RevertirDerivacionRequest';
import { FiltroAcumuladoPorRevisar } from '@core/interfaces/provincial/bandeja-derivacion/enviados/acumulado-por-revisar/FiltroAcumuladoPorRevisar';

@Injectable({
  providedIn: 'root'
})
export class EnviadosAcumuladosPorRevisarService {

  urlService = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/enviados`

  constructor( private apiBase: ApiBaseService ) { }

  obtenerAcumuladosPorRevisar(request : FiltroAcumuladoPorRevisar): Observable<any> {
    let buscar = request.buscarTexto;//
    let fechaDesde = request.fechaDesde;
    let fechaHasta = request.fechaHasta;
    if (typeof buscar == "undefined") buscar = "";
    if (typeof fechaDesde == "undefined") fechaDesde = "";
    if (typeof fechaHasta == "undefined") fechaHasta = "";

    return this.apiBase.post(
      `${ this.urlService}/casosAcumuladosPorRevisar`, request);
  }

  revertirAcumuladosPorRevisar(request : RevertirDerivacionRequest): Observable<any> {
    return this.apiBase.post(
      `${ this.urlService}/casosAcumuladosPorRevisarParaRevertir`, request);
  }

}
