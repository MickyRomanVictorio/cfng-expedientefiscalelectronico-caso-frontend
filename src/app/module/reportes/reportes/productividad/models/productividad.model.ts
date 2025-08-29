export interface ProductividadRequest {
  fechaInicio: string | null;
  fechaFin: string | null;
  fechaAnual: string | null;
  fechaMensual: string | null;
  especialidad: string | null;
  instancia: number | null;
  distritoJudicial: string | null;
  dependenciaFiscal: string | null;
}

export interface FiscalDespachoRequest {
  codigoDependencia: string;
  codigoCargo: string;
  usuario: string | null;
}

export interface FiscalDespachoResponse {
  nombreFiscal: string;
}

export interface Especialidad {
  codigo: string;
  nombre: string;
  detalle: string;
}

export interface DistritoFiscal {
  id: number;
  nombre: string;
}

export interface DependenciaXDistritoFiscal {
  id: number;
  codigo: string;
  nombre: string;
}

export interface ProductividadResponse {
  codigoDistritoFiscal: number;
  distritoFiscal: string;
  codigoInstancia: string;
  instancia: string;
  codigoEspecialidad: string;
  especialidad: string;
  codigoDependencia: string;
  dependencia: string;
  despacho: string;
  idCaso: string;
  codigoCaso: string;
  ingreso: number;
  resuelto: number;
  pendiente: number;
  fechaIngreso: Date;
  procedencia: string;
  etapa: string;
  estadoCaso: string;
  dni: string;
  fiscal: string;
  tipoCasoFinal: string;
  distrito: string;
  estadoInicial: string;
}

export interface YearOption {
  label: string;
  value: number;
}

export interface MonthOption {
  label: string;
  value: number;
}
