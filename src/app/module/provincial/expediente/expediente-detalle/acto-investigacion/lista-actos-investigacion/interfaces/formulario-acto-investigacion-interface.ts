export interface FormularioActoInvestigacion extends BusquedaFiltro {
  idCaso?: string;
  page?: number;
  size?: number;
}

export interface BusquedaFiltro {
  busqueda?: string;
  fechaDesdeIngreso?: string;
  fechaHastaIngreso?: string;
  sujetoProcesal?: string;
  clasificacion?: string;
  etapa?: string;
  actoProcesal?: string;
}
