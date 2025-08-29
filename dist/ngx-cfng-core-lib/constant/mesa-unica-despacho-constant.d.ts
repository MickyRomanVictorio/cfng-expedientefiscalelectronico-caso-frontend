/// <reference path="mesa-unica-despacho-constant.ngtypecheck.d.ts" />
export declare const Constante: {
    DENUNCIA_REGISTRADA: string;
};
export type ProfileType = 628 | 629 | 630 | 631;
export type EntityType = 175 | 173 | 174;
export declare const SLUG_PROFILE: Readonly<{
    CIUDADANO: 1;
    PNP: 2;
    ENTIDAD: 3;
    PJ: 4;
    MP: 21;
}>;
export declare const CODIGO_TIPO_DOCUMENTO: Readonly<{
    DNI: 1;
    RUC: 2;
    PASAPORTE: 4;
    CE: 5;
}>;
export declare function getGeneroAbreviado(id: any): "" | "M" | "F";
export declare const TIPO_PARTE: {
    3: string;
    2: string;
    1: string;
};
export declare const SLUG_TIPO_PARTE: Readonly<{
    DENUNCIANTE: "DENUNCIANTE";
    DENUNCIADO: "DENUNCIADO";
    AGRAVIADO: "AGRAVIADO";
}>;
export declare const SLUG_ERROR_RENIEC: Readonly<{
    DNI_INVALIDO: "42202015";
    SERVICIO_RENIEC_NO_DISPONIBLE: "42202017";
}>;
export declare const SLUG_TIPO_PARTE_CODE: Readonly<{
    AGRAVIADO: 1;
    DENUNCIADO: 2;
    DENUNCIANTE: 3;
}>;
export declare const SLUG_ERROR_RENIEC_CODE: Readonly<{
    CODE_DNI_INVALIDO: "42202015";
}>;
export declare const SLUG_ENTITY: Readonly<{
    JURIDICA: EntityType;
    PROCURADURIA: EntityType;
    CEM: EntityType;
}>;
export declare const SLUG_ENTITY_MP: Readonly<{
    RAZON_SOCIAL: "MINISTERIO PÚBLICO - GERENCIA GENERAL";
    RUC: "20131370301";
    MP: 2;
}>;
export declare const SLUG_TIPO_RIESGOS_KEY: Readonly<{
    LEVE: "LEVE";
    MODERADO: "MODERADO";
    SEVERO: "SEVERO";
}>;
export declare const SLUG_TIPO_RIESGOS: Readonly<{
    LEVE: "Leve";
    MODERADO: "Moderado";
    SEVERO: "Severo";
}>;
export declare const SLUG_TIPO_VIOLENCIA: Readonly<{
    FISICA: "Física";
    PSICOLOGICA: "Psicológica";
    SEXUAL: "Sexual";
    PATRIMONIAL: "Patrimonial";
}>;
export declare const SLUG_TIPO_VIOLENCIA_KEY: Readonly<{
    FISICA: "FISICA";
    PSICOLOGICA: "PSICOLOGICA";
    SEXUAL: "SEXUAL";
    PATRIMONIAL: "PATRIMONIAL";
}>;
export declare const SLUG_PENDING_RESPONSE: Readonly<{
    NEW: "E";
    CONTINUE: "C";
}>;
export declare const SLUG_CONFIRM_RESPONSE: Readonly<{
    OK: "OK";
    CANCEL: "CANCEL";
    ALL: "ALL";
    VALIDATION: "VALIDATION";
}>;
export declare const SLUG_INVOLVED: Readonly<{
    AGRAVIADO: "agraviado";
    DENUNCIADO: "denunciado";
    DENUNCIANTE: "denunciante";
}>;
export declare const SLUG_INVOLVED_CODE: Readonly<{
    AGRAVIADO: 1;
    DENUNCIADO: 2;
    DENUNCIANTE: 3;
}>;
export declare const SLUG_INVOLVED_ROL: Readonly<{
    CONOCIDO: "conocido";
    DESCONOCIDO: "desconocido";
    ENTIDAD: "entidad";
    PERSONAN_NATURAL: "persona-natural";
}>;
export declare const SLUG_DOCUMENT: Readonly<{
    DNI: "DNI";
    RUC: "RUC";
    CARNE_EXTRANJERIA: "CARNE EXTRANJERIA";
    PASAPORTE: "PASAPORTE";
    SIN_DOCUMENTO: "SIN DOCUMENTO";
    LIBRETA_ELECTORAL: "LIBRETA ELECTORAL";
    PERMISO_TEMPORAL_CPP: "PERMISO TEMPORAL CPP";
    PERMISO_TEMPORAL_PTP: "PERMISO TEMPORAL PTP";
    CARNE_IDENTIDAD: "CARNE IDENTIDAD";
    CARNE_SOLICITANTE_REFUGIO: "CARNE DE SOLICITANTE DE REFUGIO";
}>;
export declare const SLUG_DOCUMENT_TYPE: Readonly<{
    DNI: 1;
    RUC: 2;
    CARNE_EXTRANJERIA: 5;
    PASAPORTE: 4;
    SIN_DOCUMENTO: 3;
    LIBRETA_ELECTORAL: 6;
    PERMISO_TEMPORAL_CPP: 7;
    PERMISO_TEMPORAL_PTP: 8;
    CARNE_IDENTIDAD: 9;
    CARNE_SOLICITANTE_REFUGIO: 10;
}>;
export declare const SLUG_PERSON_TYPE: Readonly<{
    NATURAL: 1;
    JURIDICA: 2;
    ENTIDAD: 5;
    SOCIEDAD: 7;
    LQRR: 6;
    ESTADO: 4;
}>;
export declare const SLUG_PERSON: Readonly<{
    NATURAL: "NATURAL";
    JURIDICA: "JURIDICA";
    ENTIDAD: "ENTIDAD";
    ESTADO: "ESTADO";
    SOCIEDAD: "SOCIEDAD";
    LQRR: "LOS QUE RESULTEN RESPONSABLES (LQRR)";
}>;
export declare const SLUG_OTHER: Readonly<{
    CEM: 9999;
    PROCURADURIA: 9999;
}>;
export declare const SLUG_COMPLETED: Readonly<{
    LQRR: "LOS QUE RESULTEN RESPONSABLES (LQRR)";
    NN: "NN";
    PERU: 102;
}>;
export declare const SLUG_INGRESO_DOCUMENTO: Readonly<{
    NEW: 481;
    SUBSANAR: 482;
}>;
export declare const SLUG_VALIDADO: Readonly<{
    VALIDADO_SI: 1;
    VALIDADO_NO: 0;
}>;
export declare const SLUG_MAX_LENGTH: Readonly<{
    DNI: 8;
    RUC: 11;
    CARNE_EXTRANJERIA: 9;
    PASAPORTE: 9;
    LIBRETA_ELECTORAL: 7;
    PERMISO_TEMPORAL_CPP: 9;
    PERMISO_TEMPORAL_PTP: 9;
    CARNE_IDENTIDAD: 9;
    CARNE_SOLICITANTE_REFUGIO: 9;
    CELLPHONE: 9;
    OTHER: 15;
    BUSCAR_DELITO: 30;
}>;
export declare const TIPO_PERSONA_DENUNCIA: Readonly<{
    EXTRAJERO: "EXT";
    PERUANO: "PER";
}>;
export declare const TIPO_NACIONALIDAD: Readonly<{
    EXTRAJERO: "EXTRANJERO";
    PERUANO: "PERUANO";
}>;
export declare const PARAMETRO_CONSULTA_RENIEC: Readonly<{
    USUARIO_RENIEC: "10712325";
    CLIENTE_RENIEC: "http/1";
    IP_RENIEC: "201.240.68.38";
}>;
export declare const TIPO_PARTE_INVOLUCRADO: Readonly<{
    DENUNCIANTE: "Denunciante";
    AGRAVIADO: "Agraviado";
    DENUNCIADO: "Denunciado";
}>;
export declare const DENUNCIANTE_SEXO: Readonly<{
    MASCULINO: "M";
    FEMENINO: "F";
}>;
export declare const DENUNCIANTE_GENERO: Readonly<{
    MASCULINO: "Masculino";
    FEMENINO: "Femenino";
}>;
export declare const SLUG_DENUNCIANTE_AGRAVIADO: Readonly<{
    SI: "SI";
    NO: "NO";
}>;
export declare const SLUG_IS_REMITENTE: Readonly<{
    TRUE: true;
    FALSE: false;
}>;
export declare const ES_TRADUCTOR: Readonly<{
    TRADUCTOR_SI: "SI";
    TRADUCTOR_NO: "NO";
}>;
export declare const TIPO_PERSONA_DENUNCIANTE: Readonly<{
    PERSONA_JURIDICA: "Persona Juridica";
    PERSONA_NATURAL: "Persona Natural";
}>;
export declare const PARAMETROS_CATALOGO_MUP: Readonly<{
    ESTADOCIVIL: "ID_N_EST_CIV";
    GRADOINSTRUCCION: "ID_N_GRAD_INST";
    NACIONALIDAD: "ID_N_NACIONALIDAD";
}>;
export declare const DIGITALIZAR_DOCU: Readonly<{
    DD: "DIGITALIZAR_DOCU";
    PD: "PENDIENTE_DIGITALIZAR";
}>;
export declare const SLUG_COMPONENTE_MESA: Readonly<{
    CASOS_REGISTRADOS: 1;
    PENDIENTES_DIGITALIZACION: 2;
    ADJUNTAR_DOCUMENTO: 3;
    PRESENTAR_DOCUMENTO: 4;
}>;
export declare const SLUG_MOTIVO_COPIA: Readonly<{
    COPIA_DE_COPIA: 347;
    COPIA_AUTENTICADA: 348;
}>;
export declare const SLUG_NOMBRE_MOTIVO_COPIA: Readonly<{
    ORIGINAL: "ORIGINAL";
    COPIA_SIMPLE: "COPIA SIMPLE";
}>;
export declare const SLUG_CARGO_DIGITALIZADO: Readonly<{
    FEDATARIO: "Fedatario Institucional";
}>;
export declare const SLUG_SIGN: Readonly<{
    OK: "OK";
    CANCEL: "El proceso de firma se ha cancelado, revise el log local del ciente de firma";
}>;
export declare function getProfile(id: any): "ENTIDAD" | "CIUDADANO" | "PNP" | "PJ";
export declare function getTipoDocumento(id: any): "DNI" | "PASAPORTE" | "RUC" | "CARNE EXTRANJERIA" | "SIN DOCUMENTO";
export declare function getTipoDocumentoCode(text: any): 5 | 2 | 8 | 9 | 10 | 6 | 7 | 1 | 3 | 4 | 0;
export declare function getTipoParte(id: any): "DENUNCIADO" | "DENUNCIANTE" | "AGRAVIADO" | "";
export declare function getTipoParteCode(text: any): 2 | 1 | 3 | 0;
export declare const SLUG_MESA_PARTES: Readonly<{
    ELECTRONICA: 1;
    UNICA: 2;
    DESPACHO: 3;
}>;
export declare function getErrorReniec(id: any): "" | "42202015";
export declare const TIPO_DOCUMENTO_IDENTIDAD: Readonly<{
    DNI: 1;
    RUC: 2;
    SD: 3;
    PASAPORTE: 4;
    CE: 5;
    CPP: 6;
    LE: 7;
    PARTIDA: 8;
    CI: 9;
    LM: 11;
    CEPR: 13;
    PTP: 14;
}>;
export declare const TIPO_EXTENSION_DOCUMENTO: Readonly<{
    PDF: 438;
    DOC: 436;
}>;
export declare const TIPO_TRAMITE: Readonly<{
    NUEVO_DOCUMENTO: 481;
    SUBSANAR_DOCUMENTO: 482;
}>;
export declare const TIPO_ACCION_ESTADO: Readonly<{
    REGISTRA_DOCUMENTO_DESPACHO: 65;
    REGISTRA_DOCUMENTO_ELECTRONICA: 64;
}>;
export declare const TIPO_ACCION_FIRMA: Readonly<{
    FIRMADO: 468;
    VISADO: 469;
}>;
export declare const TIPO_MESA: Readonly<{
    POR_ASIGNAR: "POR ASIGNAR";
    MD: "MD";
    MUP: "MUP";
}>;
export declare const MOTIVO_INGRESOS: Readonly<{
    MOTIVO_INGRESO_PN: " – POLICÍA NACIONAL DEL PERÚ";
    MOTIVO_INGRESO_CIU: " – DENUNCIANTE DE PARTE";
    MOTIVO_INGRESO_PJ: " – PODER JUDICIAL";
    MOTIVO_INGRESO_ENTIDAD: " – ENTIDAD";
    MOTIVO_INGRESO_MP: " – MINISTERIO PÚBLICO";
}>;
export declare const validMaxLengthCustom: (field: string | undefined, root: any) => void;
