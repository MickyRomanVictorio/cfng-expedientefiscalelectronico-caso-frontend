import { RegistrarPlazoRequest } from "../provincial/administracion-casos/gestion-plazo/GestionPlazoRequest";

export interface ConclusionInvestigacion {
    plazosRequest: RegistrarPlazoRequest
    idCaso: string,
    idActoTramiteCaso: string,
  }
