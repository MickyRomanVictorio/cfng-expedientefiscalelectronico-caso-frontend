export interface ListaReparacionCivilPagos {
    idReparacionCivil:string;
    codReparacionCivil:string;
    atrasado:boolean;
}

export interface TabPagos {
  id?: number,
  idReparacionCivil:string;
  titulo: string,
  atrasado:boolean,
  oculto?: boolean,
}

export interface ReparacionCivilDetallePagos {
  idReparacionCivil:string;
  codReparacionCivil:string;
  tipo:string;
  montoPagado:number;
  deudaTotal:number;
  cuotasTotales:number;
  cuotasPagadas:number;
  montoPendiente:number;
  salidaAlterna:string;
  listaDeudores:string[];
  listaAcreedores:string[];
  cuotas: ListaCuotaReparacionCivil[];
}

export interface ListaCuotaReparacionCivil {
  idCuota:string;
  idPagoCuota:string;
  cuota:number;
  fechaVencimiento:string;
  montoPagado:number;
  montoCuota:number;
  idEstadoCuota:number;
  montoPendiente:number;
  estado:string;
  activarPago:boolean;
}
export interface ListaSujetosReparacionPagos {
  tipoParticipante:string;
  tipoParteSujeto:string;
  sujeto:string;
  tipoDocumento:string;
  numeroDocumento:string;
}
export interface DetallePagoCuota {
  idCuota:string;
  codReparacionCivil:string;
  idPagoCuota:string;
  cuota:number;
  montoPagado:number;
  montoCuota:number;
  montoPendiente:number;
  fechaVencimiento:string;
  listaPagos:ListaPagoCuota[];
}
export interface ListaPagoCuota{
  idSeguiCuota:string;
  monto:number;
  recibo:string;
  fechaPago:string;
  fechaCreacion:string;
  observaciones:string;
  fechaPagoDate:string;
  comprobante:string;
}
