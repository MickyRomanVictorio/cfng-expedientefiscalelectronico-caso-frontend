import {DatosCabecera} from "@core/interfaces/reusables/firma-digital/datos-cabecera.interface";
import { PosicionFirma } from "./posicion-firma.interface";

export interface GuardarDocumentoRequest {
  idBandejaActoTramite?: string | null,
  idCaso: string,
  idActoTramiteEstado: string,
  idActoTramiteCaso: string,
  datosCabecera: DatosCabecera,
  archivo: string,
  posicionFirma?: PosicionFirma
}

export interface DocumentoCargoRequest {
  idCaso: string,
  idActoTramiteEstado: string,
  idActoTramiteCaso: string,
  datosCabecera: CargoCabecera,
  archivo: string,
}

export interface CargoCabecera {
  codigoDocumento: string,
  nombreDocumentoFichero: string,
  numExpedientePoderJudicial: string,
  fechaPresentacion: string,
  fechaRecepcion: string,
  observacion: string,
  idTipoEntidad: number,
  codigoEntidad: string,
  idTipoCopia ?: number,
  nombreOrigen ?: string,

}
