import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AmpliacionDiligenciaPreliminar } from '@core/interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface';

@Injectable({
  providedIn: 'root',
})
export class AmpliacionPlazoPreliminaresService {
  
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/preliminar`;

  constructor(private readonly http: HttpClient) {}

  obtenerAmpliacionDiligenciaPreliminar(idActoTramiteCaso: string): Observable<any> {
    return this.http.get(
      `${this.url}/${idActoTramiteCaso}/ampliardiligenciaspreliminares`
    )
  }

  guardarAmpliacionDiligenciaPreliminar(data: AmpliacionDiligenciaPreliminar): Observable<any> {
    return this.http.post(`${this.url}/ampliardiligenciaspreliminares`, data);
  }

}