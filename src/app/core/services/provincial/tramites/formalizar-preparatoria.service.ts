import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import {
  AlertaFormalizar,
  FormalizarPreparatoria
} from '@interfaces/provincial/tramites/comun/preliminar/formalizar-preparatoria.interface';
import { Observable } from 'rxjs';
import { BaseResponse } from '@interfaces/comunes/genericos.interface';

@Injectable({
  providedIn: 'root'
})
export class FormalizacinPreparatoriaService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/preliminar`

  constructor(
    private readonly http: HttpClient
  ) {
  }

  registraFormalizacion(data: FormalizarPreparatoria): Observable<any> {
    return this.http.post(
      `${this.url}/${data.idActoTramiteCaso}/formalizar`, data
    )
  }

  registraAlertasAmpliacion(data: AlertaFormalizar): Observable<BaseResponse> {
    return this.http.post<BaseResponse>(`${this.url}/alerta/ampliacion`, data);
  }

  obtenerInfoFormalizacion(idActoTramiteCaso: string): Observable<any> {
    return this.http.get(
      `${this.url}/${idActoTramiteCaso}/formalizar`
    )
  }
}
