import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CuadernosEjecucionService {

  private readonly urlCuaderno = BACKEND.CFE_EFE_CUADERNO+'/v1/e/cuaderno/ejecucion';
  private readonly urlMaestros = BACKEND.CFEMAESTROS+'v1';

  constructor(
    private readonly apiBase: ApiBaseService
  ) { }

  public lista(datos:any):Observable<any>{
    return this.apiBase.post( this.urlCuaderno + '/listar', datos);
  }
  public listaClasificadorExpediente():Observable<any>{
    return this.apiBase.get( this.urlMaestros + '/eftm/e/tipoclasificadorexpediente?idClasificadorExpediente=3');
  }
  public listarPenasCuadernoEjecucion(idActoTramiteDelitoSujeto:any):Observable<any>{
    return this.apiBase.get( `${this.urlCuaderno}/listar/penas/${idActoTramiteDelitoSujeto}`);
  }
  public listarReparacionCivilCuadernoEjecucion(idActoTramiteDelitoSujeto:any):Observable<any>{
    return this.apiBase.get( `${this.urlCuaderno}/listar/reparacion-civil/${idActoTramiteDelitoSujeto}`);
  }
  public eliminarCuadernoEjecucion(idCaso: string ): Observable<any> {
    return this.apiBase.delete(
      `${this.urlCuaderno}/${idCaso}`
    );
  }
}
