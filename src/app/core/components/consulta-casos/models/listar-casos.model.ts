export enum TipoVistaEnum {
  Tarjeta = 1,
  Tabla = 2,
}
export enum TipoExportar {
  Excel = 1,
  Pdf = 2,
}
export interface PaginacionCondicion {
  limit: number;
  page: number;
  where: Record<string, any>;
}
export interface PaginacionConfiguracion {
  isLoading:boolean;
  data: PaginacionConfiguracionDatos
}
export interface PaginacionConfiguracionDatos{
  data: any[];
  pages: number;
  perPage: number;
  total: number;
}

//
export class CasoFiscal {
  idCaso?: string;
  numeroCaso?: string;
  dependenciaFiscal?: string;
  numSecuencial?: string;
  anioNumCaso?: string;

  flgAcumulado?: string;
  flgReservado?: string;
  flgLectura?: string;
  flgLecturaSuperior?: string;
  flRespuesta?: string;
  flRevertido?: string;
  flTipoContienda?: string;
  /**
   * @deprecated
   */
  tipoContienda?: string;
  flgElevacion?: string;
  flgAcuerdoReparatorio?: string;
  flgPrincipioOportunidad?: string;
  flgDerivado?: string;

  fechaIngreso?: string;
  idEtapa?: string;
  etapa?: string;
  fiscal?: string;
  fiscalOrigen?: string;
  ultimoTramite?: string;
  fechaUltimoTramite?: string;
  actoProcesal?: string;
  flgCasoLeido?: string;
  idJerarquia?: string;
  numExpediente?: string;
  idEspecialidad?: string;
  idTipoEspecialidad?: string;
  idTipoProceso?: string;
  idTipoProcesoEtapa?: string;
  flgCuaderno?: string;
  idTipoCuaderno?: number;
  flgCarpeta?: string;
  idActoTramiteCasoUltimo?: string;
  idActoTramiteCasoDocumentoUltimo?: string;
  idEstadoRegistro?: number;
  estadoRegistro?: string;
  codigoCasoPadreAcumulacion?: string;
  usuarioOrigenTramite?: string;
  nombreUsuarioOrigenTramite?: string;
  usuarioActualTramite?: string;
  nombreUsuarioActualTramite?: string;
  idActoTramiteEstado?: string;
  delitos?: Delito[];
  plazos?: Plazo[];
  etiquetas?: Etiqueta[];
  notas?: Nota[];
  pendientes?: MetaInfo[];
  idTipoComplejidad?: number;
  flgConcluido?: string;
  fiscalia?:string;
  fiscaliaOrigen?:string;
  fiscalSuperiorAsignado?:string;
  despacho?:string;
  despachoOrigen?:string;
  fechaElevacion?:string;
  flgRespuestaProv?:string;
  observacionProv?:string;
  fechaObservacionProv?:string;
  etiquetaColorNro?: number;
  etiqueta?:string;
  fechaCreacion?:string;
  horaCreacion?:string;
  pestaniasApelacion?:PestaniasApelacion[];
  idTipoElevacion?:string;
  idClasificadorExpediente?:string;
  numeroCasoPadre?:string;
  tipoCuaderno?:string;
}
export type PestaniasApelacion={
  nombre:string;
  cantidad:number;
}
export type CasoEtiqueta = {
  flRevertido?:string;
  flContiendaCompetencia?:string;
  flReasignado?:string;
  flTipoAsignacion?:string;
  flRespuestaProv?:string;
  etiquetaColorNro?: number;
  etiquetaColorNro2?: number;
  etiqueta?:string;
  etiqueta2?:string;
  etiquetaRgb?:string;
  etiquetaRgb2?:string;
  etiquetaCss?:string;
}


export type Delito = {
  id?: string;
  nombre?: string;
};

export interface Nota {
  idNota?: string | null;
  idCaso?: string;
  textoNota: string | null;
  numeroCaso: string;
  colorNota: string;
};

export type Etiqueta = {
  nombre?: string;
  bgColor?: string
  btnPlazoPagos: boolean
  btnDesacumular: boolean
  btnAcumulaciones: boolean
  btnMotivo: boolean
};

export type Plazo = {
  actoTramiteEstado?: number;
  colorSemaforo?: string;
  diasPlazo?: number;
  diasRestantes?: number;
  diasTrasncurridos?: number;
  fechaEmision?: string | Date;
  fechaFinCalculada?: string;
  flgDiaHabil?: string;
  flgNivel?: string;
  idCaso?: string;
  indSemaforo?: number;
  tipoUnidad?: number;
  nombreActoProcesal?: string;
  complejidad?: number;
  descripcion:string;
  idAccionEstado:number;
  idJerarquia:number;
}

export type MetaInfo = {
  nombre?: string;
  total?: number;
  nuevos?: number;
  // escritos?: number[];
  // notificados?: number[];
  // incidentes?: number[];
};
