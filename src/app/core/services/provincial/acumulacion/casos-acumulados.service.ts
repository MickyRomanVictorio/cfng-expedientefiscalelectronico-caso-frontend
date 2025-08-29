import { Injectable } from '@angular/core';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { CasoAcumuladoRequest } from '@core/interfaces/provincial/tramites/acumulacion/CasoAcumuladoRequest';
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CasosAcumuladosService {

  urlCasosAnulados = `${BACKEND.CFE_EFE}/v1/e/caso/acumulado/mostrar`

  constructor( private apiBase: ApiBaseService ) { }

  obtenerCasoAcumulado(request : CasoAcumuladoRequest): Observable<any> {
    return this.apiBase.post(
      `${ this.urlCasosAnulados }`, request);
  }

}
