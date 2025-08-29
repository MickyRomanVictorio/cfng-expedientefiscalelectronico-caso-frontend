import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { ApelacionesProcesoInmediato } from '@core/interfaces/provincial/tramites/fundado-procedente/apelaciones-proceso-inmediato';
import { ApelacionRequest } from '@core/interfaces/provincial/tramites/fundado-procedente/apelacion';
import { ApelacionFiscalia } from '@core/interfaces/provincial/tramites/fundado-procedente/apelacion-fiscalia';
import { GenericResponse, GenericResponseModel } from '@core/interfaces/comunes/GenericResponse';
import { ApelacionPena } from '@core/interfaces/provincial/tramites/fundado-procedente/apelaciones-penas';
import {
  ApelaFiscalia, FiscaliaApelacion,
  IncoacionSujeto,
  RegistroSujetoApela,
  ReparacionCivilCaso
} from '@interfaces/provincial/tramites/especiales/incoacion/apelacion';
import { ListResponse, Response, Respuesta } from '@interfaces/comunes/genericos.interface';
import { Catalogo } from '@interfaces/comunes/catalogo';

@Injectable({
    providedIn: 'root'
})
export class ApelacionesResultadosService {

    constructor(
        private apiBase: ApiBaseService
    ) { }


    resultadoApelaciones(): Observable<Respuesta<Catalogo[]>> {
        return this.apiBase.get(
            `${BACKEND.CFEMAESTROS}v1/cftm/e/catalogo/ID_N_RSP_APELACION`
        );
    }

    sujetosApelantes(idcaso: string): Observable<ListResponse<IncoacionSujeto>> {
        return this.apiBase.get(
            `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/sujetos-apelantes/${idcaso}`
        );
    }
    listarApelacionesInmediato(idActoTramiteCaso: string): Observable<ListResponse<RegistroSujetoApela>> {
        return this.apiBase.get(
            `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/listar-apelaciones/${idActoTramiteCaso}`
        );
    }
    registrarApelacionesInmediato(request: ApelacionesProcesoInmediato): Observable<any> {
        return this.apiBase.post(
            `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/registrar-apelaciones`, request
        );
    }

    listaReparacionCivilApelada(idActoTramiteCaso: string): Observable<ListResponse<ReparacionCivilCaso>> {
        return this.apiBase.get(
            `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/reparacion-civil-caso/${idActoTramiteCaso}`
        );
    }

    listaSujetoReparacionCivil(idActoTramiteCaso: string, idReparacion: string): Observable<ListResponse<IncoacionSujeto>> {
        return this.apiBase.get(
            `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/sujetos-apela-reparacion-civil/${idActoTramiteCaso}/${idReparacion}`
        );
    }
    listarApelacionesSalidasAlternas(idActoTramiteCaso: string): Observable<ListResponse<RegistroSujetoApela>> {
        return this.apiBase.get(
            `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/listar-apelaciones-salida/${idActoTramiteCaso}`
        );
    }

    eliminarRegistroApelado(idActoTramiteSujeto: string, idApelacionResultado:string): Observable<any> {
        return this.apiBase.delete(
            `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/eliminar-registro-apelado/${idActoTramiteSujeto}/${idApelacionResultado}`
        );
    }

    registrarApelacionFiscalia(request: ApelaFiscalia): Observable<any> {
        return this.apiBase.post(
            `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/registrar-apelacion-fiscalia`, request
        );
    }

    obtenerApelacionFiscalia(idActoTramiteCaso: string): Observable<GenericResponseModel<FiscaliaApelacion>> {
        return this.apiBase.get(
            `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/obtener-apelacion-fiscalia/${idActoTramiteCaso}`
        );
    }

    listarApelantes(idCaso: string): Observable<any> {
        return this.apiBase.get(
            `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/apelantes/terminacionanticipada/${idCaso}`
        );
    }
    listarApelantesAgraviadosCiviles(idCaso: string): Observable<any> {
        return this.apiBase.get(
            `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/apelantes/agraviados-civiles/${idCaso}`
        );
    }
    listarApelantesImputadosPena(idActoTramiteCaso: string): Observable<any> {
        return this.apiBase.get(
            `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/apelantes/imputados-pena/${idActoTramiteCaso}`
        );
    }

    registrarApelacion(request: ApelacionRequest): Observable<any> {
        return this.apiBase.post(
            `${BACKEND.CFE_EFE_TRAMITES}/v1/procesosespeciales/incoacion/apelacion/registrar`, request
        );
    }

    registrarApelacionDeLaFiscalia(request: ApelacionFiscalia): Observable<GenericResponse> {
        return this.apiBase.post(
            `${BACKEND.CFE_EFE_TRAMITES}/v1/procesosespeciales/incoacion/apelacion/fiscalia/registrar`, request
        );
    }

    listarApelaciones(idActoTramiteCaso: string, idTipoApelacion: number): Observable<any> {
        return this.apiBase.get(
            `${BACKEND.CFE_EFE_TRAMITES}/v1/procesosespeciales/incoacion/apelacion/listar/${idActoTramiteCaso}/${idTipoApelacion}`
        );
    }
    listarApelacionesPenas(idActoTramiteCaso: string): Observable<any> {
        return this.apiBase.get(
            `${BACKEND.CFE_EFE_TRAMITES}/v1/e/audiciencia/procesoinmediato/apelacion-pena/${idActoTramiteCaso}`
        );
    }

    listarDelitosPorSujetoProcesal(sujeto: string): Observable<any> {
        return this.apiBase.get(
          `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/delitos/${sujeto}`
        );
    }
    obtenerApelacionDeLaFiscalia(idActoTramiteCaso: string): Observable<any> {
        return this.apiBase.get(
            `${BACKEND.CFE_EFE_TRAMITES}/v1/procesosespeciales/incoacion/apelacion/fiscalia/obtener/${idActoTramiteCaso}`
        );
    }


    eliminarApelacion(idSujetoCasoResultado: string): Observable<any> {
        return this.apiBase.delete(
            `${BACKEND.CFE_EFE_TRAMITES}/v1/procesosespeciales/incoacion/apelacion/eliminar/${idSujetoCasoResultado}`
        );
    }

    registrarApelacionPena(request:ApelacionPena){
        return this.apiBase.post(
            `${BACKEND.CFE_EFE_TRAMITES}/v1/e/audiciencia/procesoinmediato/apelacion-pena`, request
        );
    }

    /**resumen **/
    listarResumenInputados(idActoTramiteCaso: string): Observable<any> {
      return this.apiBase.get(
          `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/resumen/imputados/${idActoTramiteCaso}`
      );
    }

    listarResumenAgraviadosCivil(idActoTramiteCaso: string): Observable<any> {
      return this.apiBase.get(
          `${BACKEND.CFE_EFE_SUJETOS}/v1/incoacion/resumen/agraviados-civil/${idActoTramiteCaso}`
      );
    }
}
