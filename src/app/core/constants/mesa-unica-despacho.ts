export const Constante = {
  DENUNCIA_REGISTRADA: 'denunciaRegistrada',
};

export type ProfileType = 628 | 629 | 630 | 631;

export type EntityType = 175 | 173 | 174;

export const SLUG_PROFILE = Object.freeze({
  CIUDADANO: 1,
  PNP: 2,
  ENTIDAD: 3,
  PJ: 4,
  MP: 21,
});

export const CODIGO_TIPO_DOCUMENTO = Object.freeze({
  DNI: 1,
  RUC: 2,
  PASAPORTE: 4,
  CE: 5,
});

export function getGeneroAbreviado(id: any) {
  switch (id) {
    case 1:
      return 'M';
    case 211:
      return 'M';
    case 2:
      return 'F';
    case 212:
      return 'F';
    default:
      return '';
  }
}
export const TIPO_PARTE = {
  3: 'DENUNCIANTE',
  2: 'DENUNCIADO',
  1: 'AGRAVIADO',
};
export const SLUG_TIPO_PARTE = Object.freeze({
  DENUNCIANTE: 'DENUNCIANTE',
  DENUNCIADO: 'DENUNCIADO',
  AGRAVIADO: 'AGRAVIADO',
});

export const SLUG_ERROR_RENIEC = Object.freeze({
  DNI_INVALIDO: '42202015',
  SERVICIO_RENIEC_NO_DISPONIBLE: '42202017',
});

export const SLUG_TIPO_PARTE_CODE = Object.freeze({
  AGRAVIADO: 1,
  DENUNCIADO: 2,
  DENUNCIANTE: 3,
});

export const SLUG_ERROR_RENIEC_CODE = Object.freeze({
  CODE_DNI_INVALIDO: '42202015',
});

export const SLUG_ENTITY = Object.freeze({
  JURIDICA: 175 as EntityType,
  PROCURADURIA: 173 as EntityType,
  CEM: 174 as EntityType,
});

export const SLUG_ENTITY_MP = Object.freeze({
  RAZON_SOCIAL: 'MINISTERIO PÚBLICO - GERENCIA GENERAL',
  RUC: '20131370301',
  MP: 2,
});

export const SLUG_TIPO_RIESGOS_KEY = Object.freeze({
  LEVE: 'LEVE',
  MODERADO: 'MODERADO',
  SEVERO: 'SEVERO',
});

export const SLUG_TIPO_RIESGOS = Object.freeze({
  LEVE: 'Leve',
  MODERADO: 'Moderado',
  SEVERO: 'Severo',
});

export const SLUG_TIPO_VIOLENCIA = Object.freeze({
  FISICA: 'Física',
  PSICOLOGICA: 'Psicológica',
  SEXUAL: 'Sexual',
  PATRIMONIAL: 'Patrimonial',
});

export const SLUG_TIPO_VIOLENCIA_KEY = Object.freeze({
  FISICA: 'FISICA',
  PSICOLOGICA: 'PSICOLOGICA',
  SEXUAL: 'SEXUAL',
  PATRIMONIAL: 'PATRIMONIAL',
});

export const SLUG_PENDING_RESPONSE = Object.freeze({
  NEW: 'E',
  CONTINUE: 'C',
});

export const SLUG_CONFIRM_RESPONSE = Object.freeze({
  OK: 'OK',
  CANCEL: 'CANCEL',
  ALL: 'ALL',
  VALIDATION: 'VALIDATION',
});

export const SLUG_INVOLVED = Object.freeze({
  AGRAVIADO: 'agraviado',
  DENUNCIADO: 'denunciado',
  DENUNCIANTE: 'denunciante',
});

export const SLUG_INVOLVED_CODE = Object.freeze({
  AGRAVIADO: 1,
  DENUNCIADO: 2,
  DENUNCIANTE: 3,
});

