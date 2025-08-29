import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagoBajoApercibimientoRevocar } from '@core/interfaces/provincial/tramites/acta-acuerdo/pago-apercibimiento-revocar-principio';

@Injectable({
    providedIn: 'root'
})
export class ApercibimientoRevocarPrincipioOportunidadService {

    url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/intermedia`

    constructor(
        private http: HttpClient
    ) { }

    guardarApercibimientoRevocarPrincipioOportunidad(data: PagoBajoApercibimientoRevocar, idActoTramiteCaso: String): Observable<any> {
        return this.http.post(
            `${this.url}/${idActoTramiteCaso}/pagobajoapercibimientoderevocar`, data
        )
    }

    obtenerApercibimientoRevocarPrincipioOportunidad(idActoTramiteCaso: String): Observable<any> {
        return this.http.get(
            `${this.url}/${idActoTramiteCaso}/pagobajoapercibimientoderevocar`
        )
    }
}
