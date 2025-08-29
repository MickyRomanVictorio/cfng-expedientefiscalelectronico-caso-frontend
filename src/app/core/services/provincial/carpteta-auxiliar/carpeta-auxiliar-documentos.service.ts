import {Injectable} from '@angular/core';
import {BACKEND} from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import {Observable} from 'rxjs';

import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CarpetaAuxiliarDocumentosService {

  urlConsultas = `${BACKEND.CFE_EFE}/v1/e/caso/carpetaauxiliar`

  constructor(private apiBase: ApiBaseService,
              private http: HttpClient) {
  }


  obtenerDocumentos(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlConsultas}/lista/${idCaso}`
    );
  }

  obtenerFileDocumento(idCaso: string, idDocumento: string,): Observable<any> {
    return this.apiBase.get(
      `${this.urlConsultas}/${idCaso}/${idDocumento}`
    );
  }

  obtenerMasivoFilesDocumento(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlConsultas}/bulk/${idCaso}`
    );
  }
}
