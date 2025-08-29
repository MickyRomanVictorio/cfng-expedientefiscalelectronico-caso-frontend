import { DocumentoAnexo } from "@core/models/notificaciones.model";
import { EnviarACedula } from "@core/types/enviar-a-cedula.type";

export interface Orden {
    idCaso: string;
    idOrdenBD: string;
    idMovimientoCaso: string;
    codigoCaso: string;
    codigoFiscalia: string;
    anhoRegistro: string;
    numeroCaso: string;
    numeroCuaderno: string;
    nombreFiscalOrden: string;
    despachoFiscalOrden: string;
    fiscaliaOrden: string;
    direccionDespachoOrden: string;
    telefonoDespachoOrden: string;
    anexoDespachoOrden: string;
    idFinalidadOrden: number;
    finalidadOrden: string;
    idTipoDocumentoOrden: number;
    descripcionTipoDocumentoOrden: string;
    numeroDocumentoOrden: string;
    fechaEmisionDocumentoOrden: string;
    numeroFojasOrden: string;
    descripcionOrden: string;
    archivosAdjuntosEfe: DocumentoAnexo[];
    archivosAdjuntosGenerador: DocumentoAnexo[];
    personasANotificar: PersonaANotificar[];
    idFiscal?: number;
    idDespacho?: number;
    idDependenciaFiscal?: number;
}

export interface PersonaANotificar {
    idSujeto: string;
    idSujetoBD: string;
    nombreSujeto: string;
    tipoSujeto: string;
    cedula: Cedula;
    direccionesSeleccionadas: DireccionSeleccionada[];
    idPersona: string;
}

export interface Cedula {
    editado: boolean,
    idUrgenciaCedula: number,
    urgenciaCedula: string,
    idFinalidadCedula: number,
    finalidadCedula: string,
    descripcionCedula: string,
    delitosCedula: DelitoCedula[],
    modalidadCitacion?: string,
    direccionCitacion?: string,
    referenciaCitacion?: string,
    direccionUrlCitacion?: string,
    idCamaraGesellCitacion?: number,
    idAgraviadoCitacion?: string,
    idDenunciadoCitacion?: string,
    idPersonaSolicitanteCitacion?: string,
    personaSolicitanteCitacion?: string,
    numeroCitacion?: string,
    motivoConciliacionCitacion?: string,
    documentoARecibir?: string,
    diasHabiles?: string,
    fechaCitacion?: string,
    horaCitacion?: string,
}

export interface DelitoCedula {
    idDelitoSujeto: number;
    idDelitoGenerico: number;
    idDelitoSubgenerico: number;
    idDelitoEspecifico: number;
    nombreDelito: string;
    seleccionado: boolean;
}

export interface DireccionSeleccionada {
    idNotificaCedula: string;
    numeroCedula: string;
    idDireccion: string;
    tipoDireccion: string;
    nombreDireccion: string;
    referenciaDireccion: string;
    enviarA: EnviarACedula;
    estado: Estado;
}

export interface Estado {
    actual: number;
    firmado: boolean;
    enviado: boolean;
    anulado: boolean;
}