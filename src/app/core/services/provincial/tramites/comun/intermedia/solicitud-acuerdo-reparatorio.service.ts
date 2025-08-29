import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudAcuerdoReparatorioService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/intermedia`

  constructor(
    private http: HttpClient
  ) { }

  obtenerAutoRequerimiento(idActoTramiteCaso: String): Observable<any> {
    return this.http.get(
        `${this.url}/${idActoTramiteCaso}/obtenerAutoRequerimiento`
    )
  }

  obtenerSolicitudAcuerdoReparatorio(idActoTramiteEstado: String, idCaso : String): Observable<any> {
    return this.http.get(
        `${this.url}/${idActoTramiteEstado}/${idCaso}/obtenerSolicitudAcuerdoReparatorio`
    )
  }
}
