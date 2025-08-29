import { Injectable, OnInit } from '@angular/core';
import { BACKEND } from '@environments/environment';
import {ApiBaseService} from "@core/services/shared/api.base.service";
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AbogadoService {

  urlTransaccion: string = `${BACKEND.CFE_EFE_SUJETOS}/v1/e/abogado`

  constructor(private apiBase: ApiBaseService) { }

  listarAbogados(idVinculoSujeto:any): Observable<any> {
    return this.apiBase.get(
      `${this.urlTransaccion}/${idVinculoSujeto}`
    );
  }
  obtenerUnAbogado(idVinculoSujeto:any): Observable<any> {
    return this.apiBase.get(
      `${this.urlTransaccion}/verid/${idVinculoSujeto}`
    );
  }
  agregarEditarAbogado(abogado:any): Observable<any> {
    return this.apiBase.post(
      `${this.urlTransaccion}/agregar-editar`,
      abogado
    );
  }
  eliminarAbogado(idVinculoSujeto:any): Observable<any> {
    return this.apiBase.delete(
      `${this.urlTransaccion}/${idVinculoSujeto}`
    );
  }

  habilitar(idVinculoSujeto:string, habilitado:boolean): Observable<any> {
    return this.apiBase.postEmpty(
      `${this.urlTransaccion}/habilitada/${idVinculoSujeto}/${habilitado}`
    );
  }

}
