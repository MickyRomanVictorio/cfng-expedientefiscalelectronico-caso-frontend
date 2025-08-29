export interface DocumentoIngresadoNuevo {
  idBandeja: string;
  idDocumentoEscrito: string;
  idCaso: string;
  numeroCaso: string;
  estadoDocumento: string;
  numeroDocumento: string;
  codigoDocumento: string;
  origen: string;
  tipoRemitente: string;
  remitente: string;
  celular: string;
  correo: string;
  telefono: string;
  fechaIngreso: string;
  horaIngreso: string;
  estadoDocuIngresado: string;
  idEtapaInicial: string;
  flConcluido: string;
  idActoTramiteCaso: string;
  pendienteCompletarDatos: boolean;
  tramite: string;
  idClasificadorExpedienteTramite: string;
  idTipoClasificadorExpedienteTramite: string;
  idCasoTramite: string;
  flConcluidoTramite: string;
  numeroDocumentoPdf: string;
}

export interface VisorDocumentoResponse {
  numeroDocumentoPresentante: string;
  tipoDocumentoPresentante: number;
  numeroDocumento: string;
  tipoTramite: string;
  tipoDocumento: string;
  fechaIngreso: string;
  remitente: string;
  tipoParte: string;
  medioPresentacion: string;
  idDocumentoA: string;
  nombreDocumentoA: string;
  numeroDocumentoA: string;
  tamanoArchivoA: string;
  fechaRegistroA: string;
  idDocumentoB: string;
  nombreDocumentoB: string;
  numeroDocumentoB: string;
  tamanoArchivoB: string;
  fechaRegistroB: string;
  ideDocumento: string;
  numeroCaso: string;
  nombreDocumentoOrigenA: string;
  nombreDocumentoOrigenB: string;
}

export interface DocumentoAdjunto {
  id: number;
  idDocumento: string;
  nombreDocumento: string;
  numeroDocumento: string;
  tamanoArchivo: string;
  fechaRegistro: string;
  ideDocumento: string;
  nombreOrigenDocumento: string;
}

export interface AsuntoObservaciones {
  asunto: string;
  observaciones: string;
}
