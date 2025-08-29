import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CargaLaboralPorEtapaResponse,
  CargaLaboralRequest,
  CargaLaboralResponse,
  DetalleResponseItem,
  EtapasRequest,
  FiscalDespachoRequest,
  FiscalDespachoResponse,
  FiscaliaResponse,
  PlazoEtapas,
  PlazoEtapasRequest,
  PlazosEtapasDetalleRequest,
  PlazosEtapasDetalleResponse,
  PlazosPorEtapaProvincialResponse,
  ReporteFiltrosRequest,
  ResumenResponseItem,
} from '../models/carga-laboral.model';
import { BACKEND } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CargaLaboralService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL_FILTROS: string = `${BACKEND.CFE_REPORTES}/cfe/generales/reportes/v1/e/filtros`;
  private readonly BASE_URL_PLAZOS: string = `${BACKEND.CFE_REPORTES}/cfe/generales/reportes/v1/e/plazos`;
  private readonly BASE_URL: string = `${BACKEND.CFE_REPORTES}/cfe/generales/reportes/v1/e/cargalaboral`;
  // private readonly BASE_URL_ACTO_PROCESAL: string = `${BACKEND.CFE_REPORTES}/cfe/generales/reportes/v1/e/actoprocesal`;
  private readonly BASE_URL_ACTO_PROCESAL: string =
    'http://localhost:8080/cfe/generales/reportes/v1/e/actoprocesal';
  // http://localhost:8080/cfe/generales/reportes/v1/e/plazos/listarPlazosPorEtapa

  listarCargaLaboral(
    request: CargaLaboralRequest
  ): Observable<CargaLaboralResponse[]> {
    return this.http.post<CargaLaboralResponse[]>(
      `${this.BASE_URL}/listar`,
      request
    );
  }

  listarCargaLaboralPorEtapa(
    request: CargaLaboralRequest
  ): Observable<CargaLaboralPorEtapaResponse[]> {
    return this.http.post<CargaLaboralPorEtapaResponse[]>(
      `${this.BASE_URL}/listarPorEtapa`,
      request
    );
  }

  listarFiscales(
    request: FiscalDespachoRequest
  ): Observable<FiscalDespachoResponse[]> {
    return this.http.post<FiscalDespachoResponse[]>(
      `${this.BASE_URL}/fiscales`,
      request
    );
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }

  getListaEtapas(): Observable<any> {
    return this.http.get(`${this.BASE_URL_FILTROS}/listarEtapas`);
  }

  getListaActosProcesales(idEtapa: string): Observable<any> {
    return this.http.get(
      `${this.BASE_URL_FILTROS}/listarActosProcesales/${idEtapa}`
    );
  }

  getListaTramites(idActoProcesalConfigura: string): Observable<any> {
    return this.http.get(
      `${this.BASE_URL_FILTROS}/listarTramite/${idActoProcesalConfigura}`
    );
  }

  getListarFiscalias(coEntidadPadre: string): Observable<any> {
    return this.http.get(
      `${this.BASE_URL_FILTROS}/listarFiscalia/${coEntidadPadre}`
    );
  }

  getListarDespachos(coEntidad: string): Observable<any> {
    return this.http.get(
      `${this.BASE_URL_FILTROS}/listarDespachos/${coEntidad}`
    );
  }

  //Plazos
  listarPlazosResumen(
    request: ReporteFiltrosRequest
  ): Observable<ResumenResponseItem[]> {
    return this.http.post<ResumenResponseItem[]>(
      `${this.BASE_URL_PLAZOS}/listarPlazosResumen`,
      request
    );
  }

  listarPlazosDetalle(
    request: ReporteFiltrosRequest
  ): Observable<DetalleResponseItem[]> {
    return this.http.post<DetalleResponseItem[]>(
      `${this.BASE_URL_PLAZOS}/listarPlazosCasos`,
      request
    );
  }

  //Etapas
  listarPlazosPorEtapas(
    request: EtapasRequest
  ): Observable<PlazosPorEtapaProvincialResponse[]> {
    return this.http.post<PlazosPorEtapaProvincialResponse[]>(
      `${this.BASE_URL_PLAZOS}/listarPlazosPorEtapa`,
      request
    );
  }

  listarPlazosPorEtapaDetalle(
    request: PlazosEtapasDetalleRequest
  ): Observable<PlazosEtapasDetalleResponse[]> {
    return this.http.post<PlazosEtapasDetalleResponse[]>(
      `${this.BASE_URL_PLAZOS}/listarPlazosPorEtapaDetalle`,
      request
    );
  }


  exportarExcel(data: any): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    return this.http.post(`${this.BASE_URL}/listarExcel`, data, {
      headers: headers,
      responseType: 'blob',
    });
  }
}
