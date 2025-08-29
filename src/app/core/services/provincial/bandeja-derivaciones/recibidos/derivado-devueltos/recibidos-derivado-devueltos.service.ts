import { Injectable } from "@angular/core";
import { RecibidosFiltroRequest } from "@core/interfaces/provincial/bandeja-derivacion/recibidos/RecibidosFiltroRequest";
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { BACKEND } from "@environments/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RecibidosDerivadoDevueltosService {

  urlService = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/recibidos/derivados`

  constructor( private apiBase: ApiBaseService ) { }

  obtenerDerivadoDevueltos(request : RecibidosFiltroRequest): Observable<any> {
    let fechaDesde = request.fechaDesde;
    let fechaHasta = request.fechaHasta;
    let tipoFecha = request.tipoFecha;
    if (typeof fechaDesde == "undefined") fechaDesde = "";
    if (typeof fechaHasta == "undefined") fechaHasta = "";
    if (typeof tipoFecha == "undefined") tipoFecha = 0;
    //return mock(CASOS_ANULADOS)
    return this.apiBase.get(
      `${ this.urlService}/devueltos?tipoFecha=${tipoFecha}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`
    );
  }

}
