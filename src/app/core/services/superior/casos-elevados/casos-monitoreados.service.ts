import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

type ParametroValor = string | number | boolean;


@Injectable({
  providedIn: 'root'
})
export class CasosElevadosService {

  private readonly url = `${BACKEND.CFE_EFE_SUPERIOR}`;

  constructor(private readonly apiBase: ApiBaseService) { }

  public obtenerCasos(tipoElevacionCodigo:string, datos:Record<string, ParametroValor>): Observable<any> {
    return this.apiBase.get(this.url+'/v1/e/caso/consultacasos/listarcasossuperior?idTipoElevacion='+tipoElevacionCodigo+'&'+this.parametros(datos) );
  }

  public obtenerCasosApelacionesAuto(datos:Record<string, ParametroValor>): Observable<any> {
    return this.apiBase.get(this.url+'/v1/e/caso/consultacasos/apelacionAutos?'+ this.parametros(datos));
  }

  public obtenerCasosApelacionesSentencia(datos:Record<string, ParametroValor>): Observable<any> {
    return this.apiBase.get(this.url+'/v1/e/caso/consultacasos/apelacionSentencia?'+ this.parametros(datos));
  }

  private parametros(datos:Record<string, ParametroValor>){
    return Object.entries(datos)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  }
}
