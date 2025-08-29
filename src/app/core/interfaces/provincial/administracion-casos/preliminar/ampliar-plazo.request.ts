export interface AmpliarPlazoRequest {
  idMovimiento: string;
  idCaso: string;
  //idActoProcesalConfigura: string;
  idActoTramiteCasoUltimo: string;
  idActoTramiteEstado: string;
  nroPlazo: number;
  descripcionPlazo: string;
  idTipoSedeInvestigacion: number;
  idTipoUnidad: number;
  idActoTramiteCaso: string;
}
