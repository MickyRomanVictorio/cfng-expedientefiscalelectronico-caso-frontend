export interface ListaSujetosProcesales {
  idSujetoCaso:string;
  noTipoParteSujeto:string;
  nuDocumento:string;
  noTipoDocumento:string;
  nombreSujeto:string;
  idSujetoCasoPadre:string;
  delitos: ListaDelitosSujetos[];
}

export interface ListaDelitosSujetos {
  noDelito:string;
  noDelitoGenerico:string;
  noDelitoEspecifico:string;
}
