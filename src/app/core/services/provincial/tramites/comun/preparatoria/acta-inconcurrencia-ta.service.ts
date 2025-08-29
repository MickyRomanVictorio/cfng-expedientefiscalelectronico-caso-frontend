import { inject, Injectable } from '@angular/core';
import { GenericResponse, GenericResponseList, GenericResponseModel } from '@core/interfaces/comunes/GenericResponse';
import { ActaInconcurrenciaTA, GuardarSujetosInconcurrencia, SujetosInconcurrenciaTA } from '@core/interfaces/provincial/tramites/comun/preparatoria/acta-inconcurrencia-ta';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActaInconcurrenciaTerminacionAnticipadaService {

  private readonly url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/actainconcurrenciata`;
  
  protected readonly apiBase = inject(ApiBaseService);

  obtenerActa(idActoTramiteCaso: string): Observable<GenericResponseModel<ActaInconcurrenciaTA>> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}`
    );
  }

  guardarActa(data: ActaInconcurrenciaTA): Observable<GenericResponse> {
    return this.apiBase.post(`${this.url}`, data);
  }

  listarSujetosProcesales(idActoTramiteCaso: string): Observable<GenericResponseList<SujetosInconcurrenciaTA>> {
    return this.apiBase.get(
      `${this.url}/sujetosProcesales/${idActoTramiteCaso}`
    );
  }

  guardarSujetosProcesales(data: GuardarSujetosInconcurrencia): Observable<GenericResponse> {
    return this.apiBase.post(`${this.url}/sujetosProcesales`,data);
  }
  
}
