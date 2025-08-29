export interface BuscarCasosPorAsignarRequest {
    buscar?: string,
    fechaDesde?: string | null,
    fechaHasta?: string | null,
    plazo?: number,
    origen?: number,
    filtrotiempo?: string
}