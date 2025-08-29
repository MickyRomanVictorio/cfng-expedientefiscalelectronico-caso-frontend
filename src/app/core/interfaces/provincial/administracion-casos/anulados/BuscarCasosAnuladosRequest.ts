export interface BuscarCasosAnuladosRequest {
  textoBusqueda?: string;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  filtroTiempo?: number;
}