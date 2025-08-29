import {Injectable} from "@angular/core";
import {BACKEND} from "@environments/environment";
import {ApiBaseService} from "@services/shared/api.base.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class ReusableFuentesInvestigacionService {

  urlFuentesInvestigacion = `${BACKEND.CFE_EFE}/v1/e/caso/gestionarfuentesinvestigacion`;
  urlRepositorioDocumentoPrivado = `${BACKEND.REPOSITORIO_DOCUMENTO_PRIVADO}`;
  urlMaestroDocumento = `${BACKEND.CFEMAESTROSDOCUMENTOS}/v1/cftm/t/gestion`

  constructor(private apiBase: ApiBaseService) {
    this.apiBase = apiBase;
  }

  getFuenteInvestigacion(idCaso: string): Observable<any> {
    return this.apiBase.get(`${this.urlFuentesInvestigacion}/detallefuenteinvestigacion/${idCaso}`);
  }

  eliminarDocumentoRepositorio(idNode: string): Observable<any> {
    return this.apiBase.delete(`${this.urlFuentesInvestigacion}/eliminarArchivo/${idNode}`);
  }

  obtenerIdMovimientoCaso(idCaso: string): Observable<any> {
    return this.apiBase.get(`${this.urlFuentesInvestigacion}/obtenerIdMovimientoCaso/${idCaso}`);
  }

  guardarDocumentoRepositorio(data: any): Observable<any> {
    return this.apiBase.post(`${this.urlMaestroDocumento}/registradocumentomultipart`, data);
  }

  getUrlVisualizar(idArchivo: string, nombreArchivo: string): string {
    return `${this.urlRepositorioDocumentoPrivado}/visualizar?archivoId=${idArchivo}&nombreArchivo=${nombreArchivo}`;
  }

  getUrlDescargar(idArchivo: string, nombreArchivo: string): string {
    return `${this.urlRepositorioDocumentoPrivado}?archivoId=${idArchivo}&nombreArchivo=${nombreArchivo}`;
  }

}
