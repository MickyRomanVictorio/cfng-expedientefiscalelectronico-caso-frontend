export interface ListaSujetosProcesales {
    idSujetoCaso:string;
    idTipoParteSujeto:number;
    noTipoParteSujeto:string;
    nuDocumento:string;
    tipoDocumento:string;
    sujeto:string;
    idSujetoCasoSeleccionado?:string;
    delitos:ListaDelitosSujetos[];
    delitosSeleccionados: ListaDelitosSujetos[];
}
export interface ListaDelitosSujetos {
    idSujetoCaso:string;
    idDelitoSujeto:string;
    articulo:string;
    idDelitoGenerico:string;
    delitoGenerico:string;
    idDelitoSubgenerico:string;
    delitoSubgenerico:string;
    idDelitoEspecifico:string;
    delitoEspecifico:string;
    delitoCompleto:string;
    existeExtremo:boolean;
    listaCuadernosExistentes:string[];
}
export interface CrearCuadernoExtremo {
  idCaso?:string;
  sujetos:CrearSujetoProcesalExtremo[]
}
export interface CrearSujetoProcesalExtremo {
  idSujetoCaso:string;
  delitos:ListaDelitosSujetos[]
}
