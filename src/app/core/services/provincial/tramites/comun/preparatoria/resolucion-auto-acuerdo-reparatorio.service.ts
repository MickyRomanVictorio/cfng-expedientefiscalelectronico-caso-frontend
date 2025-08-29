import { inject, Injectable } from '@angular/core';
import { AutoAcuerdoReparatorio } from '@core/interfaces/provincial/tramites/comun/preparatoria/auto-acuerdo-reparatorio/auto-acuerdo-reparatorio.interface';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoAcuerdoReparatorioService {

  private readonly url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`;
  protected readonly apiBase = inject(ApiBaseService);

  obtenerAutoAcuerdoReparatorio(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/resolucionautoacuerdoreparatorio/${idActoTramiteCaso}`
    );
  }

  registrarAutoAcuerdoReparatorio(data: AutoAcuerdoReparatorio): Observable<any> {
    return this.apiBase.post(`${this.url}/resolucionautoacuerdoreparatorio`, data);
  }
}
