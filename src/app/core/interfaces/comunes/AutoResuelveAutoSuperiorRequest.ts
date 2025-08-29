export interface AutoResuelveAutoSuperiorRequest {
  idActoTramiteCaso?: string,
  fechaNotificacion?: string,
  flAgenda?: string
  observaciones?: string
  fechaAudiencia?: string
  idTipoReunion?: string
  urlReunion?: string
  idDistritoJudicial?: string
  idEntidad?: string
  lugar?: string
  listSujetos: ListaSujetosAuto[]
}
export interface ListaSujetosAuto{
  idSujetoCaso: string,
  tipoSujeto: string,
  idTipoRespuestaResolucionInstancia2: number
}
