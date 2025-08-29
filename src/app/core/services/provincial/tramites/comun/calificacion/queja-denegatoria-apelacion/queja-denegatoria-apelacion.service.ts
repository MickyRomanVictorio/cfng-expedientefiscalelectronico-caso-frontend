import {Injectable} from "@angular/core";
import {ApiBaseService} from "@services/shared/api.base.service";
import {Observable} from "rxjs";
import {BACKEND} from "@environments/environment";
import {
  QuejaDenegatoriaApelacion
} from "@interfaces/provincial/tramites/comun/cuadernos-incidentales/queja-denegatoria-apelacion/queja-denegatoria-apelacion.interface";

@Injectable({
  providedIn: 'root'
})
export class QuejaDenegatoriaApelacionService {

  private url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`;

  constructor(private apiBase: ApiBaseService) {
  }

  obtener(etapa: string, idCaso: string, idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/${etapa}/quejadenedatoriaapelacion/${idCaso}/${idActoTramiteCaso}/sujetos`);
  }

  registrar(request: QuejaDenegatoriaApelacion): Observable<any> {
    //to do modificar el request.etapa  return this.apiBase.post(`${this.url}/${request.etapa}/quejadenedatoriaapelacion`, request);
    return this.apiBase.post(`${this.url}/preparatoria/quejadenedatoriaapelacion`, request);
  }
}
