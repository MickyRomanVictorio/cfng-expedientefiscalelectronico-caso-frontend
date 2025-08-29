import { RegistrarPlazoRequest } from "../../../administracion-casos/gestion-plazo/GestionPlazoRequest";

export interface DisposicionReapertura {
    plazosRequest: RegistrarPlazoRequest;
    idCaso: string;
    idActoTramiteCaso: string;
    idMovimiento: string;
}