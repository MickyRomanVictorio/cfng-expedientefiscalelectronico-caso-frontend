export interface Cuotas {
    numero: number;
    monto: number;
    rangoDias: number;
    fechaVencimiento: string;
    fechaFinPago: string;
}

export interface Acuerdos {
    idAcuerdo: string | null;
    idSujeto: string;
    idTipoPago: number;
    idBanco: number;
    numeroCuenta: string;
    codigoDeposito: string;
    montoTotal: number;
    fechaAcuerdo: Date;
    descripcion: string;
    impuesto: string;
    montoMinisterio: number;
    flagOtros: string;
    cuotas: Cuotas[];
    fechaAcuerdoOtros: Date;
    descripcionOtros: string
}

export interface ActaAcuerdoReparatorio{
    idCaso: string;
    idActoTramiteCaso: string;
    acuerdos: Acuerdos[];
}

export interface Imputados{
    idSujeto: string;
    nombre: string;
    selected: boolean;
    montoPago: number;
}
export interface ImputadosAcuerdo{
    idSujetoCaso:string;
    sujeto:string;
    idTipoParteSujeto:number;
    alias:string;
    idAcuerdoActas:string | null;
    monto:number;
}
