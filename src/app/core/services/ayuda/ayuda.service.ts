import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import {ApiBaseService} from "@services/shared/api.base.service";
import {CasoAcumuladoRequest} from "@interfaces/provincial/tramites/acumulacion/CasoAcumuladoRequest";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AyudaService {

  url = `${BACKEND.CFE_EFE}/v1/e/caso/ayuda`

  constructor( private apiBase: ApiBaseService ) { }

  obtenerCategorias(): Observable<any> {
    return this.apiBase.get(`${this.url}`);
  }

  busqueda(busqueda: any): Observable<any> {
    return this.apiBase.post(`${this.url}/buscar`, busqueda);
  }

  obtenerCategoriaDetalle(idCategoria: any): Observable<any> {
    return this.apiBase.get(`${this.url}/${idCategoria}`);
  }

  obtenerCategoriasRelacionadas(idCategoria: any): Observable<any> {
    return this.apiBase.get(`${this.url}/${idCategoria}/relacionadas`);
  }

  guardarComentario(comentario: any): Observable<any> {
    return this.apiBase.post(`${this.url}/comentario`, comentario);
  }

  guardarPregunta(pregunta: any): Observable<any> {
    return this.apiBase.post(`${this.url}/pregunta`, pregunta);
  }

}
