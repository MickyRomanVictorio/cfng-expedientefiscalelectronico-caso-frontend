import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from '../shared/api.base.service';
import { CargoCedulaRequest, DatosGenerales, DocumentoAnexo, DocumentoPrincipal, RepositorioResponse } from '@core/models/notificaciones.model';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
@Injectable({ providedIn: 'root' })
export class OrdenService {

  constructor( private apiBase: ApiBaseService, private httpClient: HttpClient ) {}

  obtenerDatosGenerales(idMovimientoCaso: string): Observable<DatosGenerales> {
    return this.apiBase.get(
       `${BACKEND.CFENOTIFICACIONES}/e/orden/datosGenerales/${idMovimientoCaso}`
    );
  }

  obtenerDatosSecundarios(idCaso: string, idMovimiento: string): Observable<DocumentoPrincipal[]> {
    return this.apiBase.get(`${BACKEND.CFENOTIFICACIONES}/e/orden/docs/${idCaso}/${idMovimiento}`)
  }

  obtenerDocumentoPorID(idDocumento: string): Observable<DocumentoPrincipal> {
    return this.apiBase.get(`${BACKEND.CFENOTIFICACIONES}/e/orden/detalledoc/${idDocumento}`);
  }

  obtenerDocumentosAdjuntos(idCedula: any): Observable<DocumentoAnexo[]> {
    return this.apiBase.get(
       `${BACKEND.CFENOTIFICACIONES}/e/cedula/docsCompletos/${idCedula}`
    );
  }

  obtenerArchivoAdjunto(idAdjunto: string) {
    return this.httpClient.get(`${BACKEND.CFENOTIFICACIONES}/e/cedula/documentos/${idAdjunto}`, { responseType: 'text' })
  }

  subirDocumentoAnexo(cargoCedula: CargoCedulaRequest): Observable<any> {
    return this.httpClient.post(
       `${BACKEND.CFENOTIFICACIONES}/e/cedula/docs`, cargoCedula, {responseType: 'text' })
  }

  subirDocumentoARepositorio(formData: FormData):Observable<HttpEvent<RepositorioResponse>> {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    return this.httpClient.post<RepositorioResponse>(
       `${BACKEND.NOTDOCUMENTOS}`,
       formData,
       {
          headers,
          reportProgress: true,
          observe: 'events',
       })
  }

  verDocumentoFirmado(name: string) {
    return this.httpClient.get(`${BACKEND.NOTDOCUMENTOS}/verdocumento/${name}`)
  }

  obtenerOrdenes(payload:any): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFENOTIFICACIONES}/e/orden`,
      payload
    );
  }

  obtenerOrdenesExcel(payload:any): Observable<any> {
    return this.apiBase.postBlob(
      `${BACKEND.CFENOTIFICACIONES}/e/orden/excel`, payload
    );
  }


  anularCedulasPorOrden(orderId:string): Observable<any> {
    return this.apiBase.deleteRetornaTexto(
      `${BACKEND.CFENOTIFICACIONES}/e/orden/${orderId}`
    );
  }

  obtenerInformacionDetalleOrden( idOrden: string ): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFENOTIFICACIONES}/e/orden/detalle/${idOrden}`
    );
  }

  obtenerSujetosPorOrden( idOrden: string ): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFENOTIFICACIONES}/e/orden/sujetos/orden/${idOrden}`
    );
  }

  agregarSujeto(sujeto: any) {
    return this.apiBase.post(`${BACKEND.CFENOTIFICACIONES}/e/orden/agregarSujeto`, sujeto);
  }

  crearOrden(orden: any) {
    return this.apiBase.post(`${BACKEND.CFENOTIFICACIONES}/e/orden/crear`, orden);
  }

}