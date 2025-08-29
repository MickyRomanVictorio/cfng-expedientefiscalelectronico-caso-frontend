import { Injectable } from '@angular/core';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';
import { AsignarCasoRequest, CasoLeidoRequest } from '@core/interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest';

@Injectable({
  providedIn: 'root'
})
export class AsignacionTransaccionalSuperiorService {

  urlTransaccionSuperior: string = `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/asignacionsuperior`
  urlTransaccion: string = `${BACKEND.CFE_EFE}/v1/e/caso/asignacion`

  constructor(
    private apiBase: ApiBaseService
  ) {}


  asignarCasoSuperior(request: AsignarCasoRequest): Observable<any> {
    return this.apiBase.post(
      `${this.urlTransaccionSuperior}`,
      request
    );
  }


  registrarCasoLeido(request: CasoLeidoRequest): Observable<any> {
    return this.apiBase.post(
      `${this.urlTransaccion}/casoleido`,
      request
    );
  }

}
