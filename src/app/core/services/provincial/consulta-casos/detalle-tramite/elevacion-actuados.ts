import {Injectable} from '@angular/core';
import {BACKEND} from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import { registroElevacion } from '@core/interfaces/reusables/elevacion-actuados/registroElevacion.interface.request';

@Injectable({
  providedIn: 'root',
})
export class ElevacionActuadosService {

  urlConsultas = `${BACKEND.CFE_EFE}/v1/e/caso/reusables`
  private data ='';
  private idCaso = '';


  constructor(
    private apiBase: ApiBaseService,
    private http: HttpClient) {
  }

  listarDependencias(idTipoOrgJuri: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlConsultas}/listarDependencias/${idTipoOrgJuri}`
    );
  }

  validarElevacion(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlConsultas}/validarElevacion/${idCaso}`
    );
  }

  registrarElevacion(request: registroElevacion): Observable<any> {
    return this.apiBase.put(
      `${this.urlConsultas}/registrarElevacion`, request);
  }

  setTramite(data: string) {
    this.data = data;
  }
  getTramite(){
    return this.data;
  }
  setIdCaso(idCaso: string) {
    this.idCaso = idCaso;
  }
  getIdCaso(){
    return this.idCaso;
  }
}
