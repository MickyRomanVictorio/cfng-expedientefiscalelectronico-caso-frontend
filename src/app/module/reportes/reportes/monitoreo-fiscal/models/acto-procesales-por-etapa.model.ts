export interface YearOption {
  label: string;
  value: number;
}

export interface RangeOptions {
  label: string;
  value: string;
}

export interface MonthOption {
  label: string;
  value: number;
}

export interface listarActoProcesalXEtapaRequest {
  codigoDespacho: string;
  fechaIni: string| null;
  fechaFin: string| null;
  anio: string| null;
  mes: string| null;
}

export interface listarActoProcesalXEtapaResponse {
  dependencia: string;
  despacho: string;
  noEtapa: string;
  actoProcesalUltimo: string | null;
  idNEstado: number;
  noVEestado: string;
  cantidad: number;
}

