import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class EnviadosAceptadosService {

    url = `${BACKEND.CFEMAESTROS}v1/cftm/e`
    url2 = `${BACKEND.CFEMAESTROS}v1/eftm/e`
    urlEnviadosAceptados = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e`

    constructor(
        private http: HttpClient
    ) { }


    obtenerAceptados(buscar: any, tipoFecha: any, desde: any, hasta: any): Observable<any> {
        return this.http.get(
            `${this.urlEnviadosAceptados}/aceptados/${buscar}/${tipoFecha}/${desde}/${hasta}`
        )
    }


    obtenerTipoEspecilidad(distritoFiscal: any, codigoEntidad: any): Observable<any> {
        return this.http.get(
            `${this.url}/tipoespecialidad/${distritoFiscal}/${codigoEntidad}`
        )
    }


    obtenerEspecilidad(distritoFiscal: any, codigoEntidad: any, tipoespecialidad: any): Observable<any> {
        return this.http.get(
            `${this.url}/especialidad/entidad/${distritoFiscal}/${codigoEntidad}/${tipoespecialidad}`
        )
    }
    obtenerDespachos(codigoEntidad: any): Observable<any> {
        return this.http.get(
            `${this.url}/despacho/entidad/${codigoEntidad}`
        )
    }

    obtenerDistritoFiscal(): Observable<any> {
        return this.http.get(`${this.url}/distritofiscal`);
    }

    obtenerFiscalias(distritoFiscal: any, tipoEspecialidad: any, especialidad: any): Observable<any> {
        return this.http.get(
            `${this.url2}/entidad/${distritoFiscal}/${tipoEspecialidad}/${especialidad}/0/0`
        )
    }

    actualizarDerivacion(request: any): Observable<any> {
        return this.http.put(
            `${this.urlEnviadosAceptados}/enviados/derivadoa/actualizarDerivacion`, request);
    }

}
