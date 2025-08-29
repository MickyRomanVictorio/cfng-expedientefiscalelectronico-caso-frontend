import { inject, Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConclusionInvestigacionService {
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/preparatoria`

  private readonly apiBase = inject(ApiBaseService)

  guardarConclusionInvetigacion(idActoTramiteCaso: string,data:any): Observable<any> {
    return this.apiBase.post(`${this.url}/${idActoTramiteCaso}/conclusioninvestigacion`, data);
  }

  obtenerConclusionInvetigacion( idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/${idActoTramiteCaso}/conclusioninvestigacion`);
  }

}
