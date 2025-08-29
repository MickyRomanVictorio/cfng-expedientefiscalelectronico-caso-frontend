export interface SentenciaConsentida {
    fechaNotificacion:any
    observaciones:string
    listaSujetosParaConsentir:SujetosDelitosSenteciasConsentidasId[]
    listaSujetosConsentidos:SujetosDelitosConsentidos[]
}
export interface SujetosDelitosSenteciasConsentidasId {
    idActoTramiteDelitoSujeto:string
    idPena:string
    idSujetoCaso:string
    idDelitoSujeto:string
    idTipoSentencia:number
}
export interface SujetosDelitosConsentidos {
    idActoTramiteDelitoSujeto:string
    sujeto:string
    delito:string
    tipoSentencia:string
    idPena:string
    pena:string
    tipoPena:string
    reparaciones:number
    idSujetoCaso:string
    idDelitoSujeto:string
    idTipoSentencia:number
}
