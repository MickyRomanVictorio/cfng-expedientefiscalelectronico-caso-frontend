export interface TrabajoSujetoProcesalRequest {

  idSujetoCentroTrabajo: string;
  idPersona: string;
  idSujetoCaso: string;
  idTipoCentro: number;
  centroTrabajo: string;
  idPuesto: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  detalle?: string;

  numeroRuc?: string;
  flgManual?: string;

}
