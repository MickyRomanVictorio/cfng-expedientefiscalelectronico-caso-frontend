export interface ListaAcreedores {
  idSujetoCaso:string;
  idTipoParteSujeto:number;
  nomTipoParteSujeto:string;
  numDocumentoIdentidad:string;
  nomTipoDocIdentidad:string;
  nombreSujeto:string;
  idActoTramiteSujeto:string;
  idPena:string;
  seleccionado?: boolean;
}
