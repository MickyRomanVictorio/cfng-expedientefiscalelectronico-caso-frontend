import { Injectable } from '@angular/core';
import { BACKEND } from "@environments/environment";
import { map, Observable } from 'rxjs';
import { ApiBaseService } from "@services/shared/api.base.service";
import { ApelacionFiscalia } from '@interfaces/provincial/tramites/fundado-procedente/apelacion-fiscalia';
import { BaseResponse } from '@interfaces/comunes/genericos.interface';

@Injectable({
  providedIn: 'root'
})
export class AutoResuelveQuejaDenegatoriapelacionService {

  constructor(private apiBase: ApiBaseService) {
  }

  listarSujetosProcesales(idCaso: string, idActoTramiteCaso: string) {
    return this.apiBase.get(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionAutoResuelveCalificacionApelacion/${idCaso}/${idActoTramiteCaso}/listarSujetos`);
  }

  listarRespuestasApelacion(idActoTramiteCaso: string) {
    return this.apiBase.get(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionAutoResuelveCalificacionApelacion/${idActoTramiteCaso}/listarRespuestasApelacion`);
  }

  listarFiscaliasSuperiores(idActoTramiteCaso: string) {
    return this.apiBase.get(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionAutoResuelveCalificacionApelacion/${idActoTramiteCaso}/listarFiscaliasSuperiores`);
  }

  registrarResolucion(data: any) {
    return this.apiBase.post(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/autoresuelvequejadenegatoriaapelacion/${data.idActoTramiteCaso}/guardar`, data);
  }

  registrarRespuestaQueja(data: ApelacionFiscalia): Observable<BaseResponse> {
    return this.apiBase.post(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/autoresuelvequejadenegatoriaapelacion/guardar/queja`, data);
  }

  registrarElevacion(data: any) {
    return this.apiBase.post(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionAutoResuelveCalificacionApelacion/${data.idActoTramiteCaso}/elevarFiscaliaSuperior`, data);
  }

  obtenerDatosResolucion(idActoTramiteCaso: string) {
    return this.apiBase.get(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionAutoResuelveCalificacionApelacion/${idActoTramiteCaso}/obtener`);
  }
}
