export interface ApelacionRequest{
    idTipoApelacion: number;
    idActoTramiteCaso:string;
    idSujetoCaso?:string;
    idTipoParteSujeto?:number;
    idRspInstancia?:number;
    flagRspQueja?:string;
}