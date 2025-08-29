export interface RequerimientoTA {
  idActoTramiteCaso: string,
  idCaso: string,
  observaciones: string,
  formularioIncompleto: boolean;
  listaSujetos: SujetosRequerimientoTA[]
}

export interface SujetosRequerimientoTA {
  idActoTramiteSujeto: string,
  idSujetoCaso: string,
  nombreSujeto: string,
  tipoSujetoProcesal: string,
  delitos: Delito[],
  aceptoAcuerdo: boolean,
}

interface Delito {
  noDelito: string,
  noDelitoGenerico: string,
  noDelitoEspecifico: string
}