export interface RecepcionContienda {
  idBandejaElevacion: string;
  idCaso: string;
  numeroCaso: string;
  idTipoElevacion: number;
  tipoElevacion: string;
  idTipoOrigen: number;
  tipoOrigen: string;
  idTipoRemitente: string;
  tipoRemitente: string;
  remitente: string;
  idEtapa: number;
  etapa: string;
  despachoProcedencia: string;
  fechaElevacion ?:string;
  horaElevacion ?: string;
  fechaAsignacion ?:string;
  horaAsignacion ?: string;
  etiquetaPlazo: string;
  estadoPlazo: string;
  indicadorSemaforo ?: number;
}

export interface ApiResponse {
  value?:  RecepcionContienda[];
}

export interface CasoIdRequest{
  idCaso: String
}

export interface RequestRecepcionarContienda {
  idCaso: String;
  idBandejaElevacion: string;
}
