import {Injectable} from '@angular/core';
import {ApiBaseService} from '@core/services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';
import { AutoResuelveAutoSuperiorRequest } from '@core/interfaces/comunes/AutoResuelveAutoSuperiorRequest';

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoResuelveAutoSuperiorService {
  urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/autoresuelveapelacionauto`;

  constructor(private readonly apiBase: ApiBaseService) {
  }

  obtenerTramite(idActoTramiteCaso: string): Observable<any> {
    let url = `${this.urlTramite}/${idActoTramiteCaso}`;
    return this.apiBase.get(url);
  }

  registrarTramite(data: AutoResuelveAutoSuperiorRequest): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}`, data);
  }

  devolverProvincial(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/${idActoTramiteCaso}/devolver`,{});
  }

  aceptarCaso(datos: any): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/aceptar`, datos);
  }

  observarCaso(datos: any): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/observar`, datos);
  }

}
