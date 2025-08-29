import { Injectable } from "@angular/core"
import { BACKEND } from "@environments/environment"
import { ApiBaseService } from "@services/shared/api.base.service"
import { Observable } from "rxjs"
import { TramiteGenerico } from "@interfaces/provincial/tramites/genericos/tramite-generico.interface"

@Injectable({
  providedIn: 'root'
})
export class TramitesGenericosService {

  private readonly url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/tramites/genericos`

  constructor(private readonly apiBase: ApiBaseService) {
  }

  obtenerTramiteGenerico( idActoTramiteCaso: string ): Observable<any> {
    return this.apiBase.get(`${this.url}/${ idActoTramiteCaso}`)
  }

  registrarTramiteGenerico( request: TramiteGenerico ): Observable<any> {
    return this.apiBase.post(`${this.url}/registrar`, request)
  }

  guardarTramiteGenerico( request: TramiteGenerico ): Observable<any> {
    return this.apiBase.post(`${this.url}/guardar`, request)
  }

  obtenerSujetosProcesalesCaso( idCaso: string ): Observable<any> {
    return this.apiBase.get(`${this.url}/sujetos/${ idCaso }`)
  }

  guardarActaEscaneada( request: any ): Observable<any> {
    return this.apiBase.post(`${this.url}/guardarActaEscaneada`, request)
  }
  obtenerActaEscaneada(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/obtenerActaEscaneada/${ idActoTramiteCaso }`)
  }
}
