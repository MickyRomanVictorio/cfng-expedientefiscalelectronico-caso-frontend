export interface TramiteGenerico {
  etapa?: string,
  idCaso?: string,
  idActoTramiteEstado?: string,
  idActoTramiteCaso?: string,
  nombre?: string,
  flagActaEscaneada?: string,
  descripcionActaEscaneada?: string,
  idTipoCopia?: number,
  nombreArchivo?: string,
  archivo?: string,
  flagOficioManual?: string | null,
  idTipoOficio?: number,
  idOficioPersonaJuridica?: string,
  idSujetoDeclarante?: string,
  flagEscaneadaDocumento?: string,
  sumillaDocumento?: string,
  asuntoDocumento?: string,
  idDocumento?: string,
  flagFuenteInvestigacionEmbebida?: string,
  flagActoInvestigacion?: string,
  idActoTramiteCasoInv?: string,
  numeroRucDestinatario?: string | null,
  razonSocialDestinatario?: string | null,
  sujetosProcesales?: SujetoProcesal[],
  nodeId?: string,
  idTramite?: string,
}

export interface SujetoProcesal {
  codigo: string,
  nombre: string
}