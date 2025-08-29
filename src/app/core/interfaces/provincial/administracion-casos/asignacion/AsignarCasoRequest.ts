export interface AsignarCasoRequest {
    idFiscal: number | null,
    casos: any,
    tipoAsignacion: string,
}


export interface CasoLeidoRequest {
    numeroCaso: String,
    idEstadoCaso: Number
}