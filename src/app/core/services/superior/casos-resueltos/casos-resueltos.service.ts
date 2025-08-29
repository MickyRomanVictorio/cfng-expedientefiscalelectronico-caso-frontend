import { Injectable } from '@angular/core';
import { BuscarCasosResueltosRequest } from '@core/interfaces/provincial/administracion-casos/casos-resueltos/BuscarCasoResueltoRequest';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CasosResueltosService {

  urlTransaccion: string = `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/caso/resueltos`

  constructor(
    private apiBase: ApiBaseService
  ) { }

  listarCasosResueltosSuperior( request: BuscarCasosResueltosRequest ): Observable<any> {
    let fechaDesde = request.fechaDesde;
    let fechaHasta = request.fechaHasta;
    let tipoElevacion = request.tipoElevacion;
    let tipoFiscalia = request.tipoFiscalia;
    let tipoDespacho = request.tipoDespacho;
    let tipoResultado = request.tipoResultado;
    let tipoFiscalDespacho = request.tipoFiscalDespacho;

    if (typeof fechaDesde == "undefined") fechaDesde = "";
    if (typeof fechaHasta == "undefined") fechaHasta = "";
    if (typeof tipoElevacion == "undefined") tipoElevacion = 0;
    if (typeof tipoFiscalia == "undefined") tipoFiscalia = 0;
    if (typeof tipoDespacho == "undefined") tipoDespacho = 0;
    if (typeof tipoResultado == "undefined") tipoResultado = 0;
    if (typeof tipoFiscalDespacho == "undefined") tipoFiscalDespacho = 0;




    let url = `${this.urlTransaccion}/listado?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&tipoElevacion=${tipoElevacion}&tipoFiscalia=${tipoFiscalia}&tipoDespacho=${tipoDespacho}&tipoResultado=${tipoResultado}&tipoFiscalDespacho=${tipoFiscalDespacho}`;

    return this.apiBase.get(
      url
    );
  }
}
