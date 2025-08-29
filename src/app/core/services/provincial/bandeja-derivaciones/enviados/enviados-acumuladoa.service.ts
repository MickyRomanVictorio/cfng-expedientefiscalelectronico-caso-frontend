import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { Observable, map } from 'rxjs';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { EnviadosFiltroRequest } from './EnviadosFiltroRequest';
import { FiltroDerivacionesRequest } from '@core/interfaces/provincial/bandeja-derivacion/enviados/acumulado-aceptados/FiltrosDirivacionesRequest';

@Injectable({
  providedIn: 'root'
})
export class EnviadosAcumuladoAService {

  urlService = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/enviados/acumuladoa`
  urlDerivacionesRecibidosService = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/recibidos`

  constructor( private apiBase: ApiBaseService ) { }

  obtenerAcumuladoDevueltos(request : EnviadosFiltroRequest): Observable<any> {
    let fechaDesde = request.fechaDesde;
    let fechaHasta = request.fechaHasta;
    let tipoFecha = request.tipoFecha;
    if (typeof fechaDesde == "undefined") fechaDesde = "";
    if (typeof fechaHasta == "undefined") fechaHasta = "";
    if (typeof tipoFecha == "undefined") tipoFecha = 0;

    return this.apiBase.get(
      `${ this.urlService}/devueltos?tipoFecha=${tipoFecha}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`
    );
  }

  obtenerDerivacionesEnviadasAcciones(request: FiltroDerivacionesRequest): Observable<any> {
    console.log("obtenerDerivacionesEnviadasAcciones... ", JSON.stringify(request))
    let fechaDesde = request.fechaDesde;
    let fechaHasta = request.fechaHasta;
    let tipoFecha = request.tipoFecha;
    let textBusqueda = request.textBusqueda;
    let accion = request.accion;
    if (typeof textBusqueda == "undefined") textBusqueda = "";
    if (typeof fechaDesde == "undefined") fechaDesde = "";
    if (typeof fechaHasta == "undefined") fechaHasta = "";
    if (typeof tipoFecha == "undefined") tipoFecha = 0;
    if (typeof accion == "undefined") accion = 131;
    return this.apiBase.get(
      `${this.urlService}/aceptadas?textBusqueda=${textBusqueda}&tipofecha=${tipoFecha}&fechadesde=${fechaDesde}&fechahasta=${fechaHasta}&accion=${accion}`
    );
  }

  obtenerDerivacionesRecibidosAcumuladoAceptadas(request: FiltroDerivacionesRequest): Observable<any> {
    console.log("obtenerDerivacionesEnviadasAcciones... ", JSON.stringify(request))
    let fechaDesde = request.fechaDesde;
    let fechaHasta = request.fechaHasta;
    let tipoFecha = request.tipoFecha;
    let textBusqueda = request.textBusqueda;
    let accion = request.accion;
    if (typeof textBusqueda == "undefined") textBusqueda = "";
    if (typeof fechaDesde == "undefined") fechaDesde = "";
    if (typeof fechaHasta == "undefined") fechaHasta = "";
    if (typeof tipoFecha == "undefined") tipoFecha = 0;
    if (typeof accion == "undefined") accion = 125;
    return this.apiBase.get(
      `${this.urlDerivacionesRecibidosService}/aceptadas?textBusqueda=${textBusqueda}&tipoFecha=${tipoFecha}&fechadesde=${fechaDesde}&fechahasta=${fechaHasta}&accion=${accion}`
    );
  }

  obtenerDetalleDevueltos(idBandejaDerivacion: string): Observable<any> {
    return this.apiBase.get(
      `${ this.urlService}/detalleDevueltos?idBandejaDerivacion=${idBandejaDerivacion}`
    );
  }

}
