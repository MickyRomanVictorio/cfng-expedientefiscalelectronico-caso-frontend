export interface CuadernoEjecucionFiltro {
    idCasoPadre?: string
    ultimos6meses: string | null,
    busquedaTexto: string,
    fechaNotificacionInicio?: string,
    fechaNotificacionFin?: string,
    idTipoCuaderno?: number,
    page: number,
    perPage: number,
}

export interface CuadernoEjecucion {
    idCaso: string
    codigoCaso: string
    anioCaso: string
    numeroCaso: string
    secuencia: string
    clasificadorExpediente: string
    idTipoClasificadorExpediente: string
    tipoClasificadorExpediente: string
    etapa: string
    fechaCreacion: string
    idActoTramiteCasoUltimo: string | null
    ultimoTramite: string | null
    flagConcluido: boolean | null
    entidad: string
    sujetoProcesal: string
    delito: string
    fechaNotificacion: string
    actoProcesalEjecucion: string
    descripcionSentencia: string
    idActoTramiteDelitoSujeto: string
    numeroClasesPenas: number
    clasePena: string
    tiposPenas: string
    numeroReparacionCivil: number
    tipoRcExclusiva: string
    montoRcExclusiva: number
    idTipoSentencia: number;
}
export interface PenasCuadernoEjecucion {
    clasePena: string;
    tipoPena: string;
}
export interface ReparacionesCivilesCuadernoEjecucion {
    codigo:string;
    tipo:string;
    tipoPago:string;
    monto:number;
}
export enum TipoVista {
    Grilla = 1,
    Tabla = 2,
}

export enum TipoExportar {
    Excel = 1,
    Pdf = 2,
}