import {Injectable} from '@angular/core';
import {ApiBaseService} from '@core/services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';
import {AutoResuelveRequest} from "@interfaces/comunes/AutoResuelveRequerimientoRequest";
import {AutoResuelveCalificacionSuperiorRequest} from "@interfaces/comunes/AutoResuelveCalificacionSuperiorRequest";
import {AutoResuelveDesistimientoRequest} from "@interfaces/comunes/AutoResuelveDesistimiento";

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoResuelveDesistimientoService {
  urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/autoresuelvedesistimiento`;

  constructor(private readonly apiBase: ApiBaseService) {
  }

  obtenerTramite(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  registrarTramite(data: AutoResuelveDesistimientoRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}`, data);
  }

  validaDevolver(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/validadevolver/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  devolverAlFiscalProvincial(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/devolver`, {idActoTramiteCaso : idActoTramiteCaso});
  }

}
