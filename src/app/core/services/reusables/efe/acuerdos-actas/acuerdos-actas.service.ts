import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AcuerdosActasService {
  urlTramites = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/acuerdo/actas/`

  constructor(
    private readonly apiBase: ApiBaseService
  ) { }

  registrarEditar(request: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlTramites}registrar-editar`, request
    );
  }

  obtenerAcuerdosDatos(idAcuerdosActa: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}obtener/${idAcuerdosActa}`,
    );
  }

  listarImputados(idCaso: string, idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}listar-imputados/${idCaso}/${idActoTramiteCaso}`
    );
  }

  eliminarAcuerdoActa(idAcuerdosActa: string | null): Observable<any> {
    return this.apiBase.delete(
      `${this.urlTramites}eliminar/${idAcuerdosActa}`
    );
  }

  validarAcuerdosActa(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}validar-acuerdos-acta-tramite/${idActoTramiteCaso}`
    );
  }
}

