import {Injectable} from '@angular/core';
import {BACKEND} from '@environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { ExcluirFiscal } from '@core/interfaces/provincial/tramites/comun/preliminar/excluir-fiscal.interface';

@Injectable({
  providedIn: 'root'
})
export class ExcluirFiscalCasoService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/preliminar`

  constructor(
    private http: HttpClient
  ) {
  }
  guardarFormulario(data: ExcluirFiscal): Observable<any> {
    return this.http.post(
      `${this.url}/excluirfiscal/${data.idActoTramiteCaso}/guardar`, data
    )
  }
  elevarFiscalSuperior(data: ExcluirFiscal): Observable<any> {
    return this.http.post(
      `${this.url}/excluirfiscal/${data.idActoTramiteCaso}/elevarFiscaliaSuperior`, data
    )
  }
  obtenerDatosFormulario(idCaso: string, idActoTramiteCaso: string): Observable<any> {
    return this.http.get(
      `${this.url}/excluirfiscal/${idCaso}/${idActoTramiteCaso}`
    )
  }


}
