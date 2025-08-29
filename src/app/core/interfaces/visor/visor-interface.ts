
export interface Documento {
  id?: string;
  descripcion?: string;
  nombre?: string;
  tamano?: string;
  folio?: number;
}

export interface Archivo {
  archivo: string;
}

/*######################   INI - VISOR EXPEDIENTE ######################*/
export interface CasoArchivos {
  cabecera: Cabecera;
  etapas: Etapas[];
}

export interface Cabecera {
  codigo: string;
  despacho: string;
  fechaDenuncia: string;
  fiscalAsignado:string;
}

export interface Etapas {
  id: string;
  nombre: string;
  mostrarContenido: boolean;
  datosArchivo: DatosArchivo[];
  cuadernoIncidental: CuadernoIncidental[];
}




export interface DatosArchivo {
  idEtapa: string;
  idCaso:string;
  idDocumento: string;
  idActoTramiteCaso: string;
  idNode: string;
  correlativo: number;
  correlativoPadre: number;
  nombre: string;
  numeroDocumento: string;
  idClasificadorExpediente: number;/* Indica si es Cuaderno Incidental o Principal */
  nombreClasificadorExpediente: string;/* Indica si es Cuaderno Incidental o Principal */
  nombreActoProcesal: string;
  nombreTramite: string;
  fechaEmision: string;
  fechaCreacion: string;
  peso: number;
  folioInicio: number;
  folioFin: number;
  folioTotal: number;
  idTipoDocumento: string;
  nombreTipoDocumento: string;
  flgGenericoTipoDocumento: string;
  codigoTipoArchivo: string;
  nombreTipoArchivo: string;
  codigoExtension: string;
  nombreExtension: string;
  codigoClasificador: string;/*Indica si es un archivo Principal o Fuente de Investigación: TipoRegistroDocumento */
  nombreClasificador: string;/*Indica si es un archivo Principal o Fuente de Investigación: TipoRegistroDocumento */
  nombreTipoOrigen: string;
  idTipoOrigen: number;
  seleccionado: boolean;
  mostrarContenido:boolean;
  fuenteInvestigacion: DatosArchivo[];
  incorporaCuadernoPruebas: string;
  cargoDocumento?: DatosArchivo;
  pesoFormateado: string;
}
export type DatosArchivoSeleccionado = Pick<DatosArchivo, 'idEtapa' |'idCaso' | 'correlativo' | 'correlativoPadre' | 'idClasificadorExpediente' | 'codigoClasificador'>;

export interface CuadernoIncidental {
  correlativo: number;
  idCaso:string;
  codigo:string;
  fechaRegistro: string;
  seleccionado: boolean;
  mostrarContenido: boolean;
  numero: number;
  datosArchivo: DatosArchivo[];
}

export interface RespuestaDocumentos {
  code: number;
  message: string;
  data: CasoArchivos;
}
export interface Converter {
  filename: string;
  filePass: string;
  lang: string;
}
/*######################   FIN  - VISOR EXPEDIENTE ######################*/

export interface SujetoProcesal {
  correlativo: number;
  idDocumentoCaso: string;
  numero: string;
  suProcesal: string;
  alias: string;
  nuDocumento: string;
  //detalleCuadernoIncidental: DataEtapa[];
  codTipoDocumento: number;
  nombTipoDocumento: string;
}
