import {Injectable} from '@angular/core';
import {BACKEND} from "@environments/environment";
import { ApiBaseService } from "@core/services/shared/api.base.service";
import {Observable} from 'rxjs';
import {HechosCasoRequest} from "@core/interfaces/reusables/hechos-caso/HechosCasoRequest";

@Injectable({
  providedIn: 'root'
})

export class ReusablesHechosCasoService {

  urlHechosCaso = `${BACKEND.CFE_EFE}/v1/e/caso/hechocaso`;

  constructor(private apiBase: ApiBaseService) {
  }

  getVersionActual(idCaso: string): Observable<any> {
    return this.apiBase.get(`${this.urlHechosCaso}/versionactual?idCaso=${idCaso}`);
  }

  getVersionAnterior(idHechoHistorial: string): Observable<any> {
    return this.apiBase.get(`${this.urlHechosCaso}/versionanterior?idHechoHistorial=${idHechoHistorial}`);
  }

  getListaHistorial(idHecho: string): Observable<any> {
    return this.apiBase.get(`${this.urlHechosCaso}/listahistorial?idHecho=${idHecho}`);
  }
  actualizarHechosCaso(request: HechosCasoRequest): Observable<any> {
    return this.apiBase.put(`${this.urlHechosCaso}/actualiza`, request);
  }

}
