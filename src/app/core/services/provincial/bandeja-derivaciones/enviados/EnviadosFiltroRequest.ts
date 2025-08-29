export interface EnviadosFiltroRequest {
  buscarTexto?: string | null,
  tipoFecha: number,
  fechaDesde: string | null,
  fechaHasta: string | null,
}
