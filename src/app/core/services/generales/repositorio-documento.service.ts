import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { catchError, Observable, throwError, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RepositorioDocumentoService {

  componenteActivo: number = 0

  constructor(private readonly apiBase: ApiBaseService) {
  }

  verDocumentorepositorio(name: string): Observable<any> {
    return this.apiBase.getFile(`${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}descargar?nodeId=${name}`);
  }

  eliminarDocumentorepositorio(name: string): Observable<any> {
    return this.apiBase.delete(`${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}eliminar?filename=${name}`);
  }

  // vistaPreviaDenuncia(body: Object, perfilId: number): Observable<any> {
  //   return this.apiBase.postFile(`${BACKEND.MESA_DOCUMENTO}v1/t/pdf/denuncia/precargo/${perfilId}/2`, body);
  // }

  guardarGrupoDocumentoRepositorio(data:any): Observable<any> {
    return this.apiBase.postMultiPart(`${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}uploadzip`,data);
  }

  guardarDocumentoRepositorio(data:any): Observable<any> {
    console.log(data);
    return this.apiBase.postMultiPart(`${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}cargar`, data);
  }

  guardarDocumentoRepositorioChunks(base64: string, mimeType: string, fileName: string): Observable<any> {
    return this.apiBase.uploadBase64InChunks(`${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}upload-chunk`, base64, mimeType, fileName);
  }

}
