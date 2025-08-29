
export interface RegistrarReparacionCivilRequest {
  idReparacionCivil:string | undefined | null;
  idActoTramiteCaso:string;
  idCaso:string;
  idSalidaAlterna:string | null;
  idTipoRepacionCivil:number | null;
  lstRegistroRepacionCivil:RegistrarReparacionCivilDetalleRequest[];
}export interface RegistrarReparacionCivilDetalleRequest {
  idActoTramiteDelitoSujeto:string | null;
  idTipoParticipante:number;
  idActoTramiteSujeto:string;
  idTipoParteSujeto:number;
  idSujetoCaso:string;
  idReparacionCivilDetalle:string | null;
  idTipoSentencia:number | null;
  idDelitoSujeto:string | null;
  seleccion:number;
}




