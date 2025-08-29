import * as CONSTANTE from '@core/interfaces/provincial/administracion-casos/sujetos/informaciongeneralsujeto/tipo-sujeto-procesal.type';

import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import {catchError, filter, map, Observable, Subject, throwError, timeout} from 'rxjs';
import { TokenService } from "@core/services/shared/token.service";
import { InformacionGeneralSujetoApi } from '@core/interfaces/provincial/administracion-casos/sujetos/informaciongeneralsujeto/InformacionGeneralSujetoResponse';
import { HttpClient } from '@angular/common/http';
import { ListItemResponse } from '@core/types/mesa-turno/response/Response';
import { TIPO_ORIGEN } from '@core/types/tipo-origen.type';

@Injectable({ providedIn: 'root' })
export class SujetoGeneralService {
    private urlSujetoConsultas = `${BACKEND.CFE_EFE_SUJETOS}/v1/e/gestionarinformaciongeneral`
    private stepp = new Subject<any>();

    stepp$ = this.stepp.asObservable();

    constructor(
        // private http: HttpClient,
        private apiBase: ApiBaseService,
        private tokenservice: TokenService,
    ) { }

    public getUserSession() {
        return this.tokenservice.getDecoded()
    }

    //stepper de registro sujeto procesal
    public invocarStep(idSujetoCaso: any) {
        this.stepp.next(idSujetoCaso);
    }

    //#region "API SUJETO PROCESAL"
    public obtenerInformacionGeneral(idSujetoCaso: string): Observable<any> {//getCaso(id:string)
        return this.apiBase.get(
            `${this.urlSujetoConsultas}/${idSujetoCaso}`
        );
    }

    public agregarInformacionGeneral(request: InformacionGeneralSujetoApi): Observable<any> {//saveSujeto(data: any):
        return this.apiBase.post(
            `${this.urlSujetoConsultas}/agregar`, request
        );
    }

    public editarInformacionGeneral(request: InformacionGeneralSujetoApi): Observable<any> {
        return this.apiBase.put(
            `${this.urlSujetoConsultas}/modificar`, request
        );
    }
    //#endregion

    //#region "API MAESTROS"
    public obtenerListaCompletaTurno(): ListItemResponse[] {
        return CONSTANTE.LISTA_CONDICION_TURNO;
    }

    public obtenerTurnoPorIdEquivalente(idEquivalente: number): ListItemResponse | undefined {
        console.log('TIPO_ORIGEN.TURNO --> ', CONSTANTE.LISTA_CONDICION_TURNO.find(item => item.idEquivalente === idEquivalente));
        return CONSTANTE.LISTA_CONDICION_TURNO.find(item => item.idEquivalente === idEquivalente);
    }

    public getCondicionMesas(idTipoMesa: string, idTipoParteSujeto: any,
        idTipoPersona: number, idTipoNacionalidad: number): ListItemResponse[] | null {
        console.log('idTipoMesa --> ', idTipoMesa);
        console.log('idTipoParteSujeto --> ', idTipoParteSujeto);
        console.log('idTipoParteSujeto id --> ', idTipoParteSujeto.id);
        if (TIPO_ORIGEN.EFE == idTipoMesa) {
            console.log('TIPO_ORIGEN.EFE --> ', CONSTANTE.LISTA_CONDICION_EFE);
            return CONSTANTE.LISTA_CONDICION_EFE;
        } else if (TIPO_ORIGEN.TURNO == idTipoMesa) {
            const turno = this.obtenerTurnoPorIdEquivalente(idTipoParteSujeto.id);
            console.log('TIPO_ORIGEN.TURNO --> ', idTipoParteSujeto.id);

            return turno ? [turno] : null;
        } else {
            return null;
        }
    }

    public getCondicionSujeto(notipoorigen: string, idTipoParte: string) {
        return this.apiBase.get(
            `${BACKEND.CFEMAESTROS}v1/cftm/e/sujeto/condicion/${notipoorigen}/${idTipoParte}`
        );
    }

    public getSexos() {
        return this.apiBase.get(
            `${BACKEND.CFEMAESTROS}v1/cftm/e/genero`
        );
    }

    public getEstadoCivil() {
        return this.apiBase.get(
            `${BACKEND.CFEMAESTROS}v1/cftm/e/estadocivil`
        );
    }

    public getInstruccion() {
        return this.apiBase.get(
            `${BACKEND.CFEMAESTROS}v1/cftm/e/gradoinstruccion`
        );
    }

    public getActoProcesal(id: any) {
        return this.apiBase.get(
            `${BACKEND.CFEMAESTROS}v1/eftm/e/actoprocesal/${id}`
        );
    }

    public getPaises() {
        return this.apiBase.get(
            `${BACKEND.CFEMAESTROS}v1/cftm/e/nacionalidad`
        );
    }

    // public getTipoSujetoProcesal(idTipoMesa: string): Observable<ApiTipoSujetoResponse> {
    //     return this.apiBase
    //         .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipopartesujeto/${idTipoMesa}`);
    // }

    public getTipoSujetoProcesal(idTipoMesa: string): Observable<ITipoSujetoModel[]> {
        return this.apiBase.getWithInterface<IApiTipoSujetoResponse>
            (`${BACKEND.CFEMAESTROS}v1/cftm/e/tipopartesujeto/${idTipoMesa}`)
            .pipe(
                filter(response => { return response.code === 200 }),
                map(response => { return (response.data || []) })
            );
    }

    // public getPersonaOrigen(notipoorigen: string, idTipoParte: string): Observable<ApiTipoSujetoResponse> {
    //     return this.apiBase
    //         .get(`${BACKEND.CFEMAESTROS}v1/cftm/e/tipopersonapororigenparte/${idTipoParte}/${notipoorigen}`);
    // }

    public getPersonaOrigen(notipoorigen: string, idTipoParte: string): Observable<ITipoPersonaModel[]> {
        const aa = this.apiBase.getWithInterface<IApiTipoPersonaResponse>
            (`${BACKEND.CFEMAESTROS}v1/cftm/e/tipopersonaSujeto/1`)
            .pipe(
                filter(response => { return response.code === 200 }),
                map(response => { return (response.data || []) })
            );

        return aa;
    }


    public getPersona(id: number) {
        return this.apiBase.get(
            //`${ BACKEND.CFEMAESTROS }v1/cftm/e/tipopersonaSujeto/${id}`
            `${BACKEND.CFEMAESTROS}v1/cftm/e/tipopersona`
        );
    }

    public getTipoDocumentoPersona(idTipoPersona: string): Observable<any> {
        return this.apiBase.get(
            `${BACKEND.CFEMAESTROS}v1/cftm/e/tipodocidentidad/${idTipoPersona}`
        );
    }

    public getTipoDocumentoPersonaNacionalidad(idTipoPersona: string, idNacionalidad: string): Observable<any> {
        return this.apiBase.get(
            `${BACKEND.CFEMAESTROS}v1/cftm/e/persona/tipopersona/${idTipoPersona}/${idNacionalidad}`
        );
    }

    public getProfesion() {
        return this.apiBase.get(
            `${BACKEND.CFEMAESTROS}v1/cftm/e/tipodocidentidad`
        );
    }

    public getProfesionOficio() {
        return this.apiBase.get(
            `${BACKEND.CFEMAESTROS}v1/cftm/e/actividadLaboral`
        );
    }

    public getCatalogo(noGrupo: string): Observable<any> {
        return this.apiBase.get(
            `${BACKEND.CFEMAESTROS}v1/cftm/e/catalogo/${noGrupo}`
        );
    }
    //#endregion

    //#region "API PERSONAS"
    public getRuc(numeroRuc: string): Observable<any> {
        return this.apiBase.get(
            `${BACKEND.CFEPERSONA}/v1/e/padronsunat/${numeroRuc}`
        );
    }

    public buscarJuridicaPorRazonSocial(razonSocial: string): Observable<any> {
        return this.apiBase.post(`${BACKEND.CFEPERSONA}/v1/e/padronsunat/`, { razonSocial })
    }

    public getConsultaReniec(dni: string): Observable<any> {
        let usuarioToken = this.getUserSession();
        const dataPeticion = {
            ip: '192.168.1.1',
            httpHost: 'cfe.mpfn.gob.pe',
            numeroDocumento: dni,
            usuarioConsulta: usuarioToken.usuario.usuario,
        };
      return this.apiBase.post(
        `${BACKEND.CFEPERSONA}/v1/e/personanatural/consulta/general`,
        dataPeticion
      ).pipe(
        timeout(3000),
        catchError(err => {
          if (err.name === 'TimeoutError') {
            return throwError(() => new Error('La consulta a RENIEC excedió el tiempo límite.'));
          }
          return throwError(() => err);
        })
      );
    }
    //#endregion
}



export interface IApiGenerico<T> {
    code: number;
    message: string;
    data: T;
}

// **************
export interface ITipoSujetoModel {
    id: number;
    nombre: string;
}

export type IApiTipoSujetoResponse = IApiGenerico<ITipoSujetoModel[]>;

// **************
export interface ITipoPersonaModel {
    id: number;
    nombre: string;
}

export type IApiTipoPersonaResponse = IApiGenerico<ITipoPersonaModel[]>;


// **************
export interface ITipoViaModel {
    id: number;
    nombre: string;
    codReniec: string;
}

export type IApiTipoViaResponse = IApiGenerico<ITipoViaModel[]>;


// **************
export interface ITipoPuebloModel {
    id: number;
    nombre: string;
}

export type IApiTipoPuebloResponse = IApiGenerico<ITipoPuebloModel[]>;

// **************
export interface ITipoLenguaModel {
    id: number;
    nombre: string;
}

export type IApiTipoLenguaResponse = IApiGenerico<ITipoLenguaModel[]>;

// **************
export interface ITipoParentescoModel {
    id: number;
    nombre: string;
}

export type IApiTipoParentescoResponse = IApiGenerico<ITipoParentescoModel[]>;

// **************
export interface ITipoDocIdentidadModel {
    id: number;
    nombre: string;
}

export type IApiTipoDocIdentidadResponse = IApiGenerico<ITipoDocIdentidadModel[]>;

// **************
export interface ITipoCatalogoModel {
    id: number;
    coDescripcion: string;
    noDescripcion: string;
}

export type IApiTipoCatalogoResponse = IApiGenerico<ITipoCatalogoModel[]>;
