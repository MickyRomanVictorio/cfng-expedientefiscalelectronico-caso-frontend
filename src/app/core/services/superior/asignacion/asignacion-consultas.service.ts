import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsignacionConsultasSuperiorService {

  private urlTransaccionSuperior: string = `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/asignacionsuperior`;
  // decodeToken: any;
  constructor( private apiBase: ApiBaseService ) { }
  obtenerCasosPorAsignarSuperior(tiempo: String): Observable<any> {
    let url = `${this.urlTransaccionSuperior}/listar?&tiempo=${tiempo}`;
    return this.apiBase.get(url);
  }
  public obtenerFiscales(): Observable<any> {
    return this.apiBase.get(`${this.urlTransaccionSuperior}/fiscales`);
  }
}
