import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import {BehaviorSubject, Observable} from 'rxjs';
import { BuscarCasosAnuladosRequest } from '@core/interfaces/provincial/administracion-casos/anulados/BuscarCasosAnuladosRequest';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, CasoIdRequest } from '@core/interfaces/provincial/recepcion/CasoPorRecepcionar';
import { CasoLeidoRequest } from '@core/interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest';

@Injectable({
  providedIn: 'root'
})
export class RecepcionConsultasService {

  url = `${BACKEND.CFE_EFE}/v1/e/caso/recepcion`

  constructor( private apiBase: ApiBaseService,
    private http: HttpClient ) { }

  getCasosAnulados(page:number, psize:number): Observable<any> {
    return this.apiBase.get(`${ this.url }/asignacion/casosAnulados?page=${page}&size=${psize}`);
  }

  buscarCasosAnulados(request: BuscarCasosAnuladosRequest): Observable<any> {
    return this.apiBase.post(`${ this.url }/buscarCasosAnulados`, request);
  }

  registrarCasoLeido(request: CasoLeidoRequest): Observable<any> {
     return this.apiBase.post(
      `${this.url}/leido`,
      request
    );
  }
  obtenerListaCasos(fechaDesde:string, fechaHasta:string,idPlazo:string,idOrigen:string): Observable<any> {
    return this.apiBase.get(`${this.url}/?fechadesde=${fechaDesde}&fechahasta=${fechaHasta}&idPlazo=${idPlazo}&idOrigen=${idOrigen}`);
  }

  recepcionarCasos(request: CasoIdRequest[]): Observable<any> {
    return this.apiBase.post(`${ this.url }/`, request);
  }

  /* Obtener cantidad total por recepcionar */
  private contadorSource = new BehaviorSubject<number>(-1);
  contadorActual = this.contadorSource.asObservable();

  cambiarContador(contador: number) {
    this.contadorSource.next(contador);
  }
  /* Obtener cantidad total por recepcionar */


}
