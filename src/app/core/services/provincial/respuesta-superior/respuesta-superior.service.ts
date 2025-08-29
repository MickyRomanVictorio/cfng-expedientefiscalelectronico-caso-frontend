import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RequestRespuestaSuperior } from '@core/interfaces/provincial/administracion-casos/respuesta-elevacion/request-respuesta-superior.interface';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RespuestaSuperiorService {

  url = `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/elevacion`
  constructor(
    private readonly apiBase: ApiBaseService,
    private readonly http: HttpClient) { }


  getRespuestasSuperior(request: RequestRespuestaSuperior): Observable<any> {
    let tipoElevacion = request.tipoElevacion ? request.tipoElevacion : ''
    let url = `${this.url}/respuestas?fechaInicio=${request.fechaDesde}&fechaFinal=${request.fechaHasta}&idTipoElevacion=${tipoElevacion}&idTipoFechaFiltro=${request.filtrotiempo}`;
    return this.apiBase.get(url);
  }

  public obtenerDetalleRespuesta(idActoTramiteCaso: string, datos:any = {}): Observable<any> {
    return this.apiBase.post(`${this.url}/respuesta/${idActoTramiteCaso}`, datos);
  }

}
