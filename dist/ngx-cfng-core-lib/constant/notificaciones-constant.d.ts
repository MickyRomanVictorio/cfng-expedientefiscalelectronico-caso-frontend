/// <reference path="notificaciones-constant.ngtypecheck.d.ts" />
export declare const TIPO_CEDULA: Readonly<{
    NOTIFICACION: "N";
    CITACION: "C";
}>;
export declare const MODALIDAD_CITACION: Readonly<{
    PRESENCIAL: "Presencial";
    VIRTUAL: "Virtual";
}>;
export declare const DATOS_INICIALES_ORDEN: {
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
    archivosAdjuntosEfe: never[];
    archivosAdjuntosGenerador: never[];
    personasANotificar: never[];
};
export declare const FINALIDAD_CITACION: Readonly<{
    APERTURA_INVESTIGACION: 10;
    AUDIENCIA: 11;
    CITACION_DECLARACION: 20;
    CONSTATACIONES_INSPECCION: 22;
    DISPOSICION_INVESTIGACION: 23;
    PRINCIPIO_OPORTUNIDAD: 25;
    CAMARA_GESELL_ABOGADO_DETENIDO: 15;
    CAMARA_GESELL_AGRAVIADO_MAYOR_EDAD: 16;
    CAMARA_GESELL_AGRAVIADO_MENOR_EDAD: 17;
    CAMARA_GESELL_APODERADO: 18;
    AUDIENCIA_CONCILIACION: 12;
    CAMARA_GESELL: 13;
    CAMARA_GESELL_ABOGADO_DEFENSOR_IMPUTADO: 14;
    CAMARA_GESELL_IMPUTADO: 19;
    CITACION_PREEXISTENCIA: 21;
}>;
export declare const NUMEROS_CITACION: {
    id: string;
    nombre: string;
}[];
export declare const DATOS_INICIALES_CEDULA: {
    finalidad: null;
    urgencia: null;
    nombreFiscal: string;
    descripcion: string;
    modalidadCitacion: string;
    direccionCitacion: string;
    direccionUrlCitacion: string;
    referenciaCitacion: string;
    camaraGesellCitacion: null;
    agraviadoCitacion: null;
    denunciadoCitacion: null;
    personaSolicitanteCitacion: null;
    motivoConciliacionCitacion: string;
    numeroCitacion: null;
    documentoARecibir: string;
    diasHabiles: string;
    fechaCitacion: undefined;
    horaCitacion: undefined;
};
export declare const TIPO_SUJETOS_PROCESALES: Readonly<{
    TODOS: 0;
    AGRAVIADOS: 1;
    DENUNCIADOS: 2;
    DENUNCIANTE: 3;
}>;
export declare const FINALIDADES_CASO_1: number[];
export declare const FINALIDADES_CASO_2: number[];
export declare const FINALIDADES_CASO_4_5_6: number[];
export declare const FINALIDADES_GESELL: number[];
export declare const RESPUESTA_MODAL: Readonly<{
    OK: "Ok";
    ERROR: "Error";
}>;
export declare const MEDIO_NOTIFICACION: Readonly<{
    DESPACHO: "2";
}>;
export declare const ESTADO_CEDULA: Readonly<{
    POR_GENERAR: 0;
    GENERADO: 1;
    ENVIADO: 2;
    ANULADO: 3;
}>;
export declare const DATOS_INICIALES_INFORMACION_ORDEN: {
    numeroCaso: string;
    nombreFiscal: string;
    numeroDocumento: string;
    tipoDocumento: string;
    tramite: string;
    finalidad: string;
    fechaEmision: string;
    numeroFolios: string;
    descripcion: string;
};
export declare const MENSAJE_ERROR_INESPERADO = "HA OCURRIDO UN ERROR INESPERADO. INTENTE NUEVAMENTE.";
export declare const ESTADOS_CEDULA: {
    GENERADO: string;
    ENVIADO: string;
    DERIVADO: string;
    RECUPERADO: string;
    RECHAZADO: string;
    DEVUELTO: string;
    OBSERVADO: string;
    PENDIENTE: string;
    PRIMERA_VISITA: string;
    SEGUNDA_VISITA: string;
    BAJO_PUERTA: string;
    LEIDO: string;
};
export declare const DE_MEDIO_NOTIFICACION: {
    DESPACHO: string;
    CENTRAL: string;
    CASILLA: string;
};
export declare const VISOR_ESTADO: {
    VISUALIZAR: string;
    FIRMADO: string;
    NOFIRMADO: string;
};
export declare const MEDIO_NOTIFICACION_ID: {
    DESPACHO: number;
    CENTRAL: number;
    CASILLA: number;
};
export declare const TIPO_DOCUMENTO: {
    CEDULA_NOTIFICACION: number;
    CEDULA_CITACION: number;
    CARGO_NOTIFICACION: number;
    CARGO_CITACION: number;
};
export declare const SUBJECT_TYPES: {
    naturalPerson: number;
    legalPerson: number;
    stateEntity: number;
};
