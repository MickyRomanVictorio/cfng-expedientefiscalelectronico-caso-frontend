export interface ResolucionAutoResuelveTA {
  idActoTramiteCaso: string;
  idCaso: string;
  fechaNotificacion: string | null;
  resultado: number;
  observaciones: string;
  formularioIncompleto: boolean;
}

export enum ID_N_RESULTADO_TA {
  FUNDADO = 1107,
  FUNDADO_PARTE = 1108,
  INFUNDADO = 1109,
}

export interface Penas {
  delito: string;
  idActoTramiteDelitoSujeto: string | null;
  idPena: string;
  idSujetoCaso: string | null;
  pena: string;
  sujeto: string;
  tipoPena: string;
  tipoSentencia: string;
}


export interface Apelacion {
  idTipoApelacion: number;
  idActoTramiteCaso: string;
  idSujetoCaso: string;
  idTipoParteSujeto: number;
  idRspInstancia: number;
  idTipoReparacionCivil?: string;
  contraQuienApelo?: string;
  idDelito?: string
}

export interface SujetoApelante {
  idSujetoCaso: string;
  idTipoParteSujeto: number
  nombreSujeto: string;
}

export interface ListaApelaciones {
  idSujetoCasoResultado: string;
  idSujetoCaso: string;
  nombreSujeto: string;
  nombreTipoParteSujeto: string;
  resultadoApelacion: string;
  idResultadoApelacion: number;
  codigoReparacion: string;
  contraQuienSeApelo: string;
  delitoEspecifico: string;
  delitoGenerico: string;
  delitoSubgenerico: string;
}

export interface ListaSujetosRC {
  idSujetoCaso: string;
  idTipoParteSujeto: number;
  noTipoParteSujeto: string;
  numeroDocumento: string;
  idTipoDocumento: number;
  noTipoDocumento: string;
  nombreSujeto: string;
  flVerificado: string;
  idTipoReparacionCivil: string;
  noTipoReparacionCivil: string;
}