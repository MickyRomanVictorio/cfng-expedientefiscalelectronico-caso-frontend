import {Injectable} from "@angular/core";
import {BACKEND} from '@environments/environment';
import {ApiBaseService} from "@core/services/shared/api.base.service";
import {Observable} from 'rxjs';
import { FiltrarCasosPorReasignar } from "@core/interfaces/superior/administracion-casos/reasignacion-casos/filtrar-casos-por-reasignar.interface";

@Injectable({
  providedIn: 'root'
})
export class ReasignacionConsultasSuperiorService {

  urlCasosReasignados= `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/reasignacion`;

  constructor(private apiBase: ApiBaseService) {
  }

  getListaCasosAsignadosSuperior(request: FiltrarCasosPorReasignar): Observable<any> {
    return this.apiBase.post(`${this.urlCasosReasignados}/listarcasosparareasignar`, request);
  }

}
