import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActaAcuerdoTerminacionAnticipadaService {

  urlCaso = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/actaacuerdoterminacionanticipada/`

  constructor(
    private readonly apiBase: ApiBaseService
  ) { }

  registrarEditarTramite(request: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlCaso}guardar`,request
    );
  }
  obtenerDatosTramite(idActoTramiteCaso:string): Observable<any> {
    return this.apiBase.get(
      `${this.urlCaso}obtenerdatos/${idActoTramiteCaso}`,
    );
  }

}
