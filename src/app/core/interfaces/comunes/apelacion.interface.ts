export interface Apelaciones {
  idCaso: string;
  numeroCaso: string;
  numeroExpediente: string;
  etiquetas: EtiquetasApe[];
  etapa: string;
  fechaElevacion: string;
  horaElevacion: string;
  actoProcesal: string;
  ultimoTramite: string;
  sujetos: SujetosApe[];
  estado: string;
  idAccionEstado?: number;
  accionEstado?: string;
  idClasificadorCuaderno:string;
  clasificadorCuaderno:string;
  fechaUltTramite?:string;
  horaUltTramite?:string;
  leido?:string;
}
export interface SujetosApe {
  idSujetoCaso: string;
  nombreCompleto: string;
  nombre: string;
  tipoSujeto: string;
}
export interface EtiquetasApe {
  id: number;
  etiqueta: string;
  etiquetaColorNro: number;
}
