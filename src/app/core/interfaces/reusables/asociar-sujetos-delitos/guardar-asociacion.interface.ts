export interface GuardarAsociacion {
    idActoTramiteCaso: string,
    sujetos: SujetoAsociado[]
}

export interface SujetoAsociado {
    idSujetoCaso: string,
    delitos:      DelitoPorAsociar[],
}

export interface DelitoPorAsociar {
    idDelitoGenerico: number,
    idDelitoSubgenerico: number,
    idDelitoEspecifico: number,
}