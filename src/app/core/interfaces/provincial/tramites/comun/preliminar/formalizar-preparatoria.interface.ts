import { RegistrarPlazoRequest } from '../../../administracion-casos/gestion-plazo/GestionPlazoRequest';

export interface FormalizarPreparatoria {
  plazosRequest: RegistrarPlazoRequest;
  idCaso: string;
  numeroCaso: string;
  idActoTramiteCaso: string;
}

export interface AlertaFormalizar {
  idCaso: string;
  numeroCaso: string;
  idActoTramiteCaso: string;
}

export interface AlertaDeclararComplejo extends AlertaFormalizar {
  fechaVencimiento: string;
}
