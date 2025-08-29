import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RequestRecepcionarCasos } from '@core/interfaces/provincial/recepcion/CasoPorRecepcionar';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BuscarCasosRecibirRequest } from '@core/interfaces/superior/administracion-casos/recepcion/buscar-casos-recibir-request';


@Injectable({
  providedIn: 'root'
})
export class RecepcionCasosSuperiorService {

  url = `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/recepcion`

  constructor(private apiBase: ApiBaseService,
    private http: HttpClient) { }


  obtenerListaCasos(): Observable<any> {
    return this.apiBase.get(`${this.url}/casos`);
  }

  recepcionarCasos(request: RequestRecepcionarCasos[]): Observable<any> {
    return this.apiBase.post(`${this.url}/caso`, request);
  }

  obtenerCasosPorRecibir(request: BuscarCasosRecibirRequest): Observable<any> {
     return this.apiBase.post(`${this.url}/listarcasosporrecibir`, request);
  }


}
