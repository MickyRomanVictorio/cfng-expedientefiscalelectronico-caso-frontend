import { Injectable } from '@angular/core';
import { BACKEND } from "@environments/environment";
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { BuscarCasosElevacionActuadosRequest } from '@core/interfaces/provincial/tramites/elevacion-actuados/BuscarCasosElevacionActuadosRequest';

@Injectable({
  providedIn: 'root'
})
export class ElevacionActuadoObservadosService {

  url= `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/caso/bandejasObservados/elevacionactuadosobservados`
    constructor(
      private apiBase: ApiBaseService
    ) { }

    obtenerElevacionObservado( idBandejaElevacion: string ): Observable<any>{
        return this.apiBase.get(
            `${ this.url }/${idBandejaElevacion}`
          );
    }

    obtenerListadoDocumentosCasoObservados(numeroCaso: string): Observable<any> {
      return this.apiBase.get(
        `${this.url}/listarDocumentos/${numeroCaso}`
      );
    }
    obtenerCasosObservados( request: BuscarCasosElevacionActuadosRequest ): Observable<any>{
    console.log("request observados",request)
        let url = `${this.url}/observados`;
        return this.apiBase.post( url ,request);
      
    }
}
