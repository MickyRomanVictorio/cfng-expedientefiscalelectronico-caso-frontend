import { inject, Injectable } from '@angular/core';
import { AutoResuelvePrisionPreventiva } from '@core/interfaces/comunes/AutoResuelvePrisionPreventivaRequest';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';
import {
  AutoComunicaDetencion
} from '@interfaces/provincial/tramites/comun/preparatoria/auto-acuerdo-reparatorio/auto-acuerdo-reparatorio.interface';

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoCommunicaDetencionService {

  private readonly url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionautocomunicadetencion`;
  protected readonly apiBase = inject(ApiBaseService);

  obtenerComunicaDetencion(idActoTramiteCaso: string): Observable<AutoComunicaDetencion> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}`
    );
  }

  registroComunicaDetencion(data: AutoResuelvePrisionPreventiva): Observable<any> {
    return this.apiBase.post(`${this.url}/registrar`, data);
  }
}
