import { Injectable } from '@angular/core';
import { RecibidosFiltroRequest } from '@core/interfaces/provincial/bandeja-derivacion/recibidos/RecibidosFiltroRequest';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecibidosAcumuladosRevertidosService {

  urlService = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/bandeja/recibido/acumulado/revertidos`

  constructor( private apiBase: ApiBaseService ) { }

  obtenerDerivadosAcumuladosRevertidos(request : RecibidosFiltroRequest): Observable<any>{
    let fechaDesde = request.fechaDesde;
    let fechaHasta = request.fechaHasta;
    let tipoFecha = request.tipoFecha;
    if (typeof fechaDesde == "undefined") fechaDesde = "";
    if (typeof fechaHasta == "undefined") fechaHasta = "";
    if (typeof tipoFecha == "undefined") tipoFecha = 0;
    return this.apiBase.get(
        `${ this.urlService }?tipoFecha=${tipoFecha}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`
      );
  }

  obtenerReversion( idBandejaDerivacion: string ): Observable<any>{
    return this.apiBase.get(
        `${ this.urlService }/${idBandejaDerivacion}`
      );
  }
}
