import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BACKEND } from "@environments/environment";
import { ApiBaseService } from "@services/shared/api.base.service";
import { EnviarTramiteRequest } from "@core/interfaces/comunes/EnviarTramiteRequest";
import { EnviarTramiteMasivoRequest } from "@core/interfaces/comunes/EnviarTramiteMasivoRequest";

@Injectable({
  providedIn: 'root'
})
export class EnviarTramiteService {

  constructor(private readonly apiBase: ApiBaseService) {
  }

  obtenerPerfilesUsuarios(idactotramitetramitecaso: string, accion: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/enviartramite/despacho/${idactotramitetramitecaso}/${accion}`
    );
  }

  enviarSimpleTramite(data :EnviarTramiteRequest): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/enviartramite`, data
    );
  }

  enviarMasivoTramites(data : EnviarTramiteMasivoRequest): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/enviartramite/tramites`, data ///${coDespachoFiscal}
    );
  }
}
