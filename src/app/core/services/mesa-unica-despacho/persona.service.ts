import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  constructor(private apiBase: ApiBaseService ) { }

  buscarPersonaSujetoPerYExtr(idTipoDocIdent: number, numeroDocumento: string, idCaso: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.MESA_UNICA_DESPACHO}v1/e/persona/buscarPersonaSujetoPerYExtr/${idTipoDocIdent}/${numeroDocumento}/${idCaso}`);
  }

}
