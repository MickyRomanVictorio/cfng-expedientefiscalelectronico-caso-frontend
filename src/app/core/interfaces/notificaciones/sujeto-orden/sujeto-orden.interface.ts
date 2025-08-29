export interface SujetoPorOrden {
    idSujeto: string,
    nombreSujeto: string,
    tipoSujeto: string,
    tipoUrgencia: string,
    direccionesSujeto: CedulaPorSujetoEnOrden[],
}

export interface CedulaPorSujetoEnOrden {
    idCedula: string,
    idCaso: string,
    idDireccion: string,
    fechaEmisionCedula: string,
    numeroCedula: string,
    numeroCaso: string,
    tipoDomicilio: string,
    direccion: string,
    estadoCedula: string,
    medioNotificacion: string,
    tieneCargo: boolean,
}