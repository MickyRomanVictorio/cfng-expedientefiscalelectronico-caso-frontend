import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { AnularAsignacionRequest } from '@core/interfaces/provincial/administracion-casos/anulacion/AnularAsignacionRequest';

@Injectable({
  providedIn: 'root'
})
export class AnularAsignacionTransaccionalService {

  urlCasosReasignados = `${BACKEND.CFE_EFE}/v1/e/caso/asignacion`;

  constructor( private apiBase: ApiBaseService ) { }

  anularAsignacion(request: AnularAsignacionRequest): Observable<any> {
    return this.apiBase.post(`${this.urlCasosReasignados}/anularAsignacion`, request);
  }

}
