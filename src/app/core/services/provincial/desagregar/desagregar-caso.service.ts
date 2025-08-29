import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BACKEND } from "@environments/environment";
import { ApiBaseService } from "@services/shared/api.base.service";
import { GruposDesagregadosRequest } from "@core/interfaces/provincial/administracion-casos/desagregar/GruposDesagregadosRequest";

@Injectable({
  providedIn: 'root'
})
export class DesagregarCasoService {

  constructor(private apiBase: ApiBaseService) { }
  obtenerDelitosYPartes(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/preliminar/obtenerDelitosPartes/${idCaso}`
      // `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/tramite/preliminar/obtenerDelitosPartes/${idCaso}`
    );
  }

  confirmarDesagregarCaso(request: GruposDesagregadosRequest[]): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/preliminar/confirmarDesagregar`, request
      // `${BACKEND.CFE_EFE}/v1/e/caso/tramite/preliminar/confirmarDesagregar`,request
    );
  }

  obtenerGruposDesagregados(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/desagregar/obtenerGruposDesagregados/${idActoTramiteCaso}`
      // `${BACKEND.CFE_EFE}/v1/e/caso/tramite/preliminar/confirmarDesagregar`,request
    );
  }


}
