export interface DocumentoAtencionRequest {
  idCaso: string;
  caso: string;
  idDocumentoEscrito: string;
  nombreDocumento: string;
  codigoDocumento: string;
  idBandeja: string;
  accion: string;
  correo: string;
  tramite: string;
  acto: string;
  actoTramiteEstado: string | null;
  flag: boolean;
  solicitud: string;
  descripcion: string;
  asociarDocumento: boolean
}
