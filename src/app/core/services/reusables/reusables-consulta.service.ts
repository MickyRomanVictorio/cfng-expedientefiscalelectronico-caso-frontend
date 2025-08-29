import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { Cuadernos } from '@core/interfaces/reusables/delitos-y-partes/delitos-y-partes.interface';


@Injectable({ providedIn: 'root' })
export class ReusablesConsultaService {

  urlReusables = `${BACKEND.CFE_EFE}/v1/e`
  urlSujetos = `${BACKEND.CFE_EFE_SUJETOS}/v1/e`

  constructor(private apiBase: ApiBaseService) { }

  obtenerDelitosYPartes(numeroCaso: string): Observable<any> {
    //return mock(DELITOS_Y_PARTES)
    return this.apiBase.get(
      `${this.urlReusables}/caso/reusable/delitosypartes/${numeroCaso}`
    );
  }

  obtenerDelitosParaTipificar(numeroCaso: string): Observable<any> {
    console.log('numeroCaso', numeroCaso)
    //return mock(LISTAR_DELITOS_PARA_TIPIFICAR)
    return this.apiBase.get(
      `${this.urlReusables}/caso/reusable/agregardelitos/delitos`
    );
  }

  obtenerHechosCaso(numeroCaso: string): Observable<any> {
    //return mock(OBTENER_INFO_CASO);
    return this.apiBase.get(
      `${this.urlReusables}/caso/asunto/${numeroCaso}`
    );
  }

  obtenerCuadernos(idSujetoCaso: string): Observable<Cuadernos[]> {
    return this.apiBase.get(
      `${this.urlSujetos}/listarcuadernosujetoprocesal/${idSujetoCaso}`
    );
  }
}
