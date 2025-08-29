export interface BuscarCasosRecibirRequest {
  textoBusqueda?: string ;
  fechaDesde?: string | null;
  fechaHasta?: string  | null;
  filtroTiempo?:number;
  idPlazo?:number ;
  idOrigen?:number
}
