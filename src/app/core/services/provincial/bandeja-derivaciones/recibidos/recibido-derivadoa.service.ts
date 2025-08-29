import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import {
  DevolverDerivacionRequest,
  DevolverDerivacionResponse
} from '@core/interfaces/provincial/bandeja-derivacion/recibidos/DevolverDerivacionRequest';
import { Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RecibidosDerivadoAService {

  urlService = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/enviados/recibidoa`
  urlServiceRecibido = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/recibidos`
  constructor(private http: HttpClient) { }

  getListaAcumulados(request: any): Observable<any> {
    let fechaDesde = request.fechaDesde;
    let fechaHasta = request.fechaHasta;
    let tipoFecha = request.tipoFecha;
    if (typeof fechaDesde == "undefined") fechaDesde = "";
    if (typeof fechaHasta == "undefined") fechaHasta = "";
    if (typeof tipoFecha == "undefined") tipoFecha = 0;
    return this.http.get(`${this.urlService}/devueltos?tipoFecha=${tipoFecha}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`);
  }

  devolverRecibidosPorRevisar(request : DevolverDerivacionRequest): Observable<any> {
    return this.http.post(`${ this.urlServiceRecibido}/por-revisar/devolver`, request);
  }

  obtenerDevolverRecibidosPorRevisar(idBandeja: string): Observable<DevolverDerivacionResponse> {
    return this.http.get<DevolverDerivacionResponse>(`${ this.urlServiceRecibido}/por-revisar/devolver/${idBandeja}`);
  }
}
