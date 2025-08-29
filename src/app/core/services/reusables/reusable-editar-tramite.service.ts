import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { Observable } from 'rxjs';
import {
  TramitePendieteResoculicion
} from "@interfaces/provincial/tramites/comun/calificacion/resolucion-auto-preparatorio/resolucion-auto-preparatorio.interface";
import { Converter } from '@interfaces/visor/visor-interface';
@Injectable({
  providedIn: 'root',
})
export class ReusableEditarTramiteService {

  url = `${BACKEND.CFE_EFE}/v1/e/caso/tramite/firmado`;

  constructor(private readonly apiBase: ApiBaseService) {}

  editar(idCaso: string, idDocumentoVersiones: string): Observable<any> {
    const request = {
      idCaso: idCaso,
      idDocumentoVersiones: idDocumentoVersiones,
    };
    return this.apiBase.put(`${this.url}/editar`, request);
  }

  verificarDocumentoEditado(path: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFE_GESTOR_DOCUMENTAL}/api/v1/getDocumentStatus?fileName=${path}`);
  }

  eliminarDocumento(data: Converter): Observable<any> {
    return this.apiBase.post(`${BACKEND.CFE_GESTOR_DOCUMENTAL}/api/v1/delete`, data);
  }

  validarCondiciones(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get( `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/tramite/firmado/validarCondiciones/${idActoTramiteCaso}`);
  }

  editarTramiteFirmado(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.put( `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/tramite/firmado/editarTramite/${idActoTramiteCaso}`, {});
  }

  guardarDocumentoEditado(idDocumentoVersion: string, nombreDocumento: string): Observable<any> {
    return this.apiBase.post( `${BACKEND.CFE_EFE_TRAMITES}/v1/e/${idDocumentoVersion}/actualizaDocumento/${nombreDocumento}`, {});
  }

  registrarTramitePendienteResolucion(data: TramitePendieteResoculicion): Observable<any> {
    return this.apiBase.post(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucion/auto/resuelve/registrar`, data);
  }

  validarEstadoUltimoActoTramite(idActoTramiteCaso: string): Observable<String> {
    return this.apiBase.get( `${BACKEND.CFE_EFE_TRAMITES}/v1/e/tramites/activos/estadoUltimoActoTramite/${idActoTramiteCaso}`);
  }

}
