import { inject, Injectable } from '@angular/core';
import { BaseResponse, ListResponse } from '@core/interfaces/comunes/genericos.interface';
import { GenericResponse, GenericResponseModel } from '@core/interfaces/comunes/GenericResponse';
import { Apelacion, ListaApelaciones, ListaSujetosRC, ResolucionAutoResuelveTA } from '@core/interfaces/provincial/tramites/comun/preparatoria/resolucion-auto-resuelve-ta';
import { IncoacionSujeto } from '@core/interfaces/provincial/tramites/especiales/incoacion/apelacion';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoResuelveTerminacionAnticipadaService {

  private readonly url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionautoqueresuelveta`;

  protected readonly apiBase = inject(ApiBaseService);

  obtenerResolucionAutoResuelve(idActoTramiteCaso: string): Observable<GenericResponseModel<ResolucionAutoResuelveTA>> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}`
    );
  }

  guardarResolucionAutoResuelve(data: ResolucionAutoResuelveTA): Observable<GenericResponse> {
    return this.apiBase.post(`${this.url}`, data);
  }

  listarApelantes(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/apelantes/${idCaso}`
    );
  }

  registrarApelacion(request: Apelacion): Observable<any> {
    return this.apiBase.post(
      `${this.url}/apelacion/registrar`, request
    );
  }


  listarApelaciones(idActoTramiteCaso: string, idTipoApelacion: number): Observable<ListResponse<ListaApelaciones>> {
    return this.apiBase.get(
      `${this.url}/apelacion/listar/${idActoTramiteCaso}/${idTipoApelacion}`
    );
  }

  eliminarApelacion(idSujetoCasoResultado: string): Observable<any> {
    return this.apiBase.delete(
      `${this.url}/apelacion/eliminar/${idSujetoCasoResultado}`
    );
  }

  listaSujetosReparacionCivil(idActoTramiteCaso: string, idReparacion: string): Observable<ListResponse<ListaSujetosRC>> {
    return this.apiBase.get(
      `${this.url}/sujetosrc/${idActoTramiteCaso}/${idReparacion}`
    );
  }

  listarImputados(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/imputados/${idCaso}`
    );
  }

  listarDelitosSujeto(idSujetoCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/delitos/${idSujetoCaso}`
    );
  }

  validarResultadoAudiencia(idActoTramiteCaso: string, idResultado: number): Observable<GenericResponse> {
    return this.apiBase.get(
      `${this.url}/validar/resultadoaudiencia/${idActoTramiteCaso}/${idResultado}`
    );
  }

  validarAudiosAudiencia(idActoTramiteCaso: string): Observable<GenericResponse> {
    return this.apiBase.get(
      `${this.url}/validar/audioaudiencia/${idActoTramiteCaso}`
    );
  }

  
  validarPenas(idActoTramiteCaso: string, idResultado: number): Observable<GenericResponse> {
    return this.apiBase.get(
      `${this.url}/validar/penas/${idActoTramiteCaso}/${idResultado}`
    );
  }

  validarReparacionCivil(idActoTramiteCaso: string, idResultado: number): Observable<GenericResponse> {
    return this.apiBase.get(
      `${this.url}/validar/reparacioncivil/${idActoTramiteCaso}/${idResultado}`
    );
  }

  reiniciarFormulario(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/reiniciar/${idActoTramiteCaso}`
    );
  }
}
