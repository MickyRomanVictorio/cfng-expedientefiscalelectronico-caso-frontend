import { Injectable } from '@angular/core';
import {
  InputadosAcusacion,
  PlazoAcusacion
} from '@interfaces/provincial/tramites/especiales/incoacion/requerimiento-acusacion';
import { ApiBaseService } from '@services/shared/api.base.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BACKEND } from '@environments/environment';
import { ListResponse, Response } from '@interfaces/comunes/genericos.interface';

@Injectable({
  providedIn: 'root'
})
export class RequerimientoAcusacionService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/procesosespeciales/incoacion`
  private _listaImputados: InputadosAcusacion[] = [];

  constructor(private apiBase: ApiBaseService,
              private http: HttpClient) {
  }

  set listaImputados(data: InputadosAcusacion[]) {
    this._listaImputados = data;
  }

  get listaImputados(): InputadosAcusacion[] {
    return this._listaImputados;
  }

  obtenerImputados(idCaso: string): Observable<ListResponse<InputadosAcusacion>> {
    return this.apiBase.get(`${this.url}/consultar/inputados/${idCaso}`);
  }

  validarPlazos(idActoTramiteCaso: string): Observable<Response<PlazoAcusacion>> {
    return this.apiBase.get(`${this.url}/validar/plazo/${idActoTramiteCaso}`);
  }
}
