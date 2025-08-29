export interface ApelacionFiscalia {
    idActoTramiteCaso?:string;
    idRspInstancia?:number;
    flagRspQueja?:string;
}

export interface ApelacionProcesoInmediato {
    idActoTramiteCaso?:string;
    idRspInstancia?:number;
    idRspInstanciaQueja?:number;
    descripcionResultado?:string;
    flagRspQueja?:string;
}
