import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiBaseService} from '@core/services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoConsentidoService {
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/intermedia`;

  constructor(private apiBase: ApiBaseService, private http: HttpClient) {}

  obtenerAutoRequerimiento(
    idActoTramiteCaso: string
  ): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}/obtenerAutoRequerimiento`
    );
  }

  guardarDatosResolucionAuto(
    idActoTramiteCaso: string,
    fechaNotificacion: string,
    sujetosProcesales: string[],
    observaciones: string
  ): Observable<any> {
    const request = {
      fechaNotificacion: fechaNotificacion,
      sujetosProcesales: sujetosProcesales,
      observacionPj: observaciones,
    };

    return this.apiBase.post(
      `${this.url}/${idActoTramiteCaso}/guardarAutoRechazaRequerimiento`,
      request
    );
  }
}
