import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from '@services/shared/api.base.service';
import { DocumentoIngresadoNuevoRequest } from '@interfaces/provincial/documentos-ingresados/DocumentoIngresadoNuevoRequest';
import { PaginateResponseList } from '@core/interfaces/comunes/GenericResponse';
import { DocumentoIngresadoNuevo } from '@core/interfaces/provincial/documentos-ingresados/DocumentoIngresadoNuevo';

@Injectable({
  providedIn: 'root',
})
export class DocumentosIngresadosService {
  eventReloadBanedjaEscritos = new EventEmitter<boolean>();
  cantidadPagina: number = 10;

  constructor(private apiBase: ApiBaseService) {}

  reloadBandejaEscritos(event: boolean) {
    this.eventReloadBanedjaEscritos.emit(event);
  }

  obtenerDocumentosIngresadosNuevos(request: DocumentoIngresadoNuevoRequest): Observable<PaginateResponseList<DocumentoIngresadoNuevo>> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE}/v1/e/caso/documentoingresado/listadocumentoingresado`,
      request
    );
  }
}
