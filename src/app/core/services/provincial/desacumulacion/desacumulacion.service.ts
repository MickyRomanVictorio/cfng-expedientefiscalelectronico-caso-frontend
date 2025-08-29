import {Injectable} from "@angular/core";
import {ApiBaseService} from "@services/shared/api.base.service";
import {Observable} from "rxjs";
import {BACKEND} from "@environments/environment";
import {Desacumulacion} from "@interfaces/provincial/tramites/comun/calificacion/desacumulacion/desacumulacion.interface";

@Injectable({
  providedIn: 'root'
})
export class DesacumulacionService {

  private url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`;

  constructor(private apiBase: ApiBaseService) {
  }

  validar(idCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/calificacion/validadesacumulacion/${idCaso}`);
  }

  obtener(etapa: string, idActoTramiteCasod: string): Observable<any> {
    return this.apiBase.get(`${this.url}/${etapa}/desacumulacion/${idActoTramiteCasod}`);
  }

  registrar(request: Desacumulacion): Observable<any> {
    return this.apiBase.post(`${this.url}/${request.etapa}/desacumulacion`, request);
  }
}
