import { Injectable } from '@angular/core';
import { GenericResponseList } from '@core/interfaces/comunes/GenericResponse';
import {
  RegistrarMedidasMultipleRequest,
  RegistrarMedidasRequest,
  SupuestosRequest,
} from '@core/interfaces/provincial/tramites/comun/calificacion/requerimiento-incoacion/registrar-requerimiento.interface';
import { SujetoProcesal } from '@core/interfaces/provincial/tramites/comun/calificacion/requerimiento-incoacion/sujetos-procesales.interface';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequerimientoIncoacionService {
  urlSujeto = `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion`;
  urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/procesosespeciales/incoacion`;

  constructor(protected apiBase: ApiBaseService) {}

  obtenerInvestigados(
    idCaso: string
  ): Observable<GenericResponseList<SujetoProcesal>> {
    return this.apiBase.get(`${this.urlSujeto}/investigados/${idCaso}`);
  }

  guardarSupuestos(data: SupuestosRequest): Observable<any> {
    return this.apiBase.post(
      `${this.urlTramite}/registrar/requerimiento/supuestos`,
      data
    );
  }

  obtenerMedidasCoercionSujetos(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramite}/listar/requerimiento/${idActoTramiteCaso}`
    );
  }

  guardarMedidaCoercion(data: RegistrarMedidasRequest): Observable<any> {
    return this.apiBase.post(
      `${this.urlTramite}/registrar/requerimiento`,
      data
    );
  }
  guardarMedidaCoercionMultiple(data: RegistrarMedidasMultipleRequest): Observable<any> {
    return this.apiBase.post(
      `${this.urlTramite}/registrar-multiple/requerimiento`,
      data
    );
  }
  eliminarMedidaCoercion(idSujetoMedidaCoercitiva: string): Observable<any> {
    return this.apiBase.delete(
      `${this.urlTramite}/eliminar/requerimiento/${idSujetoMedidaCoercitiva}`
    );
  }

  listarSupuestos(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramite}/registrar/requerimiento/supuestos/${idActoTramiteCaso}`
    );
  }

  validarMedidas(idCaso: string, idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramite}/valida/requerimiento/${idCaso}/${idActoTramiteCaso}`
    );
  }
}