export const SLUG_INVOLVED_ROL = Object.freeze({
  CONOCIDO: 'conocido',
  DESCONOCIDO: 'desconocido',
  // DENUNCIANTE: 'denunciante',
  // OTRO: 'otro',
  ENTIDAD: 'entidad',
  PERSONAN_NATURAL: 'persona-natural',
});
export const SLUG_DOCUMENT = Object.freeze({
  DNI: 'DNI',
  RUC: 'RUC',
  CARNE_EXTRANJERIA: 'CARNE EXTRANJERIA',
  PASAPORTE: 'PASAPORTE',
  SIN_DOCUMENTO: 'SIN DOCUMENTO',
  LIBRETA_ELECTORAL: 'LIBRETA ELECTORAL',
  PERMISO_TEMPORAL_CPP: 'PERMISO TEMPORAL CPP',
  PERMISO_TEMPORAL_PTP: 'PERMISO TEMPORAL PTP',
  CARNE_IDENTIDAD: 'CARNE IDENTIDAD',
  CARNE_SOLICITANTE_REFUGIO: 'CARNE DE SOLICITANTE DE REFUGIO',
});
export const SLUG_DOCUMENT_TYPE = Object.freeze({
  DNI: 1,
  RUC: 2,
  CARNE_EXTRANJERIA: 5,
  PASAPORTE: 4,
  SIN_DOCUMENTO: 3,
  LIBRETA_ELECTORAL: 6,
  PERMISO_TEMPORAL_CPP: 7,
  PERMISO_TEMPORAL_PTP: 8,
  CARNE_IDENTIDAD: 9,
  CARNE_SOLICITANTE_REFUGIO: 10,
});

export const SLUG_PERSON_TYPE = Object.freeze({
  NATURAL: 1,
  JURIDICA: 2,
  ENTIDAD: 5,
  SOCIEDAD: 7,
  LQRR: 6,
  ESTADO: 4,
});

export const SLUG_PERSON = Object.freeze({
  NATURAL: 'NATURAL',
  JURIDICA: 'JURIDICA',
  ENTIDAD: 'ENTIDAD',
  ESTADO: 'ESTADO',
  SOCIEDAD: 'SOCIEDAD',
  LQRR: 'LOS QUE RESULTEN RESPONSABLES (LQRR)',
});

export const SLUG_OTHER = Object.freeze({
  CEM: 9999,
  PROCURADURIA: 9999,
});
export const SLUG_COMPLETED = Object.freeze({
  LQRR: 'LOS QUE RESULTEN RESPONSABLES (LQRR)',
  NN: 'NN',
  PERU: 102,
});

export const SLUG_INGRESO_DOCUMENTO = Object.freeze({
  NEW: 481,
  SUBSANAR: 482,
});
export const SLUG_VALIDADO = Object.freeze({
  VALIDADO_SI: 1,
  VALIDADO_NO: 0,
});
export const SLUG_MAX_LENGTH = Object.freeze({
  DNI: 8,
  RUC: 11,
  CARNE_EXTRANJERIA: 9, //e
  PASAPORTE: 9, //e 5-12
  LIBRETA_ELECTORAL: 7, //e
  PERMISO_TEMPORAL_CPP: 9, //e
  PERMISO_TEMPORAL_PTP: 9, //e
  CARNE_IDENTIDAD: 9, //e
  CARNE_SOLICITANTE_REFUGIO: 9, //e
  CELLPHONE: 9,
  OTHER: 15,
  BUSCAR_DELITO: 30,
});

export const TIPO_PERSONA_DENUNCIA = Object.freeze({
  EXTRAJERO: 'EXT',
  PERUANO: 'PER',
});

export const TIPO_NACIONALIDAD = Object.freeze({
  EXTRAJERO: 'EXTRANJERO',
  PERUANO: 'PERUANO',
});

export const PARAMETRO_CONSULTA_RENIEC = Object.freeze({
  USUARIO_RENIEC: '10712325',
  CLIENTE_RENIEC: 'http/1',
  IP_RENIEC: '201.240.68.38',
});

export const TIPO_PARTE_INVOLUCRADO = Object.freeze({
  DENUNCIANTE: 'Denunciante',
  AGRAVIADO: 'Agraviado',
  DENUNCIADO: 'Denunciado',
});

export const DENUNCIANTE_SEXO = Object.freeze({
  MASCULINO: 'M',
  FEMENINO: 'F',
});

export const DENUNCIANTE_GENERO = Object.freeze({
  MASCULINO: 'Masculino',
  FEMENINO: 'Femenino',
});

export const SLUG_DENUNCIANTE_AGRAVIADO = Object.freeze({
  SI: 'SI',
  NO: 'NO',
});
export const SLUG_IS_REMITENTE = Object.freeze({
  TRUE: true,
  FALSE: false,
});

export const ES_TRADUCTOR = Object.freeze({
  TRADUCTOR_SI: 'SI',
  TRADUCTOR_NO: 'NO',
});

export const TIPO_PERSONA_DENUNCIANTE = Object.freeze({
  PERSONA_JURIDICA: 'Persona Juridica',
  PERSONA_NATURAL: 'Persona Natural',
});

export const PARAMETROS_CATALOGO_MUP = Object.freeze({
  ESTADOCIVIL: 'ID_N_EST_CIV',
  GRADOINSTRUCCION: 'ID_N_GRAD_INST',
  NACIONALIDAD: 'ID_N_NACIONALIDAD',
});

export const DIGITALIZAR_DOCU = Object.freeze({
  DD: 'DIGITALIZAR_DOCU',
  PD: 'PENDIENTE_DIGITALIZAR',
});

export const SLUG_COMPONENTE_MESA = Object.freeze({
  CASOS_REGISTRADOS: 1,
  PENDIENTES_DIGITALIZACION: 2,
  ADJUNTAR_DOCUMENTO: 3,
  PRESENTAR_DOCUMENTO: 4,
});

export const SLUG_MOTIVO_COPIA = Object.freeze({
  COPIA_DE_COPIA: 347,
  COPIA_AUTENTICADA: 348,
});

export const SLUG_NOMBRE_MOTIVO_COPIA = Object.freeze({
  ORIGINAL: 'ORIGINAL',
  COPIA_SIMPLE: 'COPIA SIMPLE',
});

export const SLUG_CARGO_DIGITALIZADO = Object.freeze({
  FEDATARIO: 'Fedatario Institucional',
});

export const SLUG_SIGN = Object.freeze({
  OK: 'OK',
  CANCEL:
    'El proceso de firma se ha cancelado, revise el log local del ciente de firma',
});

export function getProfile(id: any) {
  switch (id) {
    case SLUG_PROFILE.CIUDADANO === id:
      return 'CIUDADANO';
    case SLUG_PROFILE.PNP === id:
      return 'PNP';
    case SLUG_PROFILE.PJ === id:
      return 'PJ';
    case SLUG_PROFILE.ENTIDAD === id:
      return 'ENTIDAD';
    default:
      return 'CIUDADANO';
  }
}
export function getTipoDocumento(id: any) {
  switch (id) {
    case SLUG_DOCUMENT_TYPE.DNI:
      return SLUG_DOCUMENT.DNI;
    case SLUG_DOCUMENT_TYPE.RUC:
      return SLUG_DOCUMENT.RUC;
    case SLUG_DOCUMENT_TYPE.CARNE_EXTRANJERIA:
      return SLUG_DOCUMENT.CARNE_EXTRANJERIA;
    case SLUG_DOCUMENT_TYPE.PASAPORTE:
      return SLUG_DOCUMENT.PASAPORTE;

    default:
      return SLUG_DOCUMENT.SIN_DOCUMENTO;
  }
}
export function getTipoDocumentoCode(text: any) {
  switch (text) {
    case SLUG_DOCUMENT.DNI:
      return SLUG_DOCUMENT_TYPE.DNI;
    case SLUG_DOCUMENT.RUC:
      return SLUG_DOCUMENT_TYPE.RUC;
    case SLUG_DOCUMENT.CARNE_EXTRANJERIA:
      return SLUG_DOCUMENT_TYPE.CARNE_EXTRANJERIA;
    case 'CARNE EXTRANJERÍA':
      return SLUG_DOCUMENT_TYPE.CARNE_EXTRANJERIA;
    case SLUG_DOCUMENT.LIBRETA_ELECTORAL:
      return SLUG_DOCUMENT_TYPE.LIBRETA_ELECTORAL;
    case SLUG_DOCUMENT.PERMISO_TEMPORAL_CPP:
      return SLUG_DOCUMENT_TYPE.PERMISO_TEMPORAL_CPP;
    case SLUG_DOCUMENT.PERMISO_TEMPORAL_PTP:
      return SLUG_DOCUMENT_TYPE.PERMISO_TEMPORAL_PTP;
    case SLUG_DOCUMENT.CARNE_IDENTIDAD:
      return SLUG_DOCUMENT_TYPE.CARNE_IDENTIDAD;
    case SLUG_DOCUMENT.CARNE_SOLICITANTE_REFUGIO:
      return SLUG_DOCUMENT_TYPE.CARNE_SOLICITANTE_REFUGIO;
    case SLUG_DOCUMENT.PASAPORTE:
      return SLUG_DOCUMENT_TYPE.PASAPORTE;

    case SLUG_DOCUMENT.SIN_DOCUMENTO:
      return SLUG_DOCUMENT_TYPE.SIN_DOCUMENTO;
    default:
      return 0;
  }
}
export function getTipoParte(id: any) {
  switch (id) {
    case SLUG_TIPO_PARTE_CODE.DENUNCIANTE:
      return SLUG_TIPO_PARTE.DENUNCIANTE;
    case SLUG_TIPO_PARTE_CODE.DENUNCIADO:
      return SLUG_TIPO_PARTE.DENUNCIADO;
    case SLUG_TIPO_PARTE_CODE.AGRAVIADO:
      return SLUG_TIPO_PARTE.AGRAVIADO;

    default:
      return '';
  }
}
export function getTipoParteCode(text: any) {
  switch (text) {
    case SLUG_TIPO_PARTE.DENUNCIANTE:
      return SLUG_TIPO_PARTE_CODE.DENUNCIANTE;
    case SLUG_TIPO_PARTE.DENUNCIADO:
      return SLUG_TIPO_PARTE_CODE.DENUNCIADO;
    case SLUG_TIPO_PARTE.AGRAVIADO:
      return SLUG_TIPO_PARTE_CODE.AGRAVIADO;

    default:
      return 0;
  }
}

export const SLUG_MESA_PARTES = Object.freeze({
  ELECTRONICA: 1,
  UNICA: 2,
  DESPACHO: 3,
});

export function getErrorReniec(id: any) {
  switch (id) {
    case SLUG_ERROR_RENIEC_CODE.CODE_DNI_INVALIDO:
      return SLUG_ERROR_RENIEC.DNI_INVALIDO;
    default:
      return '';
  }
}

export const TIPO_DOCUMENTO_IDENTIDAD = Object.freeze({
  DNI: 1,
  RUC: 2,
  SD: 3,
  PASAPORTE: 4,
  CE: 5,
  CPP: 6,
  LE: 7,
  PARTIDA: 8,
  CI: 9,
  LM: 11,
  CEPR: 13,
  PTP: 14,
});

export const TIPO_EXTENSION_DOCUMENTO = Object.freeze({
  PDF: 438,
  DOC: 436,
});

export const TIPO_TRAMITE = Object.freeze({
  NUEVO_DOCUMENTO: 481,
  SUBSANAR_DOCUMENTO: 482,
});

export const TIPO_ACCION_ESTADO = Object.freeze({
  REGISTRA_DOCUMENTO_DESPACHO: 65,
  REGISTRA_DOCUMENTO_ELECTRONICA: 64,
});

export const TIPO_ACCION_FIRMA = Object.freeze({
  FIRMADO: 468,
  VISADO: 469,
});

export const TIPO_MESA = Object.freeze({
  POR_ASIGNAR: 'POR ASIGNAR',
  MD: 'MD',
  MUP: 'MUP',
});

export const MOTIVO_INGRESOS = Object.freeze({
  MOTIVO_INGRESO_PN: ' – POLICÍA NACIONAL DEL PERÚ',
  MOTIVO_INGRESO_CIU: ' – DENUNCIANTE DE PARTE',
  MOTIVO_INGRESO_PJ: ' – PODER JUDICIAL',
  MOTIVO_INGRESO_ENTIDAD: ' – ENTIDAD',
  MOTIVO_INGRESO_MP: ' – MINISTERIO PÚBLICO',
});

