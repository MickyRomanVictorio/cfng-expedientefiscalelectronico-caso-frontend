export interface DelitosPartes {
  orden: number,
  idCaso:string,
  idSujetoCaso:string,
  tipoDocIdentidad:string,
  numeroDocumento:string,
  nombres:string,
  idTipoParteSujeto:number,
  tipoParteSujeto:string,
  delitos: Delitos[]
}

export interface Delitos {
  idSujetoCaso?:string;
  idDelitoSujeto?:string;
  idDelitoGenerico: number;
  noDelitoGenerico?: string;
  idDelitoSubgenerico: number;
  noDelitoSubgenerico?: string;
  idDelitoEspecifico: number;
  noDelitoEspecifico?: string;
  labelDelito: string;
}

