export interface EstudioSujetoProcesalRequest {
  idSujetoEstudio: string;
  idSujetoCaso: string;
  idTipoInstitucion: string;
  idInstitucionEducativa: string;
  idGradoInstruccion: string;
  idCarrera: string;
  otraInstitucion: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  detalle: string;
}
