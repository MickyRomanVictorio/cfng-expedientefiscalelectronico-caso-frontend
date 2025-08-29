import { FiltroTramite } from '@core/interfaces/provincial/bandeja-tramites/FiltroTramite';

export const ID_ETAPA = Object.freeze({
  CALIFICACION: '01',
  PRELIMINAR: '02',
  PREPARATORIA: '03',
  INTERMEDIA: '04',
  JUZGAMIENTO: '05',
  EJECUCION_SENTENCIA_PC: '06',
  INCOACION_PROCESO_INMEDIATO: '07',
  JUICIO_INMEDIATO: '08',
  EJECUCION_SENTENCIA_PE: '09',
  PROGRAMACION_JUICIO_ORAL: '10',
  DESARROLLO_JUICIO_ORAL: '11',
  SENTENCIA: '12',
  PROGRAMACION_JUICIO_ORAL_PE: '13',
  DESARROLLO_JUICIO_ORAL_PE: '14',
  SENTENCIA_PE: '15',
});

export const ETAPA = [
  {
    id: ID_ETAPA.CALIFICACION,
    nombre: 'Calificación',
    path: 'calificacion',
    tipoProceso: 1,
  },
  {
    id: ID_ETAPA.PRELIMINAR,
    nombre: 'Preliminar',
    path: 'preliminar',
    tipoProceso: 1,
  },
  {
    id: ID_ETAPA.PREPARATORIA,
    nombre: 'Preparatoria',
    path: 'preparatoria',
    tipoProceso: 1,
  },
  {
    id: ID_ETAPA.INTERMEDIA,
    nombre: 'Intermedia',
    path: 'intermedia',
    tipoProceso: 1,
  },
  {
    id: ID_ETAPA.JUZGAMIENTO,
    nombre: 'Juzgamiento',
    path: 'juzgamiento',
    tipoProceso: 1,
  },
  {
    id: ID_ETAPA.EJECUCION_SENTENCIA_PC,
    nombre: 'Ejecución',
    path: 'ejecucion',
    tipoProceso: 1,
  },
  {
    id: ID_ETAPA.PROGRAMACION_JUICIO_ORAL,
    nombre: 'Programación a Juicio Oral',
    path: 'juzgamiento/programacion',
    tipoProceso: 1,
  },
  {
    id: ID_ETAPA.DESARROLLO_JUICIO_ORAL,
    nombre: 'Desarrollo de Juicio Oral',
    path: 'juzgamiento/desarrollo',
    tipoProceso: 1,
  },
  {
    id: ID_ETAPA.SENTENCIA,
    nombre: 'Sentencia',
    path: 'juzgamiento/sentencia',
    tipoProceso: 1,
  },
  {
    id: ID_ETAPA.INCOACION_PROCESO_INMEDIATO,
    nombre: 'Incoación a Proceso Inmediato',
    path: 'incoacion-proceso-inmediato',
    tipoProceso: 2,
  },
  {
    id: ID_ETAPA.EJECUCION_SENTENCIA_PE,
    nombre: 'Ejecución de Sentencia',
    path: 'ejecucion-sentencia',
    tipoProceso: 2,
  },
  {
    id: ID_ETAPA.PROGRAMACION_JUICIO_ORAL_PE,
    nombre: 'Programación a Juicio Oral',
    path: 'juicio-inmediato/programacion',
    tipoProceso: 2,
  },
  {
    id: ID_ETAPA.DESARROLLO_JUICIO_ORAL_PE,
    nombre: 'Desarrollo de Juicio Oral',
    path: 'juicio-inmediato/desarrollo',
    tipoProceso: 2,
  },
  {
    id: ID_ETAPA.SENTENCIA_PE,
    nombre: 'Sentencia',
    path: 'juicio-inmediato/sentencia',
    tipoProceso: 2,
  },
];

export function etapaInfo(id: string): any {
  return ETAPA.find((etapa: any) => etapa.id === id);
}
// BANDEJA DE TRÁMITES
export const TRAMITE_TIPO_CUADERNO = Object.freeze({
  TRAMITE_CUADERNOS_INCIDENTALES: 2,
  TRAMITE_CUADERNOS: 1,
  TRAMITE_CUADERNOS_EXTREMO: 4,
  TRAMITE_CUADERNOS_EJECUCION: 3,
  TRAMITE_CARPETA_PRINCIPAL: 0,
  TRAMITE_TODOS:-1
});
export const TRAMITE_TIPO_CUADERNO_FILTRO: FiltroTramite[] = [
  { codigo: TRAMITE_TIPO_CUADERNO.TRAMITE_TODOS, descripcion: 'Todos', color: '', seleccionado: false },
  {
    codigo: TRAMITE_TIPO_CUADERNO.TRAMITE_CARPETA_PRINCIPAL,
    descripcion: 'Trámites en carpeta principal',
    color: '',
    seleccionado: false,
  },
  {
    codigo: TRAMITE_TIPO_CUADERNO.TRAMITE_CUADERNOS_INCIDENTALES,
    descripcion: 'Trámites de cuadernos incidentales',
    color: 'blue',
    seleccionado: false,
  },
  {
    codigo: TRAMITE_TIPO_CUADERNO.TRAMITE_CUADERNOS_EXTREMO,
    descripcion: 'Trámites de cuadernos',
    color: 'orange',
    seleccionado: false,
  },
  {
    codigo: TRAMITE_TIPO_CUADERNO.TRAMITE_CUADERNOS_EJECUCION,
    descripcion: 'Trámites de cuadernos de ejecución',
    color: 'red',
    seleccionado: false,
  },
];
