export interface SujetoProcesal{
    idSujetoCaso:string
    idSujetoCondicion: number,
    idSujetoProcesalCarpeta:string | null;
    incidenteCasoComun:string | null;
    noTipoParteSujeto:string;
    nombreSujetoProcesal:string;
    delitos:ListaDelitosSujetos[];
    delitosSeleccionados: ListaDelitosSujetos[];
    delitosProcesalCarpeta:ListaDelitosSujetos[];
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