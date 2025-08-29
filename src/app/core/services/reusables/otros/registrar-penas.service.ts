import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrarPenasService {
  urlTramites = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/penas`


  constructor(private apiBase: ApiBaseService) { }

  listarSujetos(idCaso: string, idTipoParteSujeto: number | null = null): Observable<any> {
    let url = `${this.urlTramites}/lista/sujetos/${idCaso}`;

    if (idTipoParteSujeto !== null) {
      url += `?idTipoParteSujeto=${idTipoParteSujeto}`;
    }

    return this.apiBase.get(url);
  }



  listarDelitosxSujeto(sujeto: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}/lista/delitos/${sujeto}`
    );
  }
  listarPenas(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}/listar/${idActoTramiteCaso}`
    );
  }

  validar(request: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlTramites}/validar`, request
    );
  }

  crearEditarPena(request: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlTramites}/guardar`, request
    );
  }
  obtenerPena(idActoTramiteDelitoSujeto: string, idPena: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}/obtener/${idActoTramiteDelitoSujeto}/${idPena}`
    );
  }

  eliminarPena(idActoTramiteDelitoSujeto: string, idPena: string): Observable<any> {
    return this.apiBase.delete(
      `${this.urlTramites}/eliminar/${idActoTramiteDelitoSujeto}/${idPena}`
    );
  }

}
