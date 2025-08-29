import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiBaseService} from '@services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';
import {AutoResuelveRequest} from "@interfaces/comunes/AutoResuelveRequerimientoRequest";

@Injectable({
  providedIn: 'root',
})
export class DeclaraConsentidoRequerimiento {
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucion/autoconsentido`;

  constructor(private apiBase: ApiBaseService, private http: HttpClient) {}

  obtenerAutoRequerimiento(
    idActoTramiteCaso: string
  ): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}`
    );
  }

  registrarTramite(request: AutoResuelveRequest): Observable<any> {
    return this.apiBase.post(
      `${this.url}/registrar`,
      request
    );
  }

  registrarTramiteEFE(request: AutoResuelveRequest): Observable<any> {
    return this.apiBase.post(
      `${this.url}/registrartramite`,
      request
    );
  }
}
