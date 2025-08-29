import { Injectable } from '@angular/core'
import { ApiBaseService } from '@core/services/shared/api.base.service'
import { BACKEND } from '@environments/environment'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class TramitesEliminadosService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/tramites/eliminados`

  constructor(private apiBase: ApiBaseService) {}

  obtenerTramitesEliminados(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${idCaso}`
    )
  }
  
}