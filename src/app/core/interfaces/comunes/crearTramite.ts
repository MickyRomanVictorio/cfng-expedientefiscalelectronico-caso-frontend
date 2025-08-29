import { TIPO_INICIO_TRAMITE } from '@core/types/efe/provincial/tramites/comun/calificacion/acto-procesal.type';

export interface TramiteRequest {
    motivo?:                     string;
    deAsignarPlazo?:             string;
    deCalificacion?:             string;
    observaciones?:              string;
    feCitacion?:                 string;
    feEmisionJuezDeclara?:       string;
    feFecha?:                    string;
    feResolucion?:               string;
    flAudio?:                    string;
    flCargarSolicitud?:          string;
    flConfesion?:                string;
    flDelitoconduc?:             string;
    flDelitomis?:                string;
    flEvidencia?:                string;
    flExtincion?:                string;
    flFlagrancia?:               string;
    flHechoNoconstituye?:        string;
    flNoJustificable?:           string;
    flVideo?:                    string;
    idDpndPjudicial?:            number;
    idFiscal?:                   string;
    idSede?:                     number;
    idSinoe?:                    number;
    idTipoComplejidad?:          number;
    idTipoResultado?:            number;
    nuExpediente?:               string;
    nuTiempoRslv?:               number;
    flHechoNoDelito?:            string;
    flExtincionAccionPenal?:     string;
    flNoJustificablePenalmente?: string;
}

export interface TramiteResponse {
    idActoTramiteEstado?: string;
    idActoTramiteCaso?: string;
    idMovimiento?: string;
    idActoTramiteConfigura?: string;
    idTramite?: string;
    idDocumentoVersiones?: string;
    nombreArchivo?: string;
    pathDocumento?: string;
    codUsuario?: string;
    nombreUsuario?: string;
    fechaModificacion?: string;
    pesoArchivo?: string;
    statusCode?: number;
    data?: any
}

export interface TramiteRequestDefault {
    idActoTramiteCaso: string
}

export interface ValidacionTramite {
  tipoInicio: TIPO_INICIO_TRAMITE;
  idItemIngresoTramite: string;
  mensaje: string;
  cantidadTramiteSeleccionado: number;
  tipoOrigenTramiteSeleccionado: number;
  idEstadoRegistro: number | null;
  idActoTramiteSeleccionado: string;
  idActoSeleccionado: string;
  modoEdicion: boolean;
  verFormulario: boolean;
  verEditor: boolean;
  verDocumentos: boolean;
  verIniciarTramite: boolean;
  bloquearIniciarTramite: boolean;
}
