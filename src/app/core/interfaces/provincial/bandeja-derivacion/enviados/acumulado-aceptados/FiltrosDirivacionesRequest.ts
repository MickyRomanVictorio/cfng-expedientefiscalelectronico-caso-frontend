export interface FiltroDerivacionesRequest {
  textBusqueda: string,
  tipoFecha: number,
  fechaDesde: string | null,
  fechaHasta: string | null,
  accion: number,
}
