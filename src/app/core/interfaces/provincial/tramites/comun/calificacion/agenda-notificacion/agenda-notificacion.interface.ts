export interface AgendaNotificacion {
    idCaso?: string,
    idActoTramiteCaso?: string,
    observacion?: string,
    urlReunion?: string,
    idDistritoJudicial?: number,
    idJuzgado?: number,
    idTipoActividadAgenda?: number,
    fechaNotificacion?: Date,
    fechaAudiencia?: Date,
}