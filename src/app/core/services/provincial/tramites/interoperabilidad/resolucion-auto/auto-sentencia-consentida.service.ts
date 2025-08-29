import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AutoSentenciaConsentidaService {
    constructor(private readonly apiBase: ApiBaseService) { }

    urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/sentencia/consentida/`


    listarSujetosDelitosSentenciados(idCaso: string, idSujetoCaso: string, idDelitoSujeto: string): Observable<any> {
        return this.apiBase.get(
            `${this.urlTramite}listarsujetosdelitossentenciados/${idCaso}/${idSujetoCaso}/${idDelitoSujeto}`
        );
    }

    guardarTramite(idActoTramiteCaso: string, datos: any): Observable<any> {
        return this.apiBase.post(
            `${this.urlTramite}guardar/${idActoTramiteCaso}`,
            datos
        );
    }

    obtenerDatosTramite(idActoTramiteCaso: string): Observable<any> {
        return this.apiBase.get(
            `${this.urlTramite}obtenerdatostramite/${idActoTramiteCaso}`
        );
    }
   validarSujetosSentenciasConsentidas(idActoTramiteCaso: string, datos: any): Observable<any> {
        return this.apiBase.post(
            `${this.urlTramite}validarsujetosconsentidas/${idActoTramiteCaso}`,
            datos
        );
    }
}