import { Injectable } from '@angular/core';
import { BACKEND } from "@environments/environment";
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})

export class ReusablesAlertas {
  url = `${BACKEND.CFE_EFE}/v1/e/caso/reusable/alertas`

  constructor(private apiBase: ApiBaseService, private http: HttpClient ) { }

  obtenerAlertas(bandeja: string, estado: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${bandeja}/${estado}`
    );
  }

  actualizarAlertas(idAlerta: string): Observable<any> {
    return this.apiBase.put(
      `${this.url}/${idAlerta}`, {}
    );
  }

  obtenerAlertasEstado(idAlerta: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${idAlerta}`
    );
  }

  obtenerAlertaSujetosProcesalesDebidamenteRegistrados( idCaso: string ): Observable<any> {
    return this.http.get(
      `${this.url}/${idCaso}/sujetosprocesales`,
      { responseType: 'text' }
    );
  }

  obtenerAlertaEscritosSinAtender( idCaso: string ): Observable<any> {
    return this.http.get(
      `${this.url}/${idCaso}/escritossinatender`,
      { responseType: 'text' }
    );
  }

  obtenerAlertaFaltaTipificarDelito( idCaso: string ): Observable<any> {
    return this.http.get(
      `${this.url}/${idCaso}/delitostipificados`,
      { responseType: 'text' }
    );
  }

  obtenerAlertaExistenNotificacionesPendientes( idCaso: string ): Observable<any> {
    return this.http.get(
      `${this.url}/${idCaso}/cargosnotificacionpendientes`,
      { responseType: 'text' }
    );
  }

  obtenerAlertaCasoConSolicitudAcumulacionPorRevisar( idCaso: string ): Observable<any> {
    return this.http.get(
      `${this.url}/${idCaso}/solicitudacumulacionporrevisar`,
      { responseType: 'text' }
    );
  }
}
