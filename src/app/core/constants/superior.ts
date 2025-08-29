import { SelectItem } from "primeng/api";

export const TipoElevacionCodigo = {
  ElevacionActuados:'724',
  ContiendaCompetencia: '725',
  ApelacionesAutoPrincipal:'1027',
  ApelacionesAutoIncidental:'726',
  ApelacionesAutoExtremos:'1493',
  ApelacionesAuto: '',
  ExclusionFiscal:'729',
  RetiroAcusacion:'1028',
  ApelacionesSentencia:'727',
} as const;

export const TipoElevacion:SelectItem[] = [
  { value: 1, label: "Elevación de actuados" },
  { value: 2, label: "Apelación de auto" },
  { value: 3, label: "Apelación de sentencia" },
  { value: 4, label: "Contienda de competencia" },
  { value: 5, label: "Elevación en consulta" },
  { value: 6, label: "Exclusión fiscal" },
  { value: 7, label: "Retiro de acusación" }
];

/*
@deprecated En su lugar usar TipoElevacionCodigo
 */
export const TipoElevacionId= {
  ContiendaCompetencia: '725'
} as const;

export const PlazosLeyendaClasesCss: { [key: string]: string } = {
  '0': 'bg-black-alpha-30',
  '1': 'dentro-del-plazo',
  '2': 'plazo-por-vencer',
  '3': 'plazo-vencido',
  '4': 'bg-black-alpha-30',
};
export const  PlazosLeyenda: PlazosLeyenda[] = [
  {
    codigo:'1',
    nombre:'Dentro del plazo',
    cantidad: 0,
    clasesCss: PlazosLeyendaClasesCss['1']
  },
  {
    codigo:'2',
    nombre:'Plazo por vencer',
    cantidad: 0,
    clasesCss: PlazosLeyendaClasesCss['2']
  },
  {
    codigo:'3',
    nombre:'Plazo vencido',
    cantidad: 0,
    clasesCss: PlazosLeyendaClasesCss['3']
  },
  {
    codigo:'4',
    nombre:'Sin plazo',
    cantidad: 0,
    clasesCss: PlazosLeyendaClasesCss['4']
  }
];
export const EtiquetaClasesCss: { [key: string]: string } = {
  '1': 'bg-teal-100 text-teal-800',
  '2': 'bg-teal-100 text-teal-800',
  '3': 'bg-teal-100 text-teal-800',
  '4': 'bg-purple-100 text-purple-400',
  '5': 'bg-teal-100 text-teal-800',
  '6': 'bg-yellow-100 text-yellow-600',
  '7': 'bg-teal-100 text-teal-800',
  '8': 'bg-blue-800 text-white',
  '9': 'bg-gray-200 text-primary-800'
}

export const TipoAsignacion:SelectItem[] = [
  { value: 1, label: "Permanente" },
  { value: 2, label: "Temporal" }
];
export interface PlazosLeyenda {
  codigo: string;
  nombre: string;
  cantidad: number;
  clasesCss: string;
}
