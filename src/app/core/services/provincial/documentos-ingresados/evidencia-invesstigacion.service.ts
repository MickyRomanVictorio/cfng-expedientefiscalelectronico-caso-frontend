import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BACKEND} from '@environments/environment';
import {ApiBaseService} from '@services/shared/api.base.service';

@Injectable({
  providedIn: 'root',
})
export class EvidenciaInvesstigacionService {

  constructor(private apiBase: ApiBaseService) {}

  obtenerEvidencias(requestFuentes: any): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE}/v1/e/evidencia/investigaciones/${requestFuentes.idCaso}/${requestFuentes.idDocumentoEscrito}`
    );
  }
}
