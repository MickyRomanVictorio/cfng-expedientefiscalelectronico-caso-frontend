export interface GruposDesagregados {
  orden?: number;
  nombreGrupo: string,
  sujetos: PartesDesagregados[],
  numeroCaso: string,
  idCaso: string | null,
  delitos: DelitosDesagregados[]
}

export interface PartesDesagregados{
  nombres: string,
  numeroDocumento: string,
  idSujetoCaso: string
}

export interface DelitosDesagregados{
  idSujetoCaso?: string;
  idDelitoGenerico: number,
  idDelitoSubgenerico: number,
  idDelitoEspecifico: number,
  nombreLabel:string
}
