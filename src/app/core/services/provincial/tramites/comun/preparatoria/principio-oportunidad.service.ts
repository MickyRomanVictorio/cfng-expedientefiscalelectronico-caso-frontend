import { Injectable } from '@angular/core';
import { PrincipioOportunidadRequest } from '@core/interfaces/provincial/tramites/comun/preparatoria/principio-oportunidad/principio-oportunidad-request';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrincipioOportunidadService {
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/principioOportunidad`;
  urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/principioOportunidad`

  constructor(private apiBase: ApiBaseService) {}

  seleccionarTramites(
    idActoTramiteCaso: string,
    secuenciaTramtie: number
  ): Observable<any> {
    return this.apiBase.get(
      `${this.url}/seleccionar/${idActoTramiteCaso}/${secuenciaTramtie}`
    );
  }

  registrarDisposicionDejaSinEfectoPrincipioOportunidad(
    data: PrincipioOportunidadRequest
  ): Observable<any> {
    return this.apiBase.post(`${this.url}/registrar`, data);
  }


  obtenerDisposicionProvidencia(
    idActoTramiteCaso: string
  ): Observable<any> {
    return this.apiBase.get(`${this.urlTramite}/obtener/${idActoTramiteCaso}/disposicion-providencia`);
  }



}
