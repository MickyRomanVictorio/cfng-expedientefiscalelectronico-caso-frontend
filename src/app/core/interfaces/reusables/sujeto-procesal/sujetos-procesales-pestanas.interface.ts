export interface SujetosProcesalesPestanas {
  item: number,
  idSujetoCaso: string,
  tipoSujeto: string,
  nombreCompleto: string
  idTipoParteSujeto: number,
  noTipoParteSujeto: number,

  idTipoRespuestaInstancia1: number,
  noTipoRespuestaInstancia1: string,
  flConsentidoInstancia1: Boolean,

  idTipoRespuestaApelacion: number,
  noTipoRespuestaApelacion: string,
  flConsentidoApelacion: Boolean,

  idTipoRespuestaInstancia2: number,
  noTipoRespuestaInstancia2: string,
  flConsentidoInstancia2: Boolean,

  idTipoRespuestaQueja: number,
  noTipoRespuestaQueja: string,
  flConsentidoQueja: Boolean,

  idTipoRespuestaDesistimiento: number,
  noTipoRespuestaDesistimiento: string,

  flApelacion: string,
  flApelacionFiscal: Boolean,
  flAudienciaApelacion: Boolean,
  flAudienciaQueja: Boolean,

  selection: boolean,
  estadoQueja?: string,
  idPetitorioQueja?: number,
  flConcedeApelacion?: string,
  isConcedeApelacion?: boolean,
  sujetoSelected?: boolean,
}


