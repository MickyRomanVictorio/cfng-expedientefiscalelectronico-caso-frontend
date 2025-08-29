import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';
import { AutoAprobatorioRequest } from '@core/interfaces/provincial/tramites/comun/intermedia/auto-aprobatorio/auto-aprobatorio-request';

@Injectable({
  providedIn: 'root'
})
export class AutoAprobatorioService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/intermedia`

  constructor(
    private http: HttpClient
  ) { }

  guardarAutoAprobatorio(request: AutoAprobatorioRequest): Observable<any> {
    return this.http.post(`${this.url}/guardarAutoAprobatorio`, request)
  }
}
