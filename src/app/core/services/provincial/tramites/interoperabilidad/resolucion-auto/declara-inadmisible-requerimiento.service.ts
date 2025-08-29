import { inject, Injectable } from '@angular/core';
import { AutoRechazaRequerimiento } from '@core/interfaces/provincial/tramites/comun/preparatoria/auto-rechaza-requerimiento/auto-rechaza-requerimiento.interface';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoDeclaraInadmisibleRequerimientoService {

  private readonly url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`;
  protected readonly apiBase = inject(ApiBaseService);

  obtenerAutoDeclaraInadmisibleRequerimiento(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/resolucionautodeclarainadmisiblerequerimiento/${idActoTramiteCaso}`
    );
  }

  registrarAutoDeclaraInadmisibleRequerimiento(data: AutoRechazaRequerimiento): Observable<any> {
    return this.apiBase.post(`${this.url}/resolucionautodeclarainadmisiblerequerimiento`, data);
  }
}
