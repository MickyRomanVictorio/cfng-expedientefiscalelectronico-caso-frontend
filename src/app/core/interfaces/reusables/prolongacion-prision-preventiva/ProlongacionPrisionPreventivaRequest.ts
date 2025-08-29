export interface ResultadoProlongacionPrisionPreventivaInterface {
  idActoTramiteResultadoSujeto: string,
  idActoTramiteCaso: string,
  idTipoResultado: number,
  tipoResultado: string,
  idSujetoCaso: string,
  idTipoParteSujeto: number,
  nombreSujetoCaso: string,
  reoAusenteContumaz: boolean,
  fechaInicio: string,
  plazoOtorgado: number,
  flProlongado: boolean,
  fechaFin: string,
  fechaCalculada: string,
  idUnidadMedida: number,
  unidadMedida: string,
  idTipoMedidaCoercion: number,
  tipoMedidaCoercion: string,
  idMedidaCoercion: number,
  medidaCoercion: string,
  descripcion: string
}

export interface RequerimientoProlongacionRequest {
  idCaso: string,
  idActoTramiteCaso: string,
  listSujetosResultado: ResultadoProlongacionPrisionPreventivaInterface[],
}
