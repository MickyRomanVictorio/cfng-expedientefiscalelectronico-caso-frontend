export interface Casos {
  idBandejaElevacion: string;
  idSemaforo: string;
  idCaso: string;
  numeroCaso: string;
  idTipoElevacion: string;
  cssTextoElevacion: string | null;
  cssApelacionAuto: string | null;
  esContiendaCompetencia: string;
  etapa: string;
  idEtapa?: number;
  nombreFiscalOrigen: string;
  entidadFiscalOrigen: string;
  despachoFiscalOrigen: string;
  fechaElevacion: string;
  fechaAceptacion: string | null;
  fechaAsignacion: string | null;
  plazoAsignar: string;
  nombreFiscalAsignado: string | null;
  plazoDiasTranscurridos: string;
  plazoDiasTotal: string;
  tipoClasificadorExpediente: string;
  seleccionado: boolean;
}

export interface  Etapa {
  id : string;
  nombre : string;
}
