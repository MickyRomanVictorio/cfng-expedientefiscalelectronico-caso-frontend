import { Injectable } from '@angular/core';
import { BACKEND } from "@environments/environment";
import { map } from "rxjs";
import { ApiBaseService } from "@services/shared/api.base.service";

@Injectable({
  providedIn: 'root'
})
export class AutoResuelveCalificacionApelacionService {

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
    return this.apiBase.post(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionAutoResuelveCalificacionApelacion/${data.idActoTramiteCaso}/guardar`, data);
  }

  registrarElevacion(data: any) {
    return this.apiBase.post(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionAutoResuelveCalificacionApelacion/${data.idActoTramiteCaso}/elevarFiscaliaSuperior`, data);
  }

  obtenerDatosResolucion(idActoTramiteCaso: string) {
    return this.apiBase.get(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionAutoResuelveCalificacionApelacion/${idActoTramiteCaso}/obtener`);
  }

  validaElevar(idActoTramiteCaso: string) {
    return this.apiBase.get(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionAutoResuelveCalificacionApelacion/${idActoTramiteCaso}/validaelevar`);
  }
}
