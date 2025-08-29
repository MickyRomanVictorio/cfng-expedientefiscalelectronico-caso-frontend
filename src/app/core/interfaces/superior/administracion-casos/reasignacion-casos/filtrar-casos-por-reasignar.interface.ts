export interface FiltrarCasosPorReasignar {
    tipoElevacion: number,
    idFiscalAsignado: string | null,
    busqueda: string
    fechaInicioAsignacion: Date | null,
    fechaFinAsignacion: Date | null,
    tipoAsignacion: number,
}
