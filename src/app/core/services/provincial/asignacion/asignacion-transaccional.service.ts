import { Injectable } from '@angular/core';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';
import { AsignarCasoRequest, CasoLeidoRequest } from '@core/interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest';


@Injectable({
  providedIn: 'root'
})
export class AsignacionTransaccionalService {

  urlTransaccion: string = `${BACKEND.CFE_EFE}/v1/e/caso/asignacion`

  constructor(
    private apiBase: ApiBaseService
  ) { }

  asignarCaso(request: AsignarCasoRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTransaccion}/registrar`, request);
  }

  registrarCasoLeido(request: CasoLeidoRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTransaccion}/casoleido`, request);
  }

}
