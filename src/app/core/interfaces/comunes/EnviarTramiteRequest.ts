export interface EnviarTramiteRequest {
    idBandejaActoTramite?: string | null;
    procedencia?: number; //5 EFE
    nroDisposicion?: number;
    noTramite?: string;
    coDespacho?: string;
    idActoTramiteCaso?: string;
    idEstadoDocumento?: number;
    coUsurioOrigen?: string;
    deComentarios?: string;
    usuariosDestino?: DestinatarioMensaje[]
}

export interface DestinatarioMensaje {
  idUsuario?: string
}

export interface Destinatario {
  label: string,
  value: string
}

export interface UsuarioCargo {
  idUsuario: string,
  dePerfil: string,
  noUsuario: string
}


