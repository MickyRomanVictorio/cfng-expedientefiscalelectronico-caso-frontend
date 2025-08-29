import { Injectable } from '@angular/core';
import { BACKEND } from "@environments/environment";
import { Observable } from 'rxjs';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { ListResponse } from '@interfaces/comunes/genericos.interface';
import { VisorDocumentoResponse } from '@interfaces/provincial/documentos-ingresados/DocumentoIngresadoNuevo';
@Injectable({
  providedIn: 'root'
})

export class BandejaDocumentosVisorService {
  url = `${BACKEND.CFE_EFE}/v1/e/caso/tramite/documentos`

  constructor(private apiBase: ApiBaseService) { }

  obtenerInfoDocumento(ideDocumento: string): Observable<ListResponse<VisorDocumentoResponse>> {
    return this.apiBase.get(
      `${this.url}/visor/${ideDocumento}`
    );
  }

  obtenerAsuntosObs(ideDocumento: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/verasuntosobs/${ideDocumento}`
    );
  }

  obtenerAtenderDocumento(ideDocumento: string, estadoDocumento: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/visor/detalleatenderdocumento/${ideDocumento}/${estadoDocumento}`
    );
  }

}
