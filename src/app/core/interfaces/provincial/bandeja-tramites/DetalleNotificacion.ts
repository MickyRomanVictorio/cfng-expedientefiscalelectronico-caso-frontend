export interface DetalleNotificacion {
  idSujetoCaso: string,
  idCaso: string,
  idTipoParteSujeto: number,
  noTipoParteSujeto: string,
  noTipoDocIdentidad: string,
  numeroDocumento: string,
  nombreSujeto: string,
  direccion: string,
  tipoCedula: string,
  idEstadoCedula: number,
  noEstadoCedula: string,
  fechaNotificacion: string,
  horaNotificacion: string,
  idEstadoNotificacion: number,
  noEstadoNotificacion: string
}
