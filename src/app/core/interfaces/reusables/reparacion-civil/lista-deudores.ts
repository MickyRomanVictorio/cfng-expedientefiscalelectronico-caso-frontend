export interface ListaDeudores {
    idSujetoCaso: string;
    idTipoParteSujeto: number;
    nombreSujeto: string;
    lstDelitosSujeto: DelitoListaDeudores[];
    idActoTramiteSujeto: string;
    seleccionado?: boolean;
}
export interface DelitoListaDeudores {
    delito: string;
    idActoTramiteDelitoSujeto: string;
    idTipoSentenciaOriginal:number | null;
    idTipoSentencia:number | null;
    idDelitoSujeto:string;
    seleccionado?: boolean
}
