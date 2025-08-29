import { SafeResourceUrl } from "@angular/platform-browser";

interface StatusModel {
    isLoading: boolean;
}

interface DataModel {
    data: Array<any>;
    pages: number;
    perPage: number;
    total: number;
}

export interface ResponseDocumentCitationModel extends StatusModel {
    data: Array<any>;
}

export interface ResponseCatalogModel extends StatusModel {
    data: Array<any>;
}

export interface ResponsePaginateModel extends StatusModel {
    data: DataModel;
}

export interface ResponseModel extends StatusModel {
    data: any;
}

export type DatosGenerales = {
    idMovimiento: string;
    idCaso: string;
    codigoCaso: string;
    idFiscal: number;
    nombreFiscal: string;
    idActoProcesal: number;
    nombreActoProcesal: string;
    idTramite: number;
    nombreTramite: string;
    idTipoDocumento: number;
    nombreTipoDocumento: string;
    fechaEmisionDocumento: string;
    numeroDocumento: string;
    numeroFolios: number;
    //Extras
    nombreDespacho: string;
    telefonoDespacho: string;
    anexoDespacho: string;
    nombreDependenciaFiscal: string;
    direccionDependenciaFiscal: string;
    documentoPrincipal: DocumentoPrincipal
  };


  export type DocumentoPrincipal = {
    idDocumento: string;
    idMovimiento: string;
    idCaso: string;
    idTipoDocumento: string;
    coDocumento: string;
    noDocumentoOrigen: string;
    nuPeso: string;
    //para envio cedula
    nomTipoDocumento?:string;
    folio?: string;
  }

   export type NotificacionExtendedDTO = {
    idOrdenNotificacion?: string;
    numeroCedula: string;
    numeroCaso?: string;
    idCaso: string,
    numeroDocumento?: string;
    tipoDocumento?: string;
    tramite?: string;
    usuarioEmision?: string;
    sujetoANotificar?: string;
    direccionANotificar?: string;
    tipoSujeto?: string;
    tipoSujetoUnido?: string;
    fechaEmision?: Date;
    fechaRecepcionCentral?: Date;
    fechaEnvioCentral?: Date;
    medioNotificacion?: string;
    estado?: string;
    fechaLlegadaCentral?:Date;
    centralNotificacionesActual?: string;
    idMedioNotificacion?: string;
    idNotificador?:string;
    fechaAsignacion?: Date;
    fechaImpresion?: Date;
    fechaCargo?: Date;
    zonaDespacho?: string;
  };

  export type SujetoNotificador = {
    idSujeto: string,
    nombreSujeto: string

  }

  export type CargoNotification = {
    idNotificacion?: string;
    sujetoNotificador?: string;
    zona?: string;
    fechaAsignacion?: Date;
    fechaCargo?: Date;
    fechaImpresion?: Date;
    descripcion?: string;
    documento?: string
  }

  export type DocumentoAnexo = {
    idDocumento: string;
    codDocumento?: string;
    codNotificacion?: string;
    tipoDocumento?: number;
    desTipoDocumento?: string;
    rutaDocumento?: string | SafeResourceUrl;
    nomDocumento?: string;
    extensionDocumento?: string;
    numPaginas?: number;
    numFojaInicio?: number;
    numFojaFinal?: number;
    //para cliente
    size?: string
    codigoCaso?: string;
    firmado?: boolean;
    //para envio cedula
    nomTipoDocumento?:string;
    folio?: string;
    coDocumento?: string;
  };


  export enum NotificationPath {
    Notificacion = 'e/notificacion',
    Citacion = 'e/citacion',
  }

  export enum NotificationType {
    Notificacion = 'notification',
    Citacion = 'citation',
  }

  export type NotificadorDTO  = {
    id: string;
    nombre: string;
  }

  export type Direccion = {
    idDireccion?: string;
    nombreTipoDomicilio?: string;
    nombreDireccion?: string;
    referenciaDireccion?: string;
    seleccionado?: boolean;
  };

  export type SujetoProcesal = {
    orden?: number;
    idSujetoCaso?: string;
    nombreTipoDocumentoIdentidad?: string;
    numeroDocumento?: string;
    nombreTipoParteSujeto?: string;
    nombreSujeto?: string;
    urgencia?: string;
    direcciones: Direccion[];
    idPersona?: string;
  };

  export interface SujetoProcesalModel extends StatusModel {
    data: SujetoProcesal[];
  }

  export type RepositorioResponse = {
    mensaje: string;
    data: any;
    codigo: number;
    id: null | string;
  };

  export type RepositorioTurnoResponse = {
    mensaje: string;
    data: ArchivoSubido;
    codigo: number;
    id: null | string;
  };


  export interface ArchivoSubido {
    nombreArchivo: string,
    numeroFolios: number,
  }
  export interface CargoCedulaRequest {
    idNotificacion: string;
    numeroCaso: string;
    numeroCedula: string;
    sujetoNotificador: string;
    nombreArchivo: string;
    fechaAsignacion: Date | null;
    fechaCargo: Date | null;
    fechaImpresion: Date | null;
    descripcion: string;
    file: string,
    idCedula?: string;
    coDocumento: string;
    idTipoDocumento: number;
    zona: string | null;
  }
