export const SYSTEM_CODE_LOGIN = '0001';
export const SYSTEM_NAME = 'efe';
export const PRODUCTION = false;
export const ENV = 'dev';
export const VERSION = '1.0.0';

export const DOMAIN_BACK_LOCAL = 'http://localhost:8080';
export const DOMAIN_BACK_LOCAL_TRAMITES = 'http://localhost:8081';
export const DOMAIN_BACK_LOCAL_SUJETOS = 'http://localhost:8082';
export const DOMAIN_BACK_LOCAL_SUPERIOR = 'http://localhost:8083';
export const DOMAIN_BACK_LOCAL_CUADERNO = 'http://localhost:8085';
export const DOMAIN_BACK_LOCAL_DOCUMENT = 'http://localhost:8081';
export const DOMAIN_BACK_LOCAL_DERIVACION = 'http://localhost:8081';
export const DOMAIN_BACK_LOCAL_MAESTROS = 'http://localhost:8080';
export const DOMAIN_BACK_MESA_DOCUMENTOS = 'http://localhost:8093';

export const DOMAIN_FRONT = 'http://localhost:4200';
export const DOMAIN_AUTH = 'http://172.16.111.112:8081';
export const DOMAIN_BACK = 'http://172.16.111.128:8081';
export const DOMAIN = 'apps.dev.ocp4.cfe.mpfn.gob.pe';

export const IP_RENIEC = '201.240.68.38';

export const DOMAIN_FRONT_NOTIFICADOR = `http://cfng-generador-notificaciones-development.apps.dev.ocp4.cfe.mpfn.gob.pe`;
export const DOMAIN_FRONT_HOME = 'http://cfng-home-development.apps.dev.ocp4.cfe.mpfn.gob.pe';
export const DOMAIN_ASSETS = 'http://172.16.111.112:8085/assets';
export const BACKEND = {

  CFE_REPORTES: `http://cfms-generales-reportes-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe`,

  CFEEXPEDIENTE: `http://cfms-expedientefiscal-electronico-gestion-api-development.${DOMAIN}/cfe/expedientefiscalelectronico/`,
  CFE_EFE : `http://cfms-expedientefiscal-electronico-gestion-api-development.${DOMAIN}/cfe/expedientefiscalelectronico`,
  //CFE_EFE : `${DOMAIN_BACK_LOCAL}/cfe/expedientefiscalelectronico`,

  CFE_EFE_TRAMITES : `http://cfms-efe-tramite-gestion-api-development.${DOMAIN}/cfe/expedientefiscalelectronico/tramite`,
  // CFE_EFE_TRAMITES : `${DOMAIN_BACK_LOCAL_TRAMITES}/cfe/expedientefiscalelectronico/tramite`,
  //CFE_EFE_TRAMITES : `http://cfms-expedientefiscal-electronico-gestion-api-development.apps.dev.ocp4.cfe.mpfn2.gob.pe:8081/cfe/cfms-expedientefiscal-electronico-gestion-api/tramite`,

  CFE_EFE_SUJETOS : `http://cfms-efe-sujeto-gestion-api-development.${DOMAIN}/cfe/expedientefiscalelectronico/sujeto`,
  //CFE_EFE_SUJETOS : `${DOMAIN_BACK_LOCAL_SUJETOS}/cfe/expedientefiscalelectronico/sujeto`,

  CFE_EFE_SUPERIOR : `http://cfms-efe-superior-gestion-api-development.${DOMAIN}/cfe/expedientefiscalelectronico/superior`,
  //CFE_EFE_SUPERIOR : `${DOMAIN_BACK_LOCAL_SUPERIOR}/cfe/expedientefiscalelectronico/superior`,
  // CFE_EFE_SUPERIOR : `http://cfms-expedientefiscal-electronico-gestion-api-development.apps.dev.ocp4.cfe.mpfn2.gob.pe:8083/cfe/expedientefiscalelectronico/superior`,

  CFE_EFE_DERIVACIONES: `http://cfms-efe-derivacion-gestion-api-development.${DOMAIN}/cfe/expedientefiscalelectronico/derivacion`,
  //CFE_EFE_DERIVACIONES: `${DOMAIN_BACK_LOCAL_DERIVACION}/cfe/expedientefiscalelectronico/derivacion`,
  //CFE_EFE_DERIVACIONES: `http://cfms-expedientefiscal-electronico-gestion-api-development.apps.dev.ocp4.cfe.mpfn2.gob.pe:8086/cfe/expedientefiscalelectronico/derivacion`,

  CFE_EFE_ALERTAS: `http://cfms-efe-alertas-gestion-api-development.${DOMAIN}/cfe/expedientefiscalelectronico/alertas`,
  //CFE_EFE_ALERTAS: `http://localhost:8080`,

  CFMFIRMADIGITAL: `http://cfms-generales-firmadigital-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/firmadigital/v1/t/firmadigital/`,

  CFEMAESTROSDOCUMENTOS: `http://cfms-generales-documentos-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/documento/`,
  //CFEMAESTROSDOCUMENTOS: `http://localhost:8080/cfe/generales/documento/`,

  CFMREPOSITORIO: `http://cfms-generales-almacenamiento-objetos-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/objetos/v1/t/almacenamiento/publico/`,
  NOTDOCUMENTOS: `http://cfms-notificaciones-documentos-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generador/documentos/v1/repositorio`,
  CFETURNO: 'http://localhost:8080/cfe/mesadeturno/v1',
  CFE_GESTOR_DOCUMENTAL: `http://cfms-generales-gestor-documental-api-development.${DOMAIN}/cfe/generales/gestordocumental`,

  CFEMAESTROS: `http://cfms-generales-maestros-gestion-api-development.${DOMAIN}/cfe/generales/maestro/`,
  CFEPERSONA: `http://cfms-generales-persona-cliente-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/persona`,
  CFENOTIFICACIONES: `http://cfms-notificaciones-generador-gestion-api-development.${DOMAIN}/cfe/generador/v1`,

  CFETOKEN: `http://cfms-sad-administracion-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/sad/administracion/v1/e/sesion/tokenSesion-new`,
  //CFETOKEN: `${DOMAIN_AUTH}/cfetoken/resources/v2/loginToken`,

  /*MESA UNICA-DESPACHO*/
  MESA_UNICA_DESPACHO: `http://cfms-mesadepartes-unicadespacho-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/mesadepartes/unicadespacho/`,
  MS_PERSONA: `http://cfms-generales-persona-cliente-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/persona/v1/`,
  MESA_DOCUMENTO: `http://cfms-mesadepartes-documentos-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/mesadepartes/documentos/`,
  FIRMA_CLIENTE: `http://cfms-generales-firmadigital-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/firmadigital/v1/t/firmadigital/`,
  REPOSITORIO_DOCUMENTO: `http://cfms-generales-almacenamiento-objetos-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/objetos/v1/t/almacenamiento/publico/`,
  REPOSITORIO_DOCUMENTO_ALFRESCO: `http://cfms-generales-almacenamiento-objetos-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/objetos/v2/t/almacenamiento/publico/`,
  SUNAT: `http://cfms-generales-persona-cliente-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/persona/v1/e/padronsunat/`,
  CFE_EFE_CUADERNO: `http://cfms-efe-cuaderno-gestion-api-development.${DOMAIN}/cfe/expedientefiscalelectronico/cuaderno`,
  CFE_EFE_REPOSITORIO_PUBLICO: `http://cfms-generales-repositorio-publico-api-development.${DOMAIN}`,
  REPOSITORIO_DOCUMENTO_PRIVADO: `http://cfms-generales-almacenamiento-objetos-api-development.${DOMAIN}/cfe/generales/objetos/v2/t/almacenamiento/privado`,
  //CFE_EFE_CUADERNO:`${DOMAIN_BACK_LOCAL_CUADERNO}/cfe/expedientefiscalelectronico/cuaderno`

  CFEAPLICACIONES: `http://cfms-sad-administracion-gestion-api-development.${DOMAIN}/cfe/sad/administracion/v1/e/usuario/listarAplicaciones/`,
  CFEOPCIONES: `http://cfms-sad-administracion-gestion-api-development.${DOMAIN}/cfe/sad/administracion/v1/e/usuario/listarOpcionesByUsuarioApliacion/`
};

