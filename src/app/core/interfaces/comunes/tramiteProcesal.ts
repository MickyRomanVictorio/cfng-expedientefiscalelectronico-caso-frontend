export interface TramiteProcesal {
  idActoTramiteEstado: string,
  nombreTramite: string,
  formulario: string,
  idTipoDocumento: number,
  idTramite: string,
  generaPlazo: string,
  idActoTramiteConfigura: string,
  flgIngresoTramite: string,
  esGenerico: string,
}

export interface TramiteDetalle {
  idEstadoTramite: number;
  idDocumento: string;
  nombreActoProcesal: string;
  idActoTramiteEstado: string;
  idActoTramiteConfigura: string;
  idTramite: string;
  nombreTramite: string;
  formulario: string;
  idTipoDocumento: string;
  generaPlazo: string;
  flgIngresoTramite: string;
  idTipoComplejidad: string;
  idDocumentos: string[];
}
