import { inject, Injectable } from '@angular/core';
import { AutoSobreseimiento } from '@core/interfaces/provincial/tramites/comun/preparatoria/auto-sobreseimiento/auto-sobreseimiento.interface';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoSobreseimientoService {

  private readonly url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`;
  protected readonly apiBase = inject(ApiBaseService);

  obtenerAutoSobreseimiento(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/resolucionautosobreseimiento/${idActoTramiteCaso}`
    );
  }

  registrarAutoSobreseimiento(data: AutoSobreseimiento): Observable<any> {
    return this.apiBase.post(`${this.url}/resolucionautosobreseimiento`, data);
  }
}
