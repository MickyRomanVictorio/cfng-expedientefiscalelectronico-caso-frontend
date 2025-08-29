import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { BuscarTramitesRequest } from '@core/interfaces/reusables/buscar-tramites/buscar-tramites-request.interface';

@Injectable({
  providedIn: 'root'
})
export class ReusableBuscarTramites {
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`

  constructor(private apiBase: ApiBaseService) { }

  buscarTramites(request: BuscarTramitesRequest): Observable<any> {
    return this.apiBase.post(
      `${this.url}/buscar`, request
    );
  }

  genericos(idEtapa: string, idActoProcesal: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/genericos/etapa/${idEtapa}/actoprocesal/${idActoProcesal}`,
    );
  }
}

