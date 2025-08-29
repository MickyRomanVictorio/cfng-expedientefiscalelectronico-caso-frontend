import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CuadernosIncidentalesService {

  private readonly urlCuaderno = BACKEND.CFE_EFE_CUADERNO+'/v1';
  private readonly urlMaestros = BACKEND.CFEMAESTROS+'v1';

  constructor(
    private readonly apiBase: ApiBaseService
  ) { }

  public lista(datos:any):Observable<any>{
    return this.apiBase.post( this.urlCuaderno + '/e/cuaderno/listar', datos);
  }

  public listaClasificadorExpediente():Observable<any>{
    return this.apiBase.get( this.urlMaestros + '/eftm/e/tipoclasificadorexpediente?idClasificadorExpediente=2');
  }

  public listaCuadernoIndidentalXCasoPadre(idCasoPadre:string):Observable<any>{
    return this.apiBase.get( this.urlCuaderno + '/e/tipoclasificador?idCasoPadre='+idCasoPadre);
  }

  public listaSujetosProcesalesXCasoPadre(idCasoPadre:string, idCaso:string | null, idTipoClasificador:string| null):Observable<any>{
    return this.apiBase.get( this.urlCuaderno + '/e/sujetoprocesal?idCasoPadre='+idCasoPadre+'&idCaso='+idCaso+'&idTipoClasificador='+idTipoClasificador);
  }

  public registrar(datos:any){
    return this.apiBase.post( this.urlCuaderno + '/e/cuaderno', datos);
  }

  public modificar(datos:any){
    return this.apiBase.put( this.urlCuaderno + '/e/cuaderno', datos);
  }

  public borrar(idCuaderno:string){
    return this.apiBase.delete( this.urlCuaderno + '/e/cuaderno/'+idCuaderno);
  }

  public alertaFechaDetalle(idCuaderno:string, idTramite:string){
    return this.apiBase.get( this.urlCuaderno + '/e/sujetoprocesal/listarsujetofecharequerimiento?idCaso='+idCuaderno+'&idTramite='+idTramite);
  }

}
