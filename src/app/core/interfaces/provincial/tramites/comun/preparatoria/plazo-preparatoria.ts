import { RegistrarPlazoRequest } from "../../../administracion-casos/gestion-plazo/GestionPlazoRequest";

export interface PlazoPreparatoria {
    plazosRequest: RegistrarPlazoRequest,
    idCaso: string,
    idActoTramiteCaso: string,
  }

