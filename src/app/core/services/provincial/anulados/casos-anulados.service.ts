import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable, map } from 'rxjs';
import { BuscarCasosAnuladosRequest } from '@core/interfaces/provincial/administracion-casos/anulados/BuscarCasosAnuladosRequest';
import { CasoAnuladoRequest } from '@core/interfaces/provincial/administracion-casos/anulados/CasoAnuladoRequest';

@Injectable({
  providedIn: 'root'
})
export class CasosAnuladosService {

  urlCasosAnulados = `${BACKEND.CFE_EFE}/v1/e/caso/anulado`

  constructor( private apiBase: ApiBaseService ) { }

  getCasosAnulados(request : BuscarCasosAnuladosRequest): Observable<any> {
    let fechaDesde = request.fechaDesde;
    let fechaHasta = request.fechaHasta;
    let filtroTiempo = request.filtroTiempo;
    if (typeof fechaDesde == "undefined") fechaDesde = "";
    if (typeof fechaHasta == "undefined") fechaHasta = "";
    if (typeof filtroTiempo == "undefined") filtroTiempo = 0;
    //return mock(CASOS_ANULADOS)
    return this.apiBase.get(
      `${ this.urlCasosAnulados }?feInicio=${fechaDesde}&feFinal=${fechaHasta}&filtroTiempo=${filtroTiempo}`
    );
  }

  registrarCasoAnuladoLeido(request : CasoAnuladoRequest): Observable<any> {
    return this.apiBase.post(
      `${ this.urlCasosAnulados }/leido`, request);
  }

  anularCaso( idCaso: string, motivo: string ): Observable<any> {
    return this.apiBase.post(
      `${ this.urlCasosAnulados }/${ idCaso }`,
      { motivo }
    );
  }


}
