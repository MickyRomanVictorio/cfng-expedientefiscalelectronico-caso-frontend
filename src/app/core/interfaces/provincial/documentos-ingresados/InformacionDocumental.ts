export interface InformacionDocumental {
  idCaso: string;
  codigoCaso: string;
  tipoElevacion: string;
  tipoCaso: string;
  fiscal: string;
  despacho: string;
  etapa: string;
  actoProcesal: string;
  tramite: string;
  fechaElevacion: string;
  documentosAdjuntos: Documento[];
  
}

export interface Documento {
  nombre: string;
  tamanio: string;
  fecha: string;
  idDocumento: string;
}

