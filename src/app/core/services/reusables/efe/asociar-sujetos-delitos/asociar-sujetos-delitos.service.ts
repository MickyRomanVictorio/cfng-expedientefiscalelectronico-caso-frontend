import { Injectable } from '@angular/core'
import { GuardarAsociacion } from '@core/interfaces/reusables/asociar-sujetos-delitos/guardar-asociacion.interface'
import { ApiBaseService } from '@core/services/shared/api.base.service'
import { BACKEND } from '@environments/environment'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AsociarSujetosDelitosService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/tramites/asociarsujetosdelitos`

  constructor( private readonly apiBase: ApiBaseService ) { }

  validarAsociacionSujetosDelitos(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}/validar`
    )
  }

  obtenerSujetosDelitosAsociados(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}`
    )
  }

  guardarAsociacion(datos: GuardarAsociacion): Observable<any> {
    return this.apiBase.post(
      `${this.url}`, datos
    )
  }

  obtenerSujetosDelitosAsociadosTramite(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}/detalle`
    )
  }

}