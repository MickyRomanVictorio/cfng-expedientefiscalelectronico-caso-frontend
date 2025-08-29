import {Injectable} from '@angular/core';
import {BACKEND} from "@environments/environment";
import {Observable} from 'rxjs';
import {ApiBaseService} from "@core/services/shared/api.base.service";

@Injectable({
  providedIn: 'root'
})

export class BandejaFiscaliaSuperiorService {

  url = `${BACKEND.CFE_EFE_SUPERIOR}`

  constructor(private readonly apiBase: ApiBaseService) { }

  obtenerIndicadoresFiscaliaSuperior(): Observable<any> {
    return this.apiBase.get(
      `${this.url}/v1/e/caso/bandejas/fiscaliasuperior`
    );
  }

  public obtenerElevacionActuados(datos:any): Observable<any> {
    return this.apiBase.post(BACKEND.CFE_EFE_SUPERIOR+'/v1/e/caso/bandejas/actuados', datos);
  }

  public obtenerContiendaCompetencia(datos:any): Observable<any> {
    return this.apiBase.post(BACKEND.CFE_EFE_SUPERIOR+'/v1/e/caso/bandejas/contienda-competencia', datos);
  }
  public obtenerExclusionFiscal(datos:any): Observable<any> {
    return this.apiBase.post(BACKEND.CFE_EFE_SUPERIOR+'/v1/e/caso/bandejas/exclusion-fiscal', datos);
  }
  public obtenerApelacionesAutoYSentencia(datos:any): Observable<any> {
    return this.apiBase.post(BACKEND.CFE_EFE_SUPERIOR+'/v1/e/caso/bandejas/apelacion-auto-sentencia', datos);
  }


  public obtenerRetiroAcusacion(datos:any): Observable<any> {
    return this.apiBase.post(BACKEND.CFE_EFE_SUPERIOR+'/v1/e/caso/bandejas/retiroacusacion', datos);
  }

  public leerCaso(datos:any): Observable<any> {
    return this.apiBase.post(BACKEND.CFE_EFE_SUPERIOR+'/v1/e/caso/bandejas/leer', datos);
  }

}
