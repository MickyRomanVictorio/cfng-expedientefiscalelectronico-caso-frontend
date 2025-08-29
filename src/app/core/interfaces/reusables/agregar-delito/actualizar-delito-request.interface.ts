export interface ActualizarDelitosRequest {
    numeroCaso: string,
    numeroSujetoCaso: string,
    delitos: DelitoPorActualizar[]
}

export interface DelitoPorActualizar{
    articulo: string,
    idDelitoGenerico: number,
    delitoGenerico: string,
    idDelitoSubgenerico: number,
    delitoSubgenerico: string,
    idDelitoEspecifico: number,
    delitoEspecifico: string,
    esDelitoSujeto: string,
}
