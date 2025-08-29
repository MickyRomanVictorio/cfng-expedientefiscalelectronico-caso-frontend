import {Injectable} from '@angular/core';
import {ApiBaseService} from '@core/services/shared/api.base.service';
import {BACKEND} from '@environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MesaDocumentoService {

  constructor(private apiBase: ApiBaseService) {
  }

  obtenerPreCargoDenuncia(body: any, perfilId: number, tipoOrigen: number): Observable<any> {
    return this.apiBase.postFileBase64(`${BACKEND.MESA_DOCUMENTO}v1/t/pdf/denuncia/precargo/${perfilId}/${tipoOrigen}`, body);
  }

  obtenerPreCargoDocumento(body: any, tipoTramite:number, tipoOrigen: number): Observable<any> {
    return this.apiBase.postFileBase64(`${BACKEND.MESA_DOCUMENTO}v1/t/pdf/documento/precargo/${tipoTramite}/${tipoOrigen}`, body);
  }

  obtenerDocumentoServidor(idDocumento:String): Observable<any> {
    return this.apiBase.get(`${BACKEND.MESA_DOCUMENTO}v1/t/documento/obtienedocumento/${idDocumento}`);
  }
}
