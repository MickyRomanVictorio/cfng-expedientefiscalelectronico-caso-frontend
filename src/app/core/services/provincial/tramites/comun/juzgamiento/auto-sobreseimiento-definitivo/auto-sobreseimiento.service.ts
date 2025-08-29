import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoSobreseimientoDefinitivoService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/juzgamiento`

  constructor(
    private http: HttpClient
  ) {
  }

  guardarFormulario(data: any): Observable<any> {
    return this.http.post(`${this.url}/autosobreseimiento`, data)
  }

  obtenerDatosFormulario(idActoTramiteCaso: string): Observable<any> {
    return this.http.get(`${this.url}/autosobreseimiento/${idActoTramiteCaso}`)
  }

  obtenerMensajeConsentido(idActoTramiteCaso: string): Observable<any> {
    return this.http.get(`${this.url}/autosobreseimiento/${idActoTramiteCaso}/validar`)
  }

  agregarEliminarSujetosDelitos(idActoTramiteCaso: string, data: any): Observable<any> {
    return this.http.post(`${this.url}/autosobreseimiento/${idActoTramiteCaso}/sujetosdelitos`, data)
  }

  obternerListaSujetosProcesales(
    idCaso: string,
    idTipoSujeto: number,
    idActoTramiteCaso: string
  ): Observable<any> {
    return this.http.get(`${this.url}/autosobreseimiento/listarsujetosprocesales?idCaso=${idCaso}&idActoTramiteCaso=${idActoTramiteCaso}&idTipoSujeto=${idTipoSujeto}`);
  }

  obternerListaSujetoDelitoDispo(
    idCaso: string,
    idActoTramiteCaso: string = ''
  ): Observable<any> {
    return this.http.get(`${this.url}/disposicionresuelve/listarsujetosdelitos?idCaso=${idCaso}&idActoTramiteCaso=${idActoTramiteCaso}`);
  }

  registrarDisposicion(data: any): Observable<any> {
    return this.http.post(`${this.url}/retiroacusacion/disposicion`, data);
  }

  obtenerDatosDisposicion(idActoTramiteCaso: string): Observable<any> {
    return this.http.get(`${this.url}/retiroacusacion/disposicion/${idActoTramiteCaso}`)
  }
}
