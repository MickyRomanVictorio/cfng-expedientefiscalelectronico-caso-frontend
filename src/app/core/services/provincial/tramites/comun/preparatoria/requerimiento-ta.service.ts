import { inject, Injectable } from '@angular/core';
import { GenericResponse, GenericResponseList, GenericResponseModel } from '@core/interfaces/comunes/GenericResponse';
import { ActaInconcurrenciaTA, GuardarSujetosInconcurrencia, SujetosInconcurrenciaTA } from '@core/interfaces/provincial/tramites/comun/preparatoria/acta-inconcurrencia-ta';
import { RequerimientoTA } from '@core/interfaces/provincial/tramites/comun/preparatoria/requerimiento-inconcurrencia-ta';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequerimientoTerminacionAnticipadaService {

  private readonly url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/requerimientota`;
  
  protected readonly apiBase = inject(ApiBaseService);

  obtenerRequerimiento(idActoTramiteCaso: string): Observable<GenericResponseModel<RequerimientoTA>> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}`
    );
  }

  guardarRequerimiento(data: RequerimientoTA): Observable<GenericResponse> {
    return this.apiBase.post(`${this.url}`, data);
  }
}
