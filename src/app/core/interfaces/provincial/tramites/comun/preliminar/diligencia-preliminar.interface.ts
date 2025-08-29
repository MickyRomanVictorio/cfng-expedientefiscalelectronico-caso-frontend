import { RegistrarPlazoRequest } from "../../../administracion-casos/gestion-plazo/GestionPlazoRequest";

export interface DiligenciaPreliminar {

  plazosRequest: RegistrarPlazoRequest,
  flCasoReservado: boolean,
  idCaso: string,
  idActoTramiteCaso: string,

}

export interface AmpliarPlazoRequest {
  idCaso: string,
  nroPlazo: string,
  idActoProcesal: string,
  idTramite: string,
  descripcionPlazo: string,
  idTipoUnidad: number,
  idTipoComplejidad: number,
  idTipoSedeInvestigacion: number,
}

export interface AmpliacionDiligenciaPreliminar {
  fechaInicioDiligencia?: string,
  fechaFinDiligencia?: string,
  formularioIncompleto: string,
  plazos: AmpliarPlazoRequest,
  flCasoReservado: boolean,
  idCaso: string,
  idActoTramiteCaso: string,
}

export interface DisposicionDeclararComplejo {
  fechaInicioDiligencia?: string,
  fechaFinDiligencia?: string,
  formularioIncompleto: string,
  plazos: AmpliarPlazoRequest,
  flCasoReservado: boolean,
  idCaso: string,
  idActoTramiteCaso: string,
}

export interface DisposicionProrrogaInvPreparatoria {
  fechaInicioDiligencia?: string,
  fechaFinDiligencia?: string,
  formularioIncompleto: string,
  plazos: AmpliarPlazoRequest,
  flCasoReservado: boolean,
  idCaso: string,
  idActoTramiteCaso: string,
}

export interface RequerimientoProrrogaInvPreparatoria {
  fechaInicioDiligencia?: string,
  fechaFinDiligencia?: string,
  formularioIncompleto: string,
  plazos: AmpliarPlazoRequest,
  flCasoReservado: boolean,
  idCaso: string,
  idActoTramiteCaso: string,
}

export interface ResolucionAutoResuelveRequerimientoProrrogaDTO {
  idCaso: string,
  fechaInicioDiligencia: string,
  fechaFinDiligencia: string,
  plazoRequerimientoDias: number,
  idRespuestaRequerimiento: number,
  respuestaProrroga: number,
  idUnidadMedidaRespuestaProrroga: number,
  fechaNotificacion: string,
  observaciones: string,
  conAudio: boolean,
  conVideo: boolean,
  idActoTramiteCaso?: string,
  plazos: AmpliarPlazoRequest,
}