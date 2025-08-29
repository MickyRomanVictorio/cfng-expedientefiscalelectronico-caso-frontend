import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DerivacionJPL } from '@core/interfaces/provincial/tramites/derivacion/derivacion-jpl.interface';

@Injectable({
  providedIn: 'root'
})
export class DerivacionJuzgadoPazLetradoService {

  url = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/tramite`

  constructor(private http: HttpClient) {
  }

  guardarDerivacionJPL(etapa: string, data: DerivacionJPL): Observable<any> {
    return this.http.post(
      `${this.url}/${ etapa }/${data.idActoTramiteCaso}/derivacionJpl`, data
    )
  }

  obtenerDerivacionJPL(etapa: string, idActoTramiteCaso: String): Observable<any> {
    return this.http.get(
      `${this.url}/${ etapa }/${idActoTramiteCaso}/derivacionJpl`
    )
  }
}
