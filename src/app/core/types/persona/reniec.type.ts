import { ListItemResponse } from "../mesa-turno/response/Response";

export type ConsultaPersonaNatural = {
  numeroDocumento: string;
  ip: string;
}

export type ConsultaPersonaNaturalResponse = {

  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  edad: number;
  codigoGenero: string;
  codigoPaisNacimiento: null | string;
  codigoPaisDomicilio: null | string;
  codigoDepartamentoDomicilio: string;
  codigoProvinciaDomicilio: string;
  codigoDistritoDomicilio: string;
  ubigeoDomicilio: string;
  codigoPrefijoDomicilio: string;
  direccionDomicilio: string;
  etapaDomicilio: string;
  interiorDomicilio: string;
  tipoUrbanizacion: string;
  urbanizacion: string;
  manzanaDomicilio: string;
  loteDomicilio: string;
  validado: null | string;
  esMenorEdad: "SI" | "NO";
  codigoGradoInstruccion: string;
  nombrePadre: string;
  nombreMadre: string;
  apellidoMaternoMadre: null | string;
  apellidoMaternoPadre: null | string;
  apellidoPaternoMadre: null | string;
  apellidoPaternoPadre: null | string;
  foto: string;
  tipoEstadoCivil: string;
  descripcionSexo: string
};

export type CatalogoItem = {
  noDescripcion: string,
  id: number,
}

export type CatalogoResponse = {
  code: number,
  message: string,
  data: CatalogoItem[]
}

/**
 * CATALAGO: 'ID_N_GENERO'
 */
export const LISTA_GENEROS: ListItemResponse[] = [
  { id: 1, nombre: "MASCULINO" },
  { id: 2, nombre: "FEMENINO" }
];


export const LISTA_ESTADO_CIVIL: ListItemResponse[] = [
  { id: 1, nombre: 'VIUDO' },
  { id: 2, nombre: 'DIVORCIADO' },
  { id: 3, nombre: 'OTRO' },
  { id: 4, nombre: 'SOLTERO' },
  { id: 4, nombre: 'CASADO' }
];

export const GRUPOS_CATALOGO = {
  ESTADO_CIVIL: 'ID_N_EST_CIV',
  ORIGEN_TURNO: 'ID_N_ORIGEN_TURNO',
  TIPO_ACTA: 'ID_N_TIPO_ACTA',
}


export const ERROR_RENIEC = {
  DNI_INVALIDO: 42202015,
  ERROR_SERVICIO: 42202017

}

export const TIPO_DOCUMENTO = {
  DNI: 1,
  CARNE_EXTRANJERIA: 5,
  SIN_DOCUMENTO: 3,
  RUC: 2,
  LIBRETA_ELECTORAL: 7,
  LIBRETA_MILITAR: 11,
  PARTIDA_DE_NACIMIENTO: 8,
  CARNE_IDENTIDAD: 9,
  CARNE_DE_SOLICITUD_DE_REFUGIO: 13,
  PASAPORTE: 4,
  PERMISO_CPP: 6,
  PERMISO_PTP: 14,
  SIN_DOCUMENTO15: 15
}

export const TIPO_DOMICILIO = {
  RENIEC: 5,
  RENIEC_LABEL: 'RENIEC',
  LABORAL: 4,
  LABORAL_LABEL: 'LABORAL',
  SUNAT: 6,
  SUNAT_LABEL: 'SUNAT',
  LEGAL: 2,
}

export const SI_NO_RESPUESTA: any = {
  SI: 1,
  NO: 0,
}

export const SI_NO_CONTROL = Object
  .keys(SI_NO_RESPUESTA)
  .map(key => { return { value: SI_NO_RESPUESTA[key], label: key } });



export type DireccionPartes = {
  tipoDireccion?: number;
  tipoDireccionLabel?: string;
  pais?: number;
  paisLabel?: string;
  departamento?: string;
  departamentoLabel?: string;
  provincia?: string;
  provinciaLabel?: string;
  distrito?: string;
  distritoLabel?: string;
  centroPoblado?: string;
  centroPobladoLabel?: string;
  tipoVia?: string;
  tipoViaLabel?: string;
  nombreCalle?: string;
  numeroDireccion?: string;
  tipoUrbanizacion?: string;
  tipoUrbanizacionLabel?: string;
  nombreUrbanizacion?: string;
  block?: string;
  interior?: string;
  etapa?: string;
  manzana?: string;
  lote?: string;
  referencia?: string;
  usarMaps?: boolean;
  latitud?: number;
  longitud?: number;
  direccionMaps?: string;
};

