import {Injectable} from "@angular/core";
import {ApiBaseService} from "@services/shared/api.base.service";
import {Observable} from "rxjs";
import {BACKEND} from "@environments/environment";
import {
  RecursoApelacion
} from "@interfaces/provincial/tramites/comun/cuadernos-incidentales/recurso-apelacion/recurso-apelacion.interface";

@Injectable({
  providedIn: 'root'
})
export class RecursoApelacionService {

  private url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`;

  constructor(private apiBase: ApiBaseService) {
  }

  registrar(request: RecursoApelacion): Observable<any> {
    return this.apiBase.post(`${this.url}/preliminar/recursoapelacion`, request);
  }
}
