export interface SujetoProcesalesAdecuacion {
  idActoTramiteResultadoSujeto: string,
  idActoTramiteSujeto: string,
  idSujetoCaso: string,
  nombreSujetoCaso: string,
  tipoResultado: string,
  medidaCoercion: string,
  tipoMedidaCoercion: string,
  fechaInicio: string,
  plazoOtorgado: number,
  unidadMedida: string,
  fechaFin: string,
  plazoProlongado: number,
  unidadMedidaProlongado: string,
  fechaFinProlongado: string,
  flAdecuacion: boolean
}

export interface RequerimientoAdecuacionRequest {
  idCaso: string,
  idActoTramiteCaso: string,
  listSujetosAdecuacion: string[],
}
