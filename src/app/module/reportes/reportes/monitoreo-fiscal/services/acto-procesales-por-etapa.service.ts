import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';
import {
  listarActoProcesalXEtapaRequest, listarActoProcesalXEtapaResponse
} from "@modules/reportes/reportes/monitoreo-fiscal/models/acto-procesales-por-etapa.model";

@Injectable({
  providedIn: 'root',
})
export class ActoProcesalesPorEtapaService {


  private readonly http = inject(HttpClient);

  private readonly BASE_URL_ACTO_PROCESAL: string = `${BACKEND.CFE_REPORTES}/cfe/generales/reportes/v1/e/actoprocesal`;


  //Acto Procesales por etapas
  listarActoProcesalXEtapa(
    request: listarActoProcesalXEtapaRequest
  ): Observable<listarActoProcesalXEtapaResponse[]> {
    return this.http.post<listarActoProcesalXEtapaResponse[]>(
      `${this.BASE_URL_ACTO_PROCESAL}/listarActoProcesalXEtapa`,
      request
    );
  }



}
