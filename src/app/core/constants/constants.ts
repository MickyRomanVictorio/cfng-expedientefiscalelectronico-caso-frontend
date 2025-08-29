import { CasillaSeleccionable } from '@core/interfaces/comunes/casillas-seleccionables.interface';

export const CAUSALES_ARCHIVO: CasillaSeleccionable[] = [
  {
    id: 1,
    grupo: 'Causales',
    etiqueta: 'Hecho no constituye delito',
  },
  {
    id: 2,
    grupo: 'Causales',
    etiqueta: 'Extinción de la acción penal',
  },
  {
    id: 3,
    grupo: 'Causales',
    etiqueta: 'No justificable penalmente',
  },
];

export enum ID_OAID {
  PRINCIPAL = '1',
  VERSIONES = '6',
  ESCRITO = '7',
  UNKNOWN = '7', // DOCUMENTOS ADJUNTOS DE LAS FUENTES DE INVESTIGACIÓN
}

export enum TIPO_DOCUMENTO {
  AUDIO = 38,
  VIDEO = 39,
  UNKNOWN = '33', // TIPO DE DOCUMENTOS ADJUNTOS DESDE LAS FUENTES DE INVESTIGACIÓN
}
export enum TipoExportarEnum {
  Excel = 1,
  Pdf = 2,
}

export enum CodigoAlertaTramiteEnum {
  AL_FI = 'AL-FI',
  AL_FI1 = 'AL-FI1',
  AL_FI2 = 'AL-FI2',
  AL_RI3 = 'AL-RI3',
  AL_RI4 = 'AL-RI4',
  AL_DC = 'AL-DC',
  AL_DC1 = 'AL-DC1',
  AL_DC2 = 'AL-DC2',
  AL_SUP_RE1 = 'AL-SUP-RE1',
  AL_SUP_ELE1 = 'AL-SUP-ELE1',
  AL_SUP_REA1 = 'AL-SUP-REA1',
  AL_SUP_AS3 = 'AL-SUP-AS3',
  AL_SUP_OBS1 = 'AL-SUP-OBS1',
  AL_SUP_AS4 = 'AL-SUP-AS4',
  AL_SUP_AS1 = 'AL-SUP-AS1',
  AL_SUP_AS2 = 'AL-SUP-AS2',
  AL_ET2 = 'AL-ET2',
  AL_AS1 = 'AL-AS1',
  AL_AS2 = 'AL-AS2',
  AL_REA1 = 'AL-REA1',
  AL_REA2 = 'AL-REA2',
  AL_REA3 = 'AL-REA3',
  AL_REA4 = 'AL-REA4',
  AL_RE1 = 'AL-RE1',
  AL_RE2 = 'AL-RE2',
  AL_DCP = 'AL-DCP',
  AL_DCP1 = 'AL-DCP1',
  AL_DCP2 = 'AL-DCP2',
  AL_AI = 'AL-AI',
  AL_AI1 = 'AL-AI1',
  AL_AI2 = 'AL-AI2',
  AL_PI = 'AL-PI',
  AL_PI1 = 'AL-PI1',
  AL_PI2 = 'AL-PI2',
  AL_IP = 'AL-IP',
  AL_IP1 = 'AL-IP1',
  AL_IP2 = 'AL-IP2',
  AL_CC3 = 'AL-CC3',
  AL_EA1 = 'AL-EA1',
  AL_CC1 = 'AL-CC1',
  AL_SUP_PRON_ELE1 = 'AL-SUP-PRON-ELE1',
  AL_SUP_CONT1= 'AL-SUP-CONT1',
  AL_DP = 'AL-DP',
  AL_DP1 = 'AL-DP1',
  AL_DP2 = 'AL-DP2',
  AL_SUP_PRON_CONT2='AL-SUP-PRON-CONT2',
  AL_SUP_PRON_RET1='AL_SUP_PRON_RET1',
  AL_RP= 'AL-RP',
  AL_DE1 = 'AL-DE1',
  AL_DE2 = 'AL-DE2',
  AL_DA1 = 'AL-DA1',
  AL_DA2 = 'AL-DA2',
}

export enum CodigoDestinoAlertaTramiteEnum {
  PROV_FISCAL_PROVINCIAL = 'PROV_FISCAL_PROVINCIAL',
  PROV_FISCAL_ASIGNADO = 'PROV_FISCAL_ASIGNADO',
  SUP_FISCAL_SUPERIOR = 'SUP_FISCAL_SUPERIOR',
  SUP_DESPACHO_PROVINCIAL = 'SUP_DESPACHO_PROVINCIAL',
  SUP_DESPACHO_SUPERIOR = 'SUP_DESPACHO_SUPERIOR',
  SUP_USUARIO_SUPERIOR = 'SUP_USUARIO_SUPERIOR',
  SUP_USUARIO_PROVINCIAL = 'SUP_USUARIO_PROVINCIAL',
  PROV_ENTIDAD_DESPACHO_DERIVACION = 'PROV_ENTIDAD_DESPACHO_DERIVACION',
  PROV_ENTIDAD_DESPACHO_ORIGEN_DERIVACION = 'PROV_ENTIDAD_DESPACHO_ORIGEN_DERIVACION',
}

export enum TipoOrigenAlertaTramiteEnum {
  EFE = '5',
}

export enum ClasificadorExpedienteEnum {
  Principal = 0,
  Cuaderno = 1,
  CuadernoIncidental = 2,
  CuadernoEjecucion = 3,
  CuadernoExtremo = 4,
  PestaniaApelacion = 5,
  CuadernoPrueba = 6
}
