import {Injectable} from '@angular/core';
import {ApiBaseService} from '@services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PestanaApelacionService {
  urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/pestanas`;

  constructor(private readonly apiBase: ApiBaseService) {
  }

  obtenerTramiteInteroperabilidad(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.urlTramite}/autoresuelve/obtenertramite/${idActoTramiteCaso}`);
  }

  registrarTramiteInteroperabilidad(data: any): Observable<any> {
    return this.apiBase.post(`${this.urlTramite}/autoresuelve/registrartramite`, data);
  }

  validaDevolverPestanaSentencia(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.urlTramite}/autoresuelve/validadevolverpestanasentencia/${idActoTramiteCaso}`);
  }

}
