export interface RegistrarPlazoRequest {
  idCaso?: string;
  idPlazo?: string;
  usuarioRegistro?: string;
  idTipoComplejidad?: number;
  idTipoUnidad?: number;
  nroPlazo?: number;
  idTipoSedeInvestigacion?: number | null;
  descripcionPlazo?: string;
  idTramite?: string;
  idActoProcesal?: string;
  fechaCalculada?: string;
  esEditado: boolean;
  fechaInicio?: string,
  fechaFin?: string,
}


export interface ObtenerValorMaxPlazoRequest {
  idTramite?: number;
  idTipoComplejidad?: number;
  idTipoUnidad?: number;
  idActoTramiteEstado?: string;
  idCaso?: string
}

export interface ObtenerValorMaxPlazoResponse {
  cantidadTotal?: number;
  cantidadMaxima?: number;
  idActoTramitePlazo?: number;
  idPlazo?: number;
  idTipoComplejidad?: number;
  idTipoUnidad?: number;
}

export interface AmpliarPlazoPreliminar {
  idCaso?: string;
  usuarioRegistro?: string;
  idTipoUnidad?: number;
  nroPlazo?: number;
  idTipoSedeInvestigacion?: number;
  descripcionPlazo?: string;
  idTramite?: string;
  idActoProcesal?: string;
  fechaCalculada?: string;
}

export interface ValidarPlazoComplejo {
  idTipoComplejidad?: number;
  idTipoUnidad?: number;
  nuevoPlazoComplejo?: string;
  idTramite?: string;
  idActoProcesal?: string;
  idCaso?: string;
  idActoTramiteEstado?: string;
  idActoTramiteCaso?: string;
}

export interface ValidarPlazoResponse {
  numeroDias?: number;
  mensaje?: string;
  codigo?: string;
  respuestaValidacion?: string;
}
