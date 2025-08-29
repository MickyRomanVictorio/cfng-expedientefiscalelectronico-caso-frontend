export interface DetalleFuenteInvestigacion {
  etapas: Etapa[];
}

export interface Etapa {
  idCaso: string;
  mostrarEtapa: boolean;
  idEtapa: number;
  nombreEtapa: string;
  acto: string;
  tramite: string;
  origen: string;
  colorOrigen: string;
  fechaIngreso: string;
  archivos: Archivo[];
}

export interface Archivo {
  seleccionado: boolean;
  imgArchivo: string;
  idArchivo: string;
  nombreArchivo: string;
  formatoArchivo: string;
  colorFormatoArchivo: string;
  pesoArchivo: number;
}
