export interface CasoPorRecepcionar {
   idCaso?: string;
   codCaso?: string;
   idUsuario?: string;
   cantidadPartes?: number;
   idTipoOrigen?: number;
   numeroTelefono?: string;
   correo?: string;
   sujetos?: string;
   delitos ?: string;
   remitente ?: string;
   detalleTipoOrigen ?: string ;
   tipoSujeto ?: string;
   flagReasignado ?: number ;
   fechaIngreso ?: string ;
   horaIngreso?: string ;
   idFiscalAsignado ?: string ;
   numeroDiasPlazo ?: number;
   numeroDiasRestantes ?: number;
   indicadorSemaforo ?: number;
   indicadorDetalleSemaforo  ?: string;
   fechaFinCalculada ?: string ;
   fechaEmision ?: string ;
   fechaElevacion ?:string;
   horaElevacion ?: string;
   horaAsignacion ?: string;
   fechaUltimaAsignacion?:Date;
   leido ?: string
}

export interface ApiResponse {
  value?:  CasoPorRecepcionar[];
}

export interface CasoIdRequest{
  idCaso: String,
  codCaso: String,
}

export interface RequestRecepcionarCasos {
  idCaso: String;
  idBandejaElevacion: string;
}
