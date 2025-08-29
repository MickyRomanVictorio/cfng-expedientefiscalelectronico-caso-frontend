import { RegistrarPlazoRequest } from "../../../administracion-casos/gestion-plazo/GestionPlazoRequest";

export interface ResolucionAutoRequerimientoProrroga {
  idCaso: string,
  idActoTramiteCaso: string,  
  idResultado: number,
  plazo: RegistrarPlazoRequest,
  fechaNotificacion: Date,
  tieneAudio: boolean,
  tieneVideo: boolean,
  observacion: string
}