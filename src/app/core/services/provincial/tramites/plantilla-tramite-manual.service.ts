import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { TramiteResponse } from '@interfaces/comunes/crearTramite';
import {
  PlantillaPersonalizada
} from '@interfaces/provincial/tramites/tramite-manual/plantillas-tramite-manual.interface';


@Injectable({
  providedIn: 'root',
})
export class PlantillaTramiteManualService {
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/plantillas`;

  private _tramiteRegistrado!: TramiteResponse;
  private _reloadEditor = new BehaviorSubject<string | undefined>('');
  reloadEditor = this._reloadEditor.asObservable();
  constructor(private apiBase: ApiBaseService, private http: HttpClient) {}

  handleReloadEditor() {
    this._reloadEditor.next('');
  }

  set tramiteRegistrado(data: TramiteResponse) {
    this._tramiteRegistrado = data;
  }

  get tramiteRegistrado(): TramiteResponse {
    return this._tramiteRegistrado;
  }

  subirNuevaPlantilla(
  data: FormData
  ): Observable<HttpEvent<any>> {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    return this.http.post<any>(
      `${this.url}/personalizada`,
      data,
      {
        headers,
        reportProgress: true,
        observe: 'events',
      }
    );
  }

  listarPlantillas(
    idActoTramiteEstado: string,
    codigoDespacho: string,
    idActoTramiteCaso: string
  ): Observable<PlantillaPersonalizada[]> {
    return this.apiBase.get(
      `${this.url}/listar/plantillapersonalizada/${idActoTramiteEstado}/${codigoDespacho}/${idActoTramiteCaso}`
    );
  }

  eliminarPlantilla(idPlantillaDocumento: number): Observable<any> {
    return this.apiBase.delete(`${this.url}/eliminarplantillaperson/${idPlantillaDocumento}`);
  }

  editarPlantilla(idPlantillaDocumento:number){
    return this.apiBase.put(`${this.url}/editarplantillapersonalizada/${idPlantillaDocumento}`, {});
  }

  public descargarPlantilla(idPlantillaDocumento:number):Observable<any> {
    return this.http.get(`${this.url}`+`/descargarplantilla/${idPlantillaDocumento}`, {responseType: 'blob'});
  }
  public descargarPlantillaConIdNode(idNode:string, idActoTramiteEstado: string, idCaso: string):Observable<any> {
    return this.http.get(`${this.url}`+`/descargarplantillaidnode/${idNode}/${idActoTramiteEstado}/${idCaso}`, {responseType: 'blob'});
  }

}
