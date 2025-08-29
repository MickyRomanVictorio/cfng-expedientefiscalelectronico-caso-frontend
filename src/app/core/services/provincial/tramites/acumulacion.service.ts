import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AcumulacionRequest } from '@core/interfaces/provincial/tramites/acumulacion/acumulacion-request';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';
import { ApiBaseService } from "@core/services/shared/api.base.service";

@Injectable({
  providedIn: 'root'
})

export class AcumulacionService {
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`

  constructor(
    private apiBase: ApiBaseService
  ) { }


  obtenerCasosxAcumular(etapa:string , idCaso: string ): Observable<any>{
    return this.apiBase.get(`${this.url}/${etapa}/acumulacion/${idCaso}/casos`)
  }


  obtenerCasosAcumular(etapa:string , idActoTramiteCaso: string ): Observable<any>{
    return this.apiBase.get(`${this.url}/${etapa}/acumulacion/${idActoTramiteCaso}`);
  }


  guardarAcumulacion(data : AcumulacionRequest ): Observable<any>{
    return this.apiBase.post(`${this.url}/${data.etapa}/acumulacion`,data);
  }

  obtenerDatosTramiteCaso(idActoTramiteCaso: string ): Observable<any>{
    return this.apiBase.get(`${this.url}/calificacion/obtenerDatosTramiteCaso/${idActoTramiteCaso}`);
  }


}
