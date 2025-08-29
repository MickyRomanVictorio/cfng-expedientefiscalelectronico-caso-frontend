export interface RespuestaElevacion {

    idBandejaElevacion : string,
    idActoTramiteCasoEleva: string,
    idActoTramiteCasoRespuesta: string,
    idCaso: string,
    idEtapa: string,
    codCaso: string,
    fiscal?: string,
    esCaso:number,
    esCuaderno:number,
    idTipoElevacion:number,
    descTipoElevacion?: string, 
    descResultado?: string,
    descEtapa?: string,
    descTramite: string,
    fechaElevacion?:Date,
    fechaResultado?:Date,
    delitos: string,

}

