export interface SujetosProcesales {
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

  idTipoRespuestaQueja: number,
  noTipoRespuestaQueja: string,
  flConsentidoQueja: Boolean,

  idTipoRespuestaDesistimiento: number,
  noTipoRespuestaDesistimiento: string,
  flDesistimiento: string

  flApelacion: string,
  flApelacionFiscal: Boolean,
  flAudienciaApelacion: Boolean,
  flAudienciaQueja: Boolean,

  selection: string,
  idPetitorio: number,

  flReposicion: string,
  idActoTramiteCasoGuardado: string
  /**
   * Usado para los procesos que tiene múltiples resultados por cada sujeto
   * por ejemplo Prisió preventiva y sus actos derivados.
   */
  idActoTramiteResultadoSujeto: string
  flRatifica?: string;
  flRectifica?: string;
  flQueja?: string;

  /**
   * Usado para las apelaciones de proceso inmediato
   */
  idApelacionResultado: string;
  idTipoRespuestaPE: number;
  noTipoRespuestaPE: string;
  idActoTramiteCasoResultado: string;
  flRspQueja: string;


  quejaConsentido?: number;
  apelacionConsentido?: number;
  flApelacionPena?: string;
  flApelacionReparacionCivil?: string;
  sujetoSelected?: boolean;
}


