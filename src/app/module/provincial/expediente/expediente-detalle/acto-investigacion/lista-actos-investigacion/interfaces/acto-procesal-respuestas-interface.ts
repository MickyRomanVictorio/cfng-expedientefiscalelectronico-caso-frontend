export interface RespuestasActoProcesal {
  idRespuesta: string;
  idDocumento: string;
  respuesta: string;
  elementos: number;
  clasificacion: string;
  sujetos: string;
  fechaIngreso: string;
  seleccionado: boolean;
  isCollapsed: boolean;
  url: string;
}
