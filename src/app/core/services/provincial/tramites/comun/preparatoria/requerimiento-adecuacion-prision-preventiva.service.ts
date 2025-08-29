import { inject, Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from '@services/shared/api.base.service';
import { Observable } from 'rxjs';
import { InfoResponse } from '@interfaces/comunes/genericos.interface';
import { RequerimientoAdecuacionRequest, SujetoProcesalesAdecuacion } from '@core/interfaces/provincial/tramites/comun/preparatoria/requerimiento-adecuacion-prision-preventiva';

@Injectable({
  providedIn: 'root'
})
export class RequerimientoAdecuacionPrisionPreventivaService {

  private readonly url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/tramites/requerimientoadecuacionprisionpreventiva`;
  protected readonly apiBase = inject(ApiBaseService);


  obtenerSujetosProcesalesAdecuacion(idActoTramiteCaso: string): Observable<SujetoProcesalesAdecuacion[]> {
    return this.apiBase.get(`${this.url}/sujetos/${idActoTramiteCaso}`);
  }

  guardarRequerimientoAdecuacion(request: RequerimientoAdecuacionRequest): Observable<InfoResponse> {
    return this.apiBase.post(`${this.url}/guardar`, request);
  }
}
