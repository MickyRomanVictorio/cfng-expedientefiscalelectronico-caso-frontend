import {Injectable} from '@angular/core';
import {ApiBaseService} from '@core/services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';
import {AutoResuelveRequest} from "@interfaces/comunes/AutoResuelveRequerimientoRequest";

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoDeclaraConsentidoApelacionQuejaService {
  urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`;

  constructor(private readonly apiBase: ApiBaseService) {
  }

  registrarTramiteApelacion(data: AutoResuelveRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/preliminar/registrarconsentidoapelacion`, data);
  }

  registrarTramiteQueja(data: AutoResuelveRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/preliminar/registrarconsentidoqueja`, data);
  }

}
