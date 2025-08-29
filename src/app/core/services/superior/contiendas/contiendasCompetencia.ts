import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { BuscarCasosElevacionActuadosRequest } from '@core/interfaces/provincial/tramites/elevacion-actuados/BuscarCasosElevacionActuadosRequest';
import {
  BuscarCasosPorAsignarRequest
} from "@interfaces/provincial/administracion-casos/asignacion/BuscarCasosPorAsignarRequest";
import {BuscarContiendasRequest} from "@interfaces/superior/contiendas/buscarContiendasRequest";
import {CasoLeidoRequest} from "@interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest";

@Injectable({
  providedIn: 'root'
})
export class ContiendasCompetenciaService {

  urlTransaccion: string = `${BACKEND.CFE_EFE}/v1/e/caso/bandejas/elevacionactuados`
  urlConsultaCasosSuperior= `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/caso/bandejas/elevacionactuados`;
  urlContiendasSuperior= `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/contiendas`;
  urlRegistrarLectura= `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/asignacionsuperior`;
  //urlContiendasSuperior= `http://localhost:8083/cfe/expedientefiscalelectronico/superior/v1/e/contiendas`;


  decodeToken: any;

  constructor( private apiBase: ApiBaseService ) { }


  contiendasCompetenciasList( request: BuscarContiendasRequest ): Observable<any> {
    let fechaDesde = request.fechaDesde
    let fechaHasta = request.fechaHasta
    let fiscalia = request.fiscalia ? request.fiscalia : ''
    let despacho = request.despacho ? request.despacho : ''
    let motivo = request.motivo ? request.motivo : ''
    let url = `${this.urlContiendasSuperior}/competencia?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&fiscaliaId=${fiscalia}&despachoId=${despacho}&motivo=${motivo}`;
    return this.apiBase.get( url );
  }


  contiendasCompetenciasObservadasList( request: BuscarContiendasRequest ): Observable<any> {
    let fechaDesde = request.fechaDesde
    let fechaHasta = request.fechaHasta
    let fiscalia = request.fiscalia ? request.fiscalia : ''
    let despacho = request.despacho ? request.despacho : ''
    let motivo = request.motivo ? request.motivo : ''
    let url = `${this.urlContiendasSuperior}/observadas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&fiscaliaId=${fiscalia}&despachoId=${despacho}&motivo=${motivo}`;
    return this.apiBase.get( url );
  }

  registrarCasoLeido(request: CasoLeidoRequest): Observable<any> {
    return this.apiBase.post(
      `${this.urlRegistrarLectura}/registrarlectura`,
      request
    );
  }

  obtenerCasosElevacionActuados( request: BuscarCasosElevacionActuadosRequest ): Observable<any> {
    let fechaDesde = request.fechaDesde;
    let fechaHasta = request.fechaHasta;
    //let plazo = request.plazo;
    let origen = request.origen;
    let fiscalia = request.fiscalia;
    let despacho = request.despacho;
    let remitente = request.remitente
    if (typeof fechaDesde == "undefined") fechaDesde = "";
    if (typeof fechaHasta == "undefined") fechaHasta = "";
    //if (typeof plazo == "undefined") plazo = 0;
    if (typeof origen == "undefined") origen = 0;
    if (typeof fiscalia == "undefined") fiscalia = 0;
    if (typeof despacho == "undefined") despacho = 0;
    if (typeof remitente == "undefined") remitente = "";


    let url = `${this.urlConsultaCasosSuperior}/listar?feInicio=${fechaDesde}&feFinal=${fechaHasta}&origen=${origen}&fiscalia=${fiscalia}&despacho=${despacho}&remitente=${remitente}&tiempo=0`;

    return this.apiBase.get(
      url
    );
  }

  getFiscalias(): Observable<any> {
    return this.apiBase.get(`${this.urlConsultaCasosSuperior}/fiscalias`);
  }

}
