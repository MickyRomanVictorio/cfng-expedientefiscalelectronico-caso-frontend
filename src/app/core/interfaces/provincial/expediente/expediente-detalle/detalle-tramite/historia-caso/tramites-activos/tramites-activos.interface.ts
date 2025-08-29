export interface TramiteActivo {
  nro: string;
  idActoTramiteCaso: string;
  idActoTramiteEstado: string;
  flgSecreto: string;
  flgDerivacion: string;
  flgElevacion: string;
  flgElevacionAceptada: string;
  flgElevacionObservada: string;
  flgConActasAudiencia: string;
  flgRevertido: string;
  descEtapa: string;
  descTramite: string;
  descActoProcesal: string;
  fechaEmision: string;
  tipoIngresoTramite: number;
  estadoTramite: string;
  fechaCreacion: string;
  plazoSecreto: number;
  plazoSecretoTranscurrido: number;
  nombreFirmante: string;
  idDocumentoTramite?: string;
  despacho?: string;
  flgNoEfe?: string;
  origenTramite?: number
}
