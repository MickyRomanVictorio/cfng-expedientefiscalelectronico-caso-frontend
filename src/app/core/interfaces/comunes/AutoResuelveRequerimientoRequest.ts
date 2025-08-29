export interface AutoResuelveRequest {
  operacion: number,
  idCaso?: string,
  idActoTramiteCaso?: string,
  idActoTramiteEstado?: string,
  fechaNotificacion?: string,
  observacion?: string
  listSujetos: any
}
