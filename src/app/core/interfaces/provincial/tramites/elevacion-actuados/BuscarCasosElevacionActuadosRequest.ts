export interface BuscarCasosElevacionActuadosRequest {
    buscar?: string,
    fechaDesde?: string | null,
    fechaHasta?: string | null,
    fiscalia?: number,
    despacho?: number,
    remitente?: string,
    origen?: number
}
