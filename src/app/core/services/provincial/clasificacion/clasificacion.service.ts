import {Injectable} from "@angular/core";
import {ApiBaseService} from "@services/shared/api.base.service";
import {Observable} from "rxjs";
import {BACKEND} from "@environments/environment";
import {RegistrarNotaRequest} from "@core/interfaces/provincial/administracion-casos/calificacion/RegistrarNotaRequest";

@Injectable({
  providedIn: 'root'
})
export class ClasificacionService {

  constructor(private apiBase: ApiBaseService) {
  }

  registrarNota(request: RegistrarNotaRequest): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE}/v1/e/caso/clasificacion/registrarnota`, request
    );
  }
}
