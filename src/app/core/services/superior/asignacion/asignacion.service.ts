import {Injectable} from '@angular/core';
import {ApiBaseService} from '@core/services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {

  private url = `${BACKEND.CFE_EFE_SUPERIOR}`;

  constructor(private apiBase: ApiBaseService) { }

  public obtenerPorAsignar(datos:any): Observable<any> {
    return this.apiBase.post(this.url+'/v1/e/asignacion/porAsignar', datos);
  }

  public obtenerAsignados(datos:any): Observable<any> {
    return this.apiBase.post(this.url+'/v1/e/asignacion/asignados', datos);
  }

  public asignarCasos(datos:any): Observable<any> {
    return this.apiBase.post(this.url+'/v1/e/caso/bandejas/fiscaliasuperior/asignarCaso', datos);
  }
  public revertirCasos(idCaso:string,datos:any): Observable<any> {
    return this.apiBase.post(this.url+'/v1/e/caso/bandejas/fiscaliasuperior/'+idCaso+'/revertirCaso', datos);
  }

  public desasignarCasos(datos:any): Observable<any> {
    return this.apiBase.post(this.url+'/v1/e/caso/bandejas/fiscaliasuperior/desasignarCaso', datos);
  }

  public atenderCaso(idCaso:string,datos:any): Observable<any> {
    return this.apiBase.post(this.url+'/v1/e/caso/bandejas/fiscaliasuperior/'+idCaso+'/atenderCaso', datos);
  }

  public reasignarCasos(datos:any): Observable<any> {
    return this.apiBase.post(this.url+'/v1/e/caso/bandejas/fiscaliasuperior/reasignarCaso', datos);
  }

  public obtenerObservados(datos:any): Observable<any> {
    return this.apiBase.post(this.url+'/v1/e/caso/bandejas/observados', datos);
  }

  public obtenerRecepcionar(datos:any): Observable<any> {
    return this.apiBase.post(this.url+'/v1/e/recepcion/recibidos', datos);
  }

  public recibirCasos(datos:any): Observable<any> {
    return this.apiBase.post(this.url+'/v1/e/recepcion/recibir', datos);
  }
}
