import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CasosRecibidos } from "@services/provincial/bandeja-derivaciones/recibidos/casos-recibidos";
import {BACKEND} from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ApiRecibidosService {

  url = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/recibidos`
  urlService = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/recibidos`
  constructor(private http: HttpClient) {
  }

  getListaRecibidosAcumulados(request: any) { 
    return this.http.post<Array<CasosRecibidos>>(`${this.url}/casosRecibidosAcumuladosPorRevisar`,request ||{});
  }

  getListaRecividos(request: any) {
    return this.http.post<Array<CasosRecibidos>>(`${this.url}/casosRecibidosPorRevisar`,request ||{});
  }

  getListaAcumulados(request: any) {
    return this.http.post<Array<CasosRecibidos>>(`${this.urlService}/acumuladoDevueltos`,request);
  }

}
