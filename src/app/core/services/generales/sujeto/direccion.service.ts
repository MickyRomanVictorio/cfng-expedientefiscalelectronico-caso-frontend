import { Injectable, OnInit } from '@angular/core';
import { BACKEND } from '@environments/environment';
import {ApiBaseService} from "@core/services/shared/api.base.service";
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class direccionService {

  urlTransaccion: string = `${BACKEND.CFE_EFE}/v1/e/calificacion/direccion`

  decodeToken: any;

  constructor(private apiBase: ApiBaseService) { }



  obtenerDirecciones(sujeto:any): Observable<any> {
    return this.apiBase.get(
      `${this.urlTransaccion}/lista/${sujeto}`
    );
  }

  obtenerUnaDireccion(idDireccion:any): Observable<any> {
    return this.apiBase.get(
      `${this.urlTransaccion}/verid/${idDireccion}`
    );
  }

  registrarDireccion(direccion:any, opcion:any): Observable<any> {
    // Carlos
    if (opcion.toLowerCase() === 'editar') {
      return of({
        direccion_nueva: direccion,
        code: 200
      });
      // Uncomment the following line if you want to make an HTTP request
      // return this.apiBase.put(`${this.urlTransaccion}`, direccion);
    } else {
      return of({
        direccion_nueva: direccion,
        code: 200
      });
      // Uncomment the following line if you want to make an HTTP request
      // return this.apiBase.post(`${this.urlTransaccion}`, direccion);
    }
  }

  registrarDireccionBD(direccion:any, opcion:any): Observable<any> {
    // Carlos
    if (opcion.toLowerCase() === 'editar') {

      return this.apiBase.put(`${this.urlTransaccion}`, direccion);
    } else {

      return this.apiBase.post(`${this.urlTransaccion}`, direccion);
    }
  }


  borrarDireccion(idDireccion:any): Observable<any> {
    return this.apiBase.delete(
      `${this.urlTransaccion}/${idDireccion}`
    );
  }


}