export const CRYPT_KEY = 'a1b2c3z28';

export const LOCALSTORAGE = {
  TOKEN_KEY: 'dG9rZW4=',
  REFRESH_KEY: 'cmVmcmVzaA==',
  VALIDATE_KEY: 'dmFsaWRhdGlvbg==',
  DENUNCIA_KEY: 'ZGVudW5jaWE=',
  PRECARGO_KEY: 'cHJlY2FyZ28=',
  DELITO_KEY: 'ZGVudW5jaWE=',
  NOMBRE_DOCUMENTO_KEY: 'bm9tYnJlIGRvY3VtZW50bw==',
  CASO_KEY: 'aWQgY2Fzbw==',
  ETAPA_KEY: 'Y2FzbyBldGFwYQ==',
  CASO_OBJETO_KEY: 'Y2FzbyBvYmpldG8=',
  TAB_DETALLE_SELECCIONADO_KEY: 'dGFiIGRldGFsbGUgc2VsZWNjaW9uYWRv',
  TRAMITE_RSP_KEY: 'xewk5Xpc9TU=',
  TIPO_OPCION_CASO_FISCAL:'_TOCF='
};

export const UTILS = {
  DEFAULT_PHOTO:
    'data:image/png;base64,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gEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASASEIAiCQEgEhCAIgkBIBIQgCIJASA5O+//wOLjh4vtTasQgAAAABJRU5ErkJggg==',
};
export const TAMANIO_EN_MEGABYTES: number = 100;
export const TAMANIO_MAXIMO_ARCHIVO_AUDIOS :number = TAMANIO_EN_MEGABYTES * 1024 * 1024; // 100MB en bytes

