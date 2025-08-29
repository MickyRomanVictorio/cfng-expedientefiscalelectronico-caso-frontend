import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BACKEND} from "@environments/environment";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiRecibidosAceptadosService {

  url = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/recibidos`
  constructor(private http: HttpClient) {
  }

  obtenerAceptados(buscar:any,tipoFecha:any,desde:any,hasta:any ): Observable<any> {
        return this.http.get(
            `${this.url}/aceptados/${buscar}/${tipoFecha}/${desde}/${hasta}`
        )
    }

}
