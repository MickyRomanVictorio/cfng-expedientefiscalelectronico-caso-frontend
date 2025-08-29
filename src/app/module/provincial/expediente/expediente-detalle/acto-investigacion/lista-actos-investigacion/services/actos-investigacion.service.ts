import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';
import { BusquedaFiltro, FormularioActoInvestigacion } from '../interfaces/formulario-acto-investigacion-interface';
// import {
//   FormularioActoInvestigacion,
//   BusquedaFiltro,
// } from '../lista-actos-investigacion.component';

@Injectable({
  providedIn: 'root',
})
export class ActosInvestigacionService {
  constructor(private apiBase: ApiBaseService) {}

  buscarActosInvestigacion(
    datos: FormularioActoInvestigacion
  ): Observable<any> {
    const body: BusquedaFiltro = {
      busqueda: datos.busqueda,
      fechaDesdeIngreso: datos.fechaDesdeIngreso,
      fechaHastaIngreso: datos.fechaHastaIngreso,
      sujetoProcesal: datos.sujetoProcesal,
      actoProcesal: datos.actoProcesal,
      clasificacion: datos.clasificacion,
      etapa: datos.etapa,
    };

    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/investigacion/${datos.idCaso}?page=${datos.page}&size=${datos.size}`,
      body
    );
  }

  obtenerActosProcesales(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/actos/01`);
  }

  obtenerEtapas(): Observable<any> {
    return this.apiBase.get(`${BACKEND.CFEMAESTROS}v1/eftm/e/etapas`);
  }

  obtenerActosDeInvestigacion(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFEMAESTROS}v1/cftm/e/catalogo/ID_N_TIPO_ELEM_CONVICCION`
    );
  }

  obtenerSujetosProcesales(idcaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/investigacion/${idcaso}/sujetosprocesales`
    );
  }

  obtenerElementosDeConviccion(id: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/investigacion/${id}/2`
    );
  }

  agregarElementoDeConviccion(
    idRespuesta: string,
    request: any
  ): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/investigacion`,
      request
    );
  }
}
