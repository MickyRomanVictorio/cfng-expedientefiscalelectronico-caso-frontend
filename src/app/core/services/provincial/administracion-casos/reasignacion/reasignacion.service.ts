import {Injectable} from "@angular/core";
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';
import {ApiBaseService} from "@core/services/shared/api.base.service";
import {FiltrarCasosPorReasignar} from "@core/interfaces/provincial/administracion-casos/reasignacion-casos/filtrar-casos-por-reasignar.interface";
import {ReasignarCasoRequest} from "@core/interfaces/provincial/administracion-casos/reasignacion-casos/reasignar-caso-request.interface";

@Injectable({
  providedIn: 'root'
})
export class ReasignacionService {

  urlCasosReasignados = `${BACKEND.CFE_EFE}/v1/e/caso/reasignacion`;

  constructor(private apiBase: ApiBaseService) {
  }

  listarCasosAsignados(filtros: FiltrarCasosPorReasignar): Observable<any> {
    return this.apiBase.post(`${this.urlCasosReasignados}/casosparareasignacion`, filtros);
  }

  reasignarCaso(request: ReasignarCasoRequest): Observable<any> {
    return this.apiBase.post(`${this.urlCasosReasignados}/reasignacion`, request);
  }

}
