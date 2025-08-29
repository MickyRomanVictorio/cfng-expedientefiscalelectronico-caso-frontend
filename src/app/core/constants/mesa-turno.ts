import { BACKEND } from '@environments/environment';

export const Constants = {
  LOADING: 'loading',
  MSG_LOADING: 'msg_loading',
  TOKEN_NAME: 'access_token',
  TOKEN_PROFILE: 'access_token_profile',
  DECODE_TOKEN: 'decode_token',
  CALL_FAILED: 'call_failed',
  CODE_TIMER: 'code_timer',
  RESENT_TIMER: 'resent_timer',
  INFO: 'info',
  MAX_DOCUMENTS_PER_DEPENDENT: 5,
};

export const TIPOS_DENUNCIA:any = {
    "detenido": { titulo: "Registrar detenido", id: 359 },
    "defuncion": { titulo: "Registrar defunción", id: 360 },
    "actos-urgentes": { titulo: "Registrar actos urgentes", id: 361 },
    "investigacion-de-oficio": { titulo: "Registrar investigación de oficio", id: 363 },
    "denuncia-verbal": { titulo: "Registrar denuncia verbal", id: 362 },

} as const;

export const amPm = {
  AM: 'AM',
  PM: 'PM',
} as const;

export const CODIGOS_TIPO_DENUNCIA = {
  DETENIDO: 359,
  DEFUNCION: 360,
  ACTOS_URGENTES: 361,
  INVESTIGACION_DE_OFICIO: 363,
  DENUNCIA_VERBAL: 362,
};

export const ESTADO_REGISTRO = {
  COMPLETO: 'Completado',
  PENDIENTE: 'Pendiente',
};

export const MENSAJES = {
  VISTA_PRELIMINAR_INFORMATIVO_OFICIO:
    'Por favor, revise detalladamente los datos de la denuncia, antes de proceder con el registro en el sistema',
  VISTA_PRELIMINAR_INFORMATIVO_OTROS:
    'Por favor, revise detalladamente los datos de la denuncia, antes de proceder a completar el registro en el sistema.',
  CONFIRMAR_REGISTRAR_DENUNCIA: '¿Está seguro de registrar la denuncia?',
  CONFIRMAR_COMPLETAR_DENUNCIA: '¿Está seguro de completar la denuncia?',
  CONFIRMAR_DESCRIPCION_OFICIO:
    'Estimado(a) usuario(a), está a punto de registrar el caso de turno. Esta acción no podrá revertirse. Por favor, confirme si desea registrar la denuncia.',
  CONFIRMAR_DESCRIPCION_OTROS:
    'Estimado(a) usuario(a), está a punto de completar el registro de la denuncia de turno. Esta acción no podrá revertirse. Por favor, confirme si desea completar el registro',
  CASO_COMPLETADO_CORRECTAMENTE_OFICIO:
    'Caso de turno registrado correctamente, si desea puede imprimir el cargo de ingreso de la denuncia.',
  CASO_COMPLETADO_CORRECTAMENTE_OTROS:
    'Caso de turno completado correctamente, si desea puede imprimir el cargo de ingreso de la denuncia.',
};

export const TIPO_PARTE_SUJETOS = {
  AGRAVIADO: 1,
  DENUNCIADO: 2,
  DENUNCIANTE: 3,
  IMPUTADO: 4,
};

export const TIPO_CONDICION = {
  NOFALLECIDO: 17,
};

export const FIRMA_URL: string = `${BACKEND.CFMFIRMADIGITAL}`;
export const REPOSITORIO_DOCUMENTO_URL: string = `${BACKEND.CFMREPOSITORIO}`;
export const PARAM_TOKEN: string = '123456';
