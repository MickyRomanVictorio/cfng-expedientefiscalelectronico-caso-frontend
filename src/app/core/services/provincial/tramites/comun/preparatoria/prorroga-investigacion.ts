import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProrrogaInvestigacionService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/preparatoria`

  constructor(private readonly apiBase: ApiBaseService) {}

  validarRequerimientoProrroga(idCaso: string, idActoTramiteEstado?: string): Observable<any> {
    return this.apiBase.get(`${this.url}/validar/requerimientoprorroga?idCaso=${idCaso}&idActoTramiteEstado=${idActoTramiteEstado}`)
  }
}
