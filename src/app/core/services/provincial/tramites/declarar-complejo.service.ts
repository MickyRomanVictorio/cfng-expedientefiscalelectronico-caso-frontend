import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { DisposicionDeclararComplejo } from '@core/interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface'
import { BACKEND } from '@environments/environment'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class DeclararComplejoService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`

  constructor(private readonly http: HttpClient) {}

  obtenerInformacionDeclararComplejo(etapa: string, idActoTramiteCaso: string): Observable<any> {
    return this.http.get(`${this.url}/${etapa}/${idActoTramiteCaso}/declararcomplejo`)
  }

  guardarDisposicionDeclararComplejo(etapa: string, data: DisposicionDeclararComplejo | null): Observable<any> {
    return this.http.post(
      `${this.url}/${etapa}/declararcomplejo`,
      data
    )
  }

}