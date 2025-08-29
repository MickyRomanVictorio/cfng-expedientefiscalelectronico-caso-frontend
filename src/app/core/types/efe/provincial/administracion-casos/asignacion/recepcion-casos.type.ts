export const NOMBRES_CABECERA_RECEPCION = [
  'Número de Caso',
  'Origen',
  'Remitente',
  'Contacto de Remitente',
  'Fecha de Ingreso',
  //'Fecha de Asignación',
];

export enum PLAZO_CONSTANTES {
  DENTRO_PLAZO = 1,
  POR_VENCER = 2,
  VENCIDO = 3
};

export enum LECTURA_CASO {
  LEIDO = 1,
  NO_LEIDO = 0,
};

export const FILTER_OPTIONS = [
  { name: 'caseCode', isVisible: true },
  { name: 'plazos', isVisible: true },
  { name: 'origen', isVisible: true },
  { name: 'fasignacion', isVisible: true },
];

export const CONSTANTE_PAGINACION = {
  FIRST: 0,
  ROWS: 10
}
