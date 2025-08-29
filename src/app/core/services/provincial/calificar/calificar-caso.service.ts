import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalificarCasoService {

  urlCasosAnulados = `${BACKEND.CFE_EFE}/v1/e/caso/consulta`

  constructor( private apiBase: ApiBaseService ) { }

  obtenerInformacionCalificarCaso(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${ this.urlCasosAnulados }/general?idCaso=${idCaso}`
    );
  }

}
