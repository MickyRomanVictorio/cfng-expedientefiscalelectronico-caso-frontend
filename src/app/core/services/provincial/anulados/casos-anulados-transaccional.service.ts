import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable, map } from 'rxjs';
import { CasoAnuladoRequest } from '@core/interfaces/provincial/administracion-casos/anulados/CasoAnuladoRequest';

@Injectable({
  providedIn: 'root'
})
export class CasosAnuladosTransaccionalService {

  urlCasosAnulados = `${BACKEND.CFE_EFE}/v1/e/caso/anulado`

  constructor( private apiBase: ApiBaseService ) { }

  registrarCasoAnuladoLeido(request : CasoAnuladoRequest): Observable<any> {
    return this.apiBase.post(
      `${ this.urlCasosAnulados }/leido`, request);
  }

}
