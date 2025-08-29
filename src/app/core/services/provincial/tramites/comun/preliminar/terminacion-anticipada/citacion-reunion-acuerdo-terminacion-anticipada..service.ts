import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CitacionReunionAcuerdoTerminacionAnticipadaService {

  urlCaso = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/citacionreunionterminacionanticipada/`

  constructor(
    private readonly apiBase: ApiBaseService
  ) { }

  registrarEditarCitacion(request: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlCaso}guardar`,request
    );
  }
  obtenerDatosCitacion(idActoTramiteCaso:string): Observable<any> {
    return this.apiBase.get(
      `${this.urlCaso}obtenerdatos/${idActoTramiteCaso}`,
    );
  }
  listarCitasAgendadas(idCaso:string): Observable<any> {
    return this.apiBase.get(
      `${this.urlCaso}listarcitasagendadas/${idCaso}`,
    );
  }
  registrarEditarProgramacionCitacion(request: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlCaso}reprogramacion/guardar`,request
    );
  }


}
