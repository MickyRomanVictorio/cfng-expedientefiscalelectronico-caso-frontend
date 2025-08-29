import { Injectable } from '@angular/core';
import { BACKEND } from "@environments/environment";
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { TrabajoSujetoProcesalRequest } from "@core/interfaces/reusables/sujeto-procesal/TrabajoSujetoProcesalRequest";
import { EstudioSujetoProcesalRequest } from "@core/interfaces/reusables/sujeto-procesal/EstudioSujetoProcesalRequest";
import { SujetosProcesales } from '@core/interfaces/comunes/SujetosProcesales';

@Injectable({ providedIn: 'root' })
export class ReusablesSujetoProcesalService {
  private urlSujetosProcesales = `${BACKEND.CFE_EFE_SUJETOS}/v1/e`;
  private urlGestionFormacionProfesional = `${BACKEND.CFE_EFE_SUJETOS}/v1/e/gestionarinformacionprofesional`;
  private urlSUNAT = `${BACKEND.CFEPERSONA}/v1/e/padronsunat`;

  constructor(private apiBase: ApiBaseService) { }

  public getListaSujetoProcesal(idCaso: string): Observable<SujetosProcesales[]> {
    return this.apiBase.get(`${this.urlSujetosProcesales}/listasujetoprocesal?idCaso=${idCaso}`);
  }

  public validarPorFiscal(idSujetoProcesal: string): Observable<any> {
    return this.apiBase.get(`${this.urlSujetosProcesales}/validafiscal/${idSujetoProcesal}`);
  }

  public eliminarSujetoProcesal(idSujetoProcesal: string): Observable<any> {
    return this.apiBase.delete(`${this.urlSujetosProcesales}/eliminasujetoprocesal/${idSujetoProcesal}`);
  }

  public consultarRUCServicioExterno(numeroRuc: number): Observable<any> {
    return this.apiBase.get(`${this.urlSUNAT}/${numeroRuc}`)
  }

  public consultarRUC(numeroRuc: number): Observable<any> {
    return this.apiBase.get(`${this.urlGestionFormacionProfesional}/consultaruc?numeroRuc=${numeroRuc}`)
  }

  public getListaTrabajoSujetoProcesal(idSujetoCaso: string): Observable<any> {
    return this.apiBase.get(`${this.urlGestionFormacionProfesional}/listatrabajosujetoprocesal?idSujetoCaso=${idSujetoCaso}`);
  }

  public registrarTrabajoSujetoProcesal(request: TrabajoSujetoProcesalRequest): Observable<any> {
    return this.apiBase.post(`${this.urlGestionFormacionProfesional}/registratrabajosujetoprocesal`, request);
  }

  public eliminarTrabajoSujetoProcesal(idSujetoCentroTrabajo: string): Observable<any> {
    return this.apiBase.delete(`${this.urlGestionFormacionProfesional}/eliminatrabajosujetoprocesal/${idSujetoCentroTrabajo}`);
  }

  public getListaTrabajoSujetoProcesalPorId(idTrabajoSujetoProcesal: string): Observable<any> {
    return this.apiBase.get(`${this.urlGestionFormacionProfesional}/listatrabajosujetoprocesalporid?idTrabajoSujetoProcesal=${idTrabajoSujetoProcesal}`);
  }

  public actualizarTrabajoSujetoProcesal(request: TrabajoSujetoProcesalRequest): Observable<any> {
    return this.apiBase.put(`${this.urlGestionFormacionProfesional}/actualizatrabajosujetoprocesal`, request);
  }

  public getListaEstudioSujetoProcesal(idSujetoCaso: string): Observable<any> {
    return this.apiBase.get(`${this.urlGestionFormacionProfesional}/listaestudiosujetoprocesal?idSujetoCaso=${idSujetoCaso}`);
  }

  public registrarEstudioSujetoProcesal(request: EstudioSujetoProcesalRequest): Observable<any> {
    return this.apiBase.post(`${this.urlGestionFormacionProfesional}/registraestudiosujetoprocesal`, request);
  }

  public eliminarEstudioSujetoProcesal(idSujetoEstudio: string): Observable<any> {
    return this.apiBase.delete(`${this.urlGestionFormacionProfesional}/eliminaestudiosujetoprocesal/${idSujetoEstudio}`);
  }

  public getListaEstudioSujetoProcesalPorId(idEstudioSujetoProcesal: string): Observable<any> {
    return this.apiBase.get(`${this.urlGestionFormacionProfesional}/listaestudiosujetoprocesalporid?idEstudioSujetoProcesal=${idEstudioSujetoProcesal}`);
  }

  public actualizarEstudioSujetoProcesal(request: EstudioSujetoProcesalRequest): Observable<any> {
    return this.apiBase.put(`${this.urlGestionFormacionProfesional}/actualizaestudiosujetoprocesal`, request);
  }

  public consultarAsociacionSujetosProcesalesConDelitos(idSujetoCaso: string): Observable<AsociacionSujetoConDelitos> {
    return this.apiBase.get(
      `${this.urlSujetosProcesales}/validaeliminasujetoprocesal/${idSujetoCaso}`
    );
  }

  public consultarAsociacionDelitoSujetosProcesalesConDelitos(idSujetoCaso: string, idDelitoSujeto: string): Observable<AsociacionSujetoConDelitos> {
    return this.apiBase.get(
      `${this.urlSujetosProcesales}/validaeliminadelitosujetoprocesal/${idSujetoCaso}/${idDelitoSujeto}`
    );
  }
}


export interface AsociacionSujetoConDelitos {
  coValidacion: string;
  noValidacion: string;
}
