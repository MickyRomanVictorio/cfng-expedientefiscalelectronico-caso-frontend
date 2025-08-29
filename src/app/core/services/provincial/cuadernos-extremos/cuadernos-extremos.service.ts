import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { CasoFiscal, CasoFiscalResponse } from '@core/interfaces/comunes/casosFiscales';
import { CrearCuadernoExtremo } from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/cuadernos-extremos.interface';

@Injectable({
  providedIn: 'root'
})
export class CuadernosExtremosService {
  urlCuaderno = `${BACKEND.CFE_EFE_CUADERNO}/v1/e/cuadernos-extremos`

  constructor(
    private readonly apiBase: ApiBaseService
  ) { }

  listarSujetosProcesales(idCasoPadre:string,idCaso:string | null = null,idSujetoCaso:string | null = null): Observable<any> {
    let param:string = "";

    if(idCaso)
      param =  `?idCaso=${idCaso}`

    if(idSujetoCaso)
      param =  `${param}&idSujetoCaso=${idSujetoCaso}`

    return this.apiBase.get(
      `${this.urlCuaderno}/lista/sujetos-procesales/${idCasoPadre}${param}`
    )
  }
  listarCuadernosExtremos(request: any): Observable<CasoFiscalResponse<CasoFiscal[]>> {
    return this.apiBase.post(`${this.urlCuaderno}/lista`,request);
  }
  crearCuadernoExtremos(request: CrearCuadernoExtremo): Observable<any> {
    return this.apiBase.post(
      `${this.urlCuaderno}/crear`, request
    );
  }
  validarDelitosCuadernoExtremos(request: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlCuaderno}/validar-delitos-cuaderno-extremos`, request
    );
  }

  eliminarCuadernoExtremo(idCaso: string ): Observable<any> {
    return this.apiBase.delete(
      `${this.urlCuaderno}/eliminar/${idCaso}`
    );
  }

  listarSujetosProcesalesExtremo(
    idCaso: string,
    idTipoSujeto: number
  ): Observable<any> {
    return this.apiBase.get(
      `${this.urlCuaderno}/listar-sujetos-procesales-extremo?idCaso=${idCaso}&idTipoSujeto=${idTipoSujeto}`
    );
  }

  eliminarSujetoExtremo(idSujetoCaso:string): Observable<any> {
    return this.apiBase.delete(
      `${this.urlCuaderno}/eliminar/sujeto-procesal/${idSujetoCaso}`
    );
  }
  editarSujetosExtremo(request: CrearCuadernoExtremo): Observable<any> {
    return this.apiBase.post(
      `${this.urlCuaderno}/editar/sujetos`, request
    );
  }
  editarDelitosSujetosExtremo(request: CrearCuadernoExtremo): Observable<any> {
    return this.apiBase.post(
      `${this.urlCuaderno}/editar/sujetos/delitos`, request
    );
  }
}

