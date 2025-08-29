import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {BACKEND} from "@environments/environment";
import {ApiBaseService} from "@services/shared/api.base.service";
import { DocumentoAtencionRequest } from "@core/interfaces/provincial/documentos-ingresados/DocumentoAtencionRequest";
import { CuadernoIncidentalResponse } from '@interfaces/provincial/documentos-ingresados/CuadernoIncidental';

@Injectable({
  providedIn: 'root'
})
export class AtenderDocumentosService {

  constructor(private apiBase: ApiBaseService) {
  }

  guardarAtencion(request: DocumentoAtencionRequest): Observable<any> {
    return this.apiBase.post(`${BACKEND.CFE_EFE}/v1/e/caso/documento/atender/guardar`, request);
  }
  obtenerOficios(caso: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFE_EFE}/v1/e/caso/documento/atender/oficios/${caso}`);
  }
  obtenerEtapa(caso: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFE_EFE}/v1/e/caso/documento/atender/etapa/${caso}`);
  }

  listarCuadernosIncidentales(caso: string, tipoCuaderno: string): Observable<CuadernoIncidentalResponse[]> {
    return this.apiBase.get(`${BACKEND.CFE_EFE}/v1/e/caso/documento/atender/cuadernosincidentales/${caso}/${tipoCuaderno}`);
  }

  listarPestaniasApelaciones(caso: string): Observable<CuadernoIncidentalResponse[]> {
    return this.apiBase.get(`${BACKEND.CFE_EFE}/v1/e/caso/documento/atender/pestaniasapelaciones/${caso}`);
  }
}
