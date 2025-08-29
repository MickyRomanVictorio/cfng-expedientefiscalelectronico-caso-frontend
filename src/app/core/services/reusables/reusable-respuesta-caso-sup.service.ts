import { Injectable } from '@angular/core';
import { BACKEND } from "@environments/environment";
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { RespuestaCasoRequest } from '@core/interfaces/comunes/RespuestaCasoRequest';
@Injectable({
  providedIn: 'root'
})

export class RespuestaCasoSupService {

  //url= `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/caso/elevacion/respuestacaso`;
  url= `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/respuestacasosup`;
  //url= `http://localhost:8083/cfe/expedientefiscalelectronico/superior/v1/e/caso/elevacion/respuestacaso`;

  constructor(private apiBase: ApiBaseService) { }

  aceptarCaso(request: any): Observable<any> {
    //return this.apiBase.post(`${this.url}/aceptar`,request);
    return this.apiBase.post(`${this.url}/acepta`,request);
  }

  observarCaso(request: any): Observable<any> {
    //return this.apiBase.post(`${this.url}/observar`, request);
    return this.apiBase.post(`${this.url}/observado`, request);
  }

}
