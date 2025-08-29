export interface GrupoPartesDelitos {
  orden: number,
  grupo: string,
  idCaso:string,
  coCaso:string,
  partesSujetos: Partes[],
  delitos: Delitos[]
}

export interface Partes {
  idSujetoCaso:string;
  partes:string;
  numeroDocumento:string;
}

export interface Delitos {
  //idSujetoCaso:string;
  //idDelitoSujeto:string;
  idDelitoGenerico: number;
  noDelitoGenerico: string;
  idDelitoSubgenerico: number;
  noDelitoSubgenerico: string;
  idDelitoEspecifico: number;
  noDelitoEspecifico: string;
  labelDelito: string;
}

