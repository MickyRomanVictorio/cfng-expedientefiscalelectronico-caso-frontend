export interface AgendaNotificacionInterface {
  idRegistroTabla: string,
  idAgendaFiscal: string,
  fechaNotificacion: string,
  fechaHoraAudicencia: string,
  idTipoActividadAgenda: number,
  tipoActividadAgenda: string,
  urlReunion: string,
  idDistritoPJ: number,
  idJuzgadoPJ: string,
  observacion: string,
  idCaso: string,
  idActoTramiteCaso: string,
  estadoAgendaFiscal: string,
   idEstadoRegistro?: number,
}


