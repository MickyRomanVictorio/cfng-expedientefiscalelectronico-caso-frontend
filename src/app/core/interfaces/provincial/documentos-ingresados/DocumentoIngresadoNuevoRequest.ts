export interface DocumentoIngresadoNuevoRequest {
  idOrigen: number | null,
  fechaDesde: string | null,
  fechaHasta: string | null,
  idBandeja: number,
  page: number,
  perPage: number
}
