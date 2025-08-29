import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ConsultaPersonaNatural,
  ConsultaPersonaNaturalResponse,
} from '@core/types/persona/reniec.type';
import { BACKEND } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PersonaService {
  constructor(private http: HttpClient) {}

  consultaReniec(request: ConsultaPersonaNatural) {
    return this.http.post<ConsultaPersonaNaturalResponse>(
      `${BACKEND.MS_PERSONA}e/personanatural/consulta/general`,
      request
    );
  }

  consultaPorRuc(ruc: string) {
    return this.http.get<any>(`${BACKEND.MS_PERSONA}e/padronsunat/${ruc}`);
  }

  /**
   * TODO: eLIMINAR
   * @param razonSocial
   * @returns
   */
  consultaPorRazonSocial(razonSocial: string) {
    return this.http.post<any>(`${BACKEND.MS_PERSONA}/padronsunat/`, {
      razonSocial,
    });
  }
}
