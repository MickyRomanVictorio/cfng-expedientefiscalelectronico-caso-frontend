export interface DatosPronunciamiento {
    idActoTramiteCaso: string;
    tipoResultado: number;
    consecuencias: number;
    seOrdena: string;
    excluirFiscal: string;
    flgResponder?: string;
    idNode?: string;
    nombreFiscalia?: string;
    fiscalPronuncimiento?: string;
    idJerarquia?: number;
    observacionProvincial?: string;
    numeroCaso?: string;
    fechaDisposicion?: Date;
    nombreFiscalProvincial?: string;
}
export interface DatosObservado{
    aceptar: boolean;
    datos: DatosObs;
}
export interface DatosObs{
    observacion: string;
}
