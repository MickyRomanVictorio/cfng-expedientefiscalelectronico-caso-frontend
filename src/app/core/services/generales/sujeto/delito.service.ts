import {Injectable} from '@angular/core';
import {BACKEND} from '@environments/environment';
import {ApiBaseService} from "@core/services/shared/api.base.service";
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DelitoService {

  urlDelitoSujeto: string = `${BACKEND.CFE_EFE_SUJETOS}/v1/e/calificacion/delito`

  constructor(
    private apiBase: ApiBaseService
  ) {}

  listarDelitosSujeto(idSujetoCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlDelitoSujeto}/lista/${idSujetoCaso}`
    );
  }

  eliminarDelitoSujeto(idDelitoSujeto: string): Observable<any> {
    return this.apiBase.delete(
      `${this.urlDelitoSujeto}/${idDelitoSujeto}`
    );
  }

}
