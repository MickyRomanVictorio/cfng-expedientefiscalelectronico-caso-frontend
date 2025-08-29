

export enum TipoVista {
    Grilla = 1,
    Tabla = 2,
}

export enum TipoExportar {
    Excel = 1,
    Pdf = 2,
}

export enum TipoResultado {
    Cerrar = 0,
    Exito = 1,
    Error = 2,
}

export interface CuadernoIncidental {
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
    horaCreacion: string
    idActoTramiteCasoUltimo: string | null
    ultimoTramite: string | null
    numeroCuaderno: string
    flagConcluido: boolean | null
    flagApelacion: string
    flagQueja: string
    entidad: string
    sujetosProcesales: SujetosProcesales[]
    pestaniaApelacion: PestaniaApelacion[]
    pestaniaApelacionMostrar: boolean
}

export interface PestaniaApelacion {
    nombre: string
    cantidad: number
}

export interface SujetosProcesales {
    item: number
    nombreCompleto: string
    nombreCorto: string
}

export interface FormularioFiltro {
    fechaFinal: string
    fechaInicial: string
    idCasoPadre?: string
    idTipoClasificadorExpediente: string | null
}

export enum TipoAlerta{
    Ninguno = 0,
    Apelacion = 1,
    Queja = 2
}

export interface CuadernoIncidentalAlertaFecha {
    cuadernoIncidental:CuadernoIncidental,
    tipoAlerta: TipoAlerta
}

export interface CuadernoIncidentalFiltro {
    idCasoPadre?: string
    ultimos6meses: string | null,
    busquedaTexto: string,
    fechaRegistroIncidenteInicio?: string,
    fechaRegistroIncidenteFin?: string,
    idTipoCuaderno?: number,
    page: number,
    perPage: number,
}