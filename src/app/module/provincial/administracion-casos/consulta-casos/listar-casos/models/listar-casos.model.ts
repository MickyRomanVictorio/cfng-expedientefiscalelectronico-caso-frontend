export enum TipoVistaEnum {
  Grilla = 1,
  Tabla = 2,
}
export enum TipoExportar {
  Excel = 1,
  Pdf = 2,
}

export interface Nota {
  idNota: string;
  textoNota: string;
  numeroCaso: string;
  colorNota: string;
}

export interface Delito {
  id: number;
  nombre: string;
}

export interface Pendiente {
  nombre: string;
  total: number;
  nuevos: number;
}

export interface Plazo {
  idCaso: string;
  diasPlazo: number;
  diasRestantes: number;
  flgNivel: string;
  actoTramiteEstado: number;
  flgDiaHabil: string | null;
  tipoUnidad: number;
  diasTrasncurridos: number;
  indSemaforo: number;
  colorSemaforo: string | null;
  fechaFinCalculada: string;
  fechaEmision: string;
  complejidad: number;
}

export interface Caso {
  idCaso: string;
  numeroCaso: string;
  dependenciaFiscal: string;
  numSecuencial: string;
  anioNumCaso: string;
  flgAcumulado: string;
  flgReservado: string;
  flgLectura: string;
  fechaIngreso: string;
  flgElevacion: string;
  flgAcuerdoReparatorio: string;
  flgPrincipioOportunidad: string;
  flgDerivado: string;
  idEtapa: string;
  etapa: string;
  fiscal: string;
  fiscalia:string;
  ultimoTramite: string | null;
  fechaUltimoTramite: string | null;
  actoProcesal: string | null;
  flgCasoLeido: string;
  idJerarquia: string;
  numExpediente: string | null;
  idEspecialidad: string;
  idTipoEspecialidad: string;
  idTipoProceso: string;
  idTipoProcesoEtapa: string;
  flgCuaderno: string;
  idTipoCuaderno: number;
  flgCarpeta: string | null;
  idActoTramiteCasoUltimo: string | null;
  idEstadoRegistro: string | null;
  estadoRegistro: string | null;
  codigoCasoPadreAcumulacion: string | null;
  usuarioOrigenTramite: string | null;
  nombreUsuarioOrigenTramite: string;
  usuarioActualTramite: string | null;
  nombreUsuarioActualTramite: string | null;
  idActoTramiteEstado: string | null;
  flgLecturaSuperior: string;
  notas: Nota[];
  delitos: Delito[];
  pendientes: Pendiente[];
  plazos: Plazo[];
  idTipoComplejidad: number;
  idActoTramiteCasoDocumentoUltimo: string;
  flgConcluido: string;
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
