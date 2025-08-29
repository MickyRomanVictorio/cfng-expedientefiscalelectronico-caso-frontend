export interface DocumentoTramite {
    id: number,
    documento: string,
    etapa: string,
    actoProcesal: string,
    cuadernoIncidental?: string,
    seleccionado?: boolean,
    plazo?: string,
    fechaFin?: Date,
}