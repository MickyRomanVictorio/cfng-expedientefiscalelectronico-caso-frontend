import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { InformacionDetalladaSujetoRequest } from '@core/interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/InformacionDetalladaSujetoRequest';

@Injectable({
  providedIn: 'root'
})
export class SujetoConsultasService {

  urlSujetoConsultas = `${BACKEND.CFE_EFE_SUJETOS}/v1/e/gestionarinformaciondetallada`

  constructor(private readonly apiBase: ApiBaseService) { }

  obtenerInformacionOpcionalSujeto(idSujetoCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlSujetoConsultas}/obtener?idSujetoCaso=${idSujetoCaso}`
    );
  }

  removerHuellasFotosSenas(idSujetoCaso: string, idRegistrosBiometricos: string): Observable<any> {
    return this.apiBase.delete(
      `${this.urlSujetoConsultas}/eliminarBiometria?idSujetoCaso=${idSujetoCaso}&idRegistrosBiometricos=${idRegistrosBiometricos}`
    );
  }

  removerSeudonimo(idSujetoCaso: string, idAliasSujeto: string): Observable<any> {
    return this.apiBase.delete(
      `${this.urlSujetoConsultas}/eliminarAlias?idSujetoCaso=${idSujetoCaso}&idAliasSujeto=${idAliasSujeto}`
    );
  }

  removerParentesco(idPersona: any): Observable<any> {
    return this.apiBase.delete(
      `${this.urlSujetoConsultas}/eliminarParentesco?idPersona=${idPersona}`
    );
  }

  actualizarInformacionDetalladaSujeto(request: InformacionDetalladaSujetoRequest): Observable<any> {
    return this.apiBase.post(
      `${this.urlSujetoConsultas}/agregar`, request
    );
  }
}
