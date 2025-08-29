export interface SujetoAsociado {
    numero:               number,
    idSujetoCaso:         string,
    idTipoPersona:        number,
    tipoDocumento:        string,
    numeroDocumento:      string,
    nombreSujeto:         string,
    idTipoParteSujeto:    number,
    tipoParteSujeto:      string,
    seleccionado:         boolean,
    idCuadernoSujetoCaso: string,
    delitos:              DelitoAsociado[],
    delitosSeleccionados:  DelitoAsociado[],
}

export interface DelitoAsociado {
    idDelitoSujeto:      string,
    delito:              string,
    articulo:            string,
    idDelitoGenerico:    number,
    idDelitoSubgenerico: number,
    idDelitoEspecifico:  number,
    seleccionado:        boolean,
    existeExtremo:       boolean,
    cuadernosExistentes: string[],
}