export interface ReasignarCasoRequest {
    idFiscal: number | null,
    casos: CasoPorReasignar[],
    tipoAsignacion: string,
    motivoReasignacion?: string,
    fechaInicioReasignacionTemporal?: Date | null;
    fechaFinReasignacionTemporal?: Date | null,
    archivoPorSubir?: string,
    archivoNombre?: string,
}

interface CasoPorReasignar {
    idCaso: string,
    numeroCaso: string,
}