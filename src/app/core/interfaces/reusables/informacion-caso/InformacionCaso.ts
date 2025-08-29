export interface InformacionCaso {
    numeroCaso: number;
    idCaso: string;
    tramite: string;
    nombreFiscal: string;
    delitos: string;
    ultimoActo: string;
    solicitud: string;
}


export interface HistorialCaso {
    actoProcesal: string;
    tramite: string;
    etapa: string;
    fechaEmision: string;
    fechaElaboracion: string;
    usuarioElaboracion: string;
    idDocumento: string
}


export interface HistorialDerivaciones {
    fiscaliaOrigen: string;
    fiscaliaDestino: string;
    fechaDerivacion: string;
    estado: string;
}