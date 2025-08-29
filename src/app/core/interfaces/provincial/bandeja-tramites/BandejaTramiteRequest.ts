export interface BandejaTramiteRequest {
  textoBusqueda?: string;
  idEstadoBandeja: number;
  idTipoProceso?: number;
  idSubtipoProceso?: string;
  idEtapa: string;
  idActoProcesal: string;
  idTramite: string;
  idTipoDocumento?: number;
  idTipoCuaderno: number;
  tipoFecha: number;
  fechaDesde: string | null;
  fechaHasta: string | null;
  carpetas?: string[];
  page?: number;
  perPage?: number;
  textBuscar?: string;
}
