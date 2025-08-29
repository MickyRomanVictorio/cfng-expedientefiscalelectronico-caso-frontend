import { Nullable } from 'primeng/ts-helpers';

export interface Fiscal {
  codigoDespacho: string;
  idUsuario: string;
}

export interface CargaLaboralRequest {
  fiscales: Fiscal[];
  indicadorTodos: number;
  codigoDespacho: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  anio: string | null;
  mes: string | null;
}

export interface FiscalDespachoRequest {
  codigoDependencia: string;
  codigoCargo: string;
  codigoDespacho: string;
  usuario: string | null;
}

export interface FiscalDespachoResponse {
  fiscal: Fiscal;
  nombreFiscal: string;
}

export interface CargaLaboralResponse {
  distritoFiscal: string;
  dependencia: string;
  despacho: string;
  fiscal: string;
  total: number;
  resueltos: number;
  tramites: number;
  porcentajeResuelto: string;
  porcentajeTramite: string;
}

export interface CargaLaboralPorEtapaResponse {
  idTipo: number;
  tipo: String;
  idEtapa: String;
  etapa: String;
  cantidad: number;
}

export interface DatosGrafica {
  label: string;
  data: string;
}

export interface Totales {
  pendientes: number;
  tramites: number;
  resueltos: number;
  total: number;
}

export interface YearOption {
  label: string;
  value: number;
}

export interface MonthOption {
  label: string;
  value: number;
}

export interface ResumenCargaLaboral {
  totalGlobal: number;
  resueltosGlobal: number;
  tramitesGlobal: number;
}

export interface Fiscal {
  codigoDespacho: string;
  idUsuario: string;
}

export interface ReporteFiltrosRequest {
  fiscales: Fiscal[];
  codigoDespacho?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  anio?: string | null;
  mes?: string | null;
  idEtapa?: number | null;
  idActoProcesal?: number | null;
  idTramite?: number | null;
  idFiscalia?: number | null;
  idDespacho?: number | null;
  indicador?: number | null;
}

export interface ResumenResponseItem {
  codigoEntidad: string;
  nombreEntidad: string;
  codigoDespacho: string;
  nombreDespacho: string;
  fiscal: string;
  numeroCaso: string;
  tipoComplejidad: string;
  etapa: string;
  fechaInicioEtapa: string;
  plazo: number;
  diasTranscurrido: number;
  diasTotal: number;
  indicador: string;
  indicadorNumero: number;
}

export interface DetalleResponseItem {
  fiscal: string;
  numeroCaso: string;
  tipoComplejidad: string;
  etapa: string;
  actoProcesal: string;
  tramite: string;
  fechaInicioEtapa: string;
  plazo: number;
  diasTranscurrido: number;
  diasTotal: number;
  indicador: string;
  indicadorNumero: number;
}

export interface Etapa {
  idEtapa: string;
  nombreEtapa: string;
}

export type EtapasResponse = Etapa[];

export interface ActoProcesal {
  idActoProcesalConfigura: string;
  idActoProcesal: string;
  nomActoProcesal: string;
}

export interface ActoProcesal {
  idActoProcesalConfigura: string;
  idActoProcesal: string;
  nomActoProcesal: string;
}

export type ActoProcesalResponse = ActoProcesal[];

export interface Tramite {
  idTramite: string;
  nombreTramite: string;
}

export type TramiteResponse = Tramite[];

export interface Fiscalia {
  codigo: string;
  nombre: string;
}

export type FiscaliaResponse = Fiscalia[];

export interface Despacho {
  codigoDespacho: string;
  nombreDespacho: string;
}

export type DespachoResponse = Despacho[];

export interface PlazosPorEtapaProvincial {
  idCaso: string;
  codigoCaso: string;
  idEtapa: string;
  nombreEtapa: string;
  idFiscalAsignado: string;
  codigoDespacho: string;
  idUsuario: string;
  fiscal: string;
  plazoVerde: number;
  plazoAmbar: number;
  plazoRojo: number;
  asignacion: number;
  recepcion: number;
  calificacion: number;
  preliminarFiscal: number;
  preliminarPnp: number;
  preparatoria: number;
  preparatoriaConcluido: number;
  total: number;
}

export type PlazosPorEtapaProvincialResponse = PlazosPorEtapaProvincial[];

export interface PlazoEtapas {
  codigoDespacho: string;
  idUsuario: string;
}

export interface PlazoEtapasRequest {
  fiscales: PlazoEtapas[];
}

export interface EtapasRequest {
  fiscales: Fiscal[];
  indicador?: number | null;
}

export interface PlazosEtapasDetalleRequest {
  codigoDespacho: string;
  idUsuario: string;
}

export interface PlazosEtapasDetalleDet {
  idCaso: string;
  codigoCaso: string;
  idEtapa: string;
  nombreEtapa: string;
  idFiscalAsignado: string;
  codigoDespacho: string;
  idUsuario: string;
  fiscal: string;
  plazoVerde: number;
  plazoAmbar: number;
  plazoRojo: number;
  asignacion: number;
  recepcion: number;
  calificacion: number;
  preliminarFiscal: number;
  preliminarPnp: number;
  preparatoria: number;
  preparatoriaConcluido: number;
  total: number;
}

export type PlazosEtapasDetalleResponse = PlazosEtapasDetalleDet[];


