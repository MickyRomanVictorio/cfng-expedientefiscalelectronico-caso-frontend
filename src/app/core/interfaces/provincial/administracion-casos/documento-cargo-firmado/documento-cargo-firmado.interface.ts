import {DenunciaPendienteInterface} from "@interfaces/mesa-unica-despacho/digitalizado/denunica-pendiente.interface";

export interface DocumentoCargoFirmadoInterface {
  repositorio: string[];
  numeroExpedientePoderJudicial: string;
  codigoEntidad: string;
  idTipoEntidad: number;
  observacion: string;
  fechaPresentacion: string;
  fechaRecepcion: string;
  idActoTramiteEstado: string,
  idTramiteSelected: string,
  denuncia: DenunciaPendienteInterface;
  cargoDetalle?: DocumentoCargoDetalleInterface[]
}

export interface DocumentoCargoDetalleInterface {
  id?: string,
  idRepositorio?: string,
  nombre?: string,
  nombreOrigen?: string,
  idTipoOrigen?: number,
  idExtensionArchivo?: number,
  idTipoDocumento?: number,
  descripcionDocumento?: string,
  codigoDocumento?: string,
  idTipoCopia?: number,
  observacion?: string,
}

