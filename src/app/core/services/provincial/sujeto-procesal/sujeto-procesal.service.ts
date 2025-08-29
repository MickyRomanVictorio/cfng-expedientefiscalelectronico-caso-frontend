import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AgregarSujetoProcesalRequest } from '@core/interfaces/provincial/cuaderno-incidental/sujetos-procesales/AgregarSujetoProcesalRequest';
import { EliminarSujetoProcesalRequest } from '@core/interfaces/provincial/cuaderno-incidental/sujetos-procesales/EliminarSujetoProcesalRequest';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class SujetoProcesalService {
  urlCuaderno = `${BACKEND.CFE_EFE_CUADERNO}/v1/e`;

  constructor(private apiBase: ApiBaseService, private http: HttpClient) {}

  obternerListaSujetosProcesales(
    idCaso: string,
    idTipoSujeto: number
  ): Observable<any> {
    return this.apiBase.get(
      `${this.urlCuaderno}/sujetoprocesal/listarsujetosprocesalescuadernoincidental?idCaso=${idCaso}&idTipoSujeto=${idTipoSujeto}`
    );
  }

  obtenerListaTrazabilidad(
    idCaso: string,
    idSujetoCaso: string
  ): Observable<any> {
    return this.apiBase.get(
      `${this.urlCuaderno}/sujetoprocesal/listartrazabilidadresultados?idCaso=${idCaso}&idSujetoCaso=${idSujetoCaso}`
    );
  }

  obtenerListaAgregarSujetosProcesales(
    idCasoPadre: string,
    idCaso: string,
    idTipoClasificadorExpediente: string
  ): Observable<any> {
    return this.apiBase.get(
      `${this.urlCuaderno}/sujetoprocesal/listarsujetocuadernoagregado?idCasoPadre=${idCasoPadre}&idCaso=${idCaso}&idTipoClasificadorExpediente=${idTipoClasificadorExpediente}`
    );
  }

  agregarSujetoProcesal(
    request: AgregarSujetoProcesalRequest
  ): Observable<any> {
    return this.apiBase.post(
      `${this.urlCuaderno}/sujetoprocesal/agregarsujetosprocesalescuadernoincidental`,
      request
    );
  }

  eliminarSujetoProcesal(idSujetoCaso: string) {
    return this.apiBase.delete(
      `${this.urlCuaderno}/sujetoprocesal/eliminarsujetocuaderno/${idSujetoCaso}`);
  }

  obtenerDelitosPorSujeto(idSujeto: string) {
    return this.http.get(`${BACKEND.CFE_EFE_SUJETOS}/v1/e/sujetos/${idSujeto}/delitos`)
  }
}
