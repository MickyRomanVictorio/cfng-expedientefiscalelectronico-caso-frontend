import { RegistrarPlazoRequest } from "../../../administracion-casos/gestion-plazo/GestionPlazoRequest";

export interface DeclararComplejo {
    plazosRequest: RegistrarPlazoRequest,
    idCaso: string,
    idActoTramiteCaso: string,
  }
