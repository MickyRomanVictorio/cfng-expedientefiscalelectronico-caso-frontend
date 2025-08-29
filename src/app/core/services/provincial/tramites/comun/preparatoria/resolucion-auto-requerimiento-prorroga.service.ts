import { Injectable } from '@angular/core';
import { RequerimientoProrrogaInvPreparatoria, ResolucionAutoResuelveRequerimientoProrrogaDTO } from '@core/interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface';
import { ResolucionAutoRequerimientoProrroga } from '@core/interfaces/provincial/tramites/comun/preparatoria/resolucion-auto-requerimiento-prorroga';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResolucionAutoRequerimientoProrrogaService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/preparatoria`

  constructor(private readonly apiBase: ApiBaseService) { }

  guardarResolucion(idCaso: string, data:ResolucionAutoRequerimientoProrroga): Observable<any> {
    return this.apiBase.post(`${this.url}/${idCaso}/resolucionAutoRequerimientoProrroga`, data);
  }

  obtenerPlazoRequerimiento( idCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/${idCaso}/plazoRequerimientoProrroga`);
  }

  obtenerResolucion( idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/${idActoTramiteCaso}/resolucionAutoRequerimientoProrroga`);
  }

  obtenerRequerimientoProrrogaInvPreparatoria(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}/requerimientoProrroga`
    )
  }
  
  guardarRequerimientoProrrogaInvPreparatoria(data: RequerimientoProrrogaInvPreparatoria): Observable<any> {
    return this.apiBase.post(`${this.url}/requerimientoProrroga`, data);
  }

  obtenerDatosAutoResuelveProrrogaInvPreparatoria(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}/autoResuelveRequerimientoProrrogaInvPreparatoria`
    )
  }

  guardarDatosAutoResuelveProrrogaInvPreparatoria(data: Partial<ResolucionAutoResuelveRequerimientoProrrogaDTO>): Observable<any> {
    return this.apiBase.post(`${this.url}/autoResuelveRequerimientoProrrogaInvPreparatoria`, data);
  }

}