import {Injectable} from '@angular/core';
import {BACKEND} from '@environments/environment';
import {ApiBaseService} from "@core/services/shared/api.base.service";
import {Observable} from 'rxjs';
import { ActoProcesalBase } from '@interfaces/reusables/acto-procesal/acto-procesal.interface';
import { TramiteProcesal } from '@interfaces/comunes/tramiteProcesal';

@Injectable({
  providedIn: 'root'
})
export class ListarCasosConsultaService {

  urlConsultas = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`

  constructor(
    private readonly apiBase: ApiBaseService,
  ) {
  }

  obtenerActosProcesales(idCaso: string, idActoTramiteEnlace: string = ''): Observable<ActoProcesalBase[]> {
    return this.apiBase.get(
      `${this.urlConsultas}/${idCaso}/actosprocesales${ idActoTramiteEnlace ? '/' + idActoTramiteEnlace : ''}`
    );
  }

  obtenerTramitesProcesales(idCaso: string, idActoProcesal: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlConsultas}/${idCaso}/actoprocesal/${idActoProcesal}/tramites`
    );
  }

  obtenerTramitesProcesalesV2(idCaso: string, idActoProcesal: string, idActoTramiteEnlace: string = ''): Observable<TramiteProcesal[]> {
    return this.apiBase.get(
      `${this.urlConsultas}/${idCaso}/actoprocesal/${idActoProcesal}/tramites${ idActoTramiteEnlace ? '/' + idActoTramiteEnlace : ''}/v2`
    );
  }

}