export const validMaxLengthCustom = (
  field: string = 'dni',
  root: any
): void => {
  let value: string = '';
  let maxLength: number = 0;
  let control: any = null;
  switch (field) {
    case 'txtAbogadoDni':
      control = root.formAbogado.get(field);
      maxLength = 8;
      break;
    case 'txtNombreAbogado':
      control = root.formAbogado.get(field);
      maxLength = 60;
      break;
    case 'txtApePatAbogado':
      control = root.formAbogado.get(field);
      maxLength = 40;
      break;
    case 'txtApeMatAbogado':
      control = root.formAbogado.get(field);
      maxLength = 40;
      break;
    case 'dni':
    case 'dnipnp':
    case 'dnipj':
    case 'dniMp':
    case 'dniEntidad':
      if (root.TIPO_USUARIO_DENUNCIANTE === 'CIU') {
        control = root.validarFormCiudadano.get(field);
      }
      if (root.TIPO_USUARIO_DENUNCIANTE === 'PNP') {
        control = root.validarFormPerfilPNP.get(field);
      }
      if (root.TIPO_USUARIO_DENUNCIANTE === 'PJU') {
        control = root.poderJudicialForm.get(field);
      }
      if (root.TIPO_USUARIO_DENUNCIANTE === 'ENT') {
        control = root.validarFormEntidad.get(field);
      }
      if (root.TIPO_USUARIO_DENUNCIANTE === 'MIN') {
        control = root.validarFormMP.get(field);
      }
      maxLength = 8;
      break;
    case 'ce':
    case 'txtNombreCiudadano':
      control = root.validarFormCiudadano.get(field);
      maxLength = 60;
      break;
    case 'txtApePaternoCiudadano':
      control = root.validarFormCiudadano.get(field);
      maxLength = 40;
      break;
    case 'txtApeMaternoCiudadano':
      control = root.validarFormCiudadano.get(field);
      maxLength = 40;
      break;
    case 'documCe':
      if (root.TIPO_USUARIO_DENUNCIANTE === 'CIU') {
        control = root.validarFormCiudadano.get(field);
      }
      maxLength = 12;
      break;
    case 'collegeCode':
    case 'collegeCodePj':
    case 'codigoCip':
    case 'entidadCollegeCodePeJu':
    case 'numeroExpediente':
      if (root.TIPO_USUARIO_DENUNCIANTE === 'CIU') {
        control = root.validarFormCiudadano.get(field);
      }
      if (root.TIPO_USUARIO_DENUNCIANTE === 'PNP') {
        control = root.validarFormPerfilPNP.get(field);
      }
      if (root.TIPO_USUARIO_DENUNCIANTE === 'PJU') {
        control = root.poderJudicialForm.get(field);
      }
      if (root.TIPO_USUARIO_DENUNCIANTE === 'ENT') {
        control = root.validarFormEntidad.get(field);
      }
      maxLength = 30;
      break;
    case 'informePolicial':
      control = root.validarFormPerfilPNP.get(field);
      maxLength = 60;
      break;
    case 'numeroDependencia':
      control = root.validarFormPerfilPNP.get(field);
      maxLength = 5;
      break;
    case 'ruc':
      control = root.validarFormEntidad.get(field);
      maxLength = 11;
      break;
    case 'txtEmailAbogado':
      control = root.formAbogado.get(field);
      maxLength = 100;
      break;
    case 'txtColegioAbogado':
      control = root.formAbogado.get(field);
      maxLength = 5;
      break;
    case 'txtDocExtrajero':
    case 'txtDocExtrajeroPn':
    case 'txtDocExtrajeroPj':
    case 'dniEntidadPasaporte':
      control = root.validarFormCiudadano.get(field);
      if (root.TIPO_USUARIO_DENUNCIANTE === 'PNP') {
        control = root.validarFormPerfilPNP.get(field);
      }
      if (root.TIPO_USUARIO_DENUNCIANTE === 'PJU') {
        control = root.poderJudicialForm.get(field);
      }
      if (root.TIPO_USUARIO_DENUNCIANTE === 'ENT') {
        control = root.validarFormEntidad.get(field);
      }
      maxLength = 20;
      break;
    case 'txtAnexos':
    case 'txtFolios':
      control = root.anexosForm.get(field);
      maxLength = 6;
      break;
    case 'obsAnexos':
      control = root.anexosForm.get(field);
      maxLength = 1000;
      break;
    case 'txtCelularAbogado':
      control = root.formAbogado.get(field);
      maxLength = 9;
      break;
    case 'anexoPnp':
    case 'phoneCiudadanoPn':
      control = root.validarFormPerfilPNP.get(field);
      maxLength = 9;
      break;
    case 'phone':
      control = root.validarFormCiudadano.get(field);
      maxLength = 9;
      break;
    case 'celularEntidad':
      control = root.validarFormEntidad.get(field);
      maxLength = 9;
      break;
    case 'phoneMp':
      control = root.validarFormMP.get(field);
      maxLength = 9;
      break;
    case 'nroOficioMp':
      control = root.validarFormMP.get(field);
      maxLength = 30;
      break;
    case 'anexoComisaria':
      control = root.validarFormPerfilPNP.get(field);
      maxLength = 4;
      break;
    case 'email':
      control = root.validarFormCiudadano.get(field);
      maxLength = 100;
      break;
    case 'emailEntidad':
      control = root.validarFormEntidad.get(field);
      maxLength = 100;
      break;

    case 'emailPj':
      control = root.poderJudicialForm.get(field);
      maxLength = 100;
      break;
    case 'emailCiudadanoPn':
      control = root.validarFormPerfilPNP.get(field);
      maxLength = 100;
      break;
    case 'emailPnp':
      control = root.validarFormPerfilPNP.get(field);
      maxLength = 100;
      break;
    case 'phonePj':
    case 'txtCelularPj':
      control = root.poderJudicialForm.get(field);
      maxLength = 9;
      break;
    default:
      control = root.dynamicValidationForm.get(field);
      maxLength = field === 'dniDigit' ? 1 : 6;
      break;
  }
  value = control.value;
  value.length > maxLength && control.setValue(value.slice(0, maxLength));
};
