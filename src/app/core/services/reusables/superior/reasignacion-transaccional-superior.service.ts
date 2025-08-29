import {Injectable} from '@angular/core';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import {Observable} from 'rxjs';
import {BACKEND} from '@environments/environment';
import {ReasignarCasoRequest} from "@core/interfaces/provincial/administracion-casos/reasignacion-casos/reasignar-caso-request.interface";

@Injectable({
  providedIn: 'root'
})
export class ReasignacionTransaccionalService {

  urlCasosReasignados = `${BACKEND.CFE_EFE}/v1/e/caso/reusables/superior`;

  constructor( private apiBase: ApiBaseService ) { }

  reasignarCaso(request: ReasignarCasoRequest): Observable<any> {
    return this.apiBase.post(`${this.urlCasosReasignados}/reasignarCasoSuperior`, request);
  }
}
