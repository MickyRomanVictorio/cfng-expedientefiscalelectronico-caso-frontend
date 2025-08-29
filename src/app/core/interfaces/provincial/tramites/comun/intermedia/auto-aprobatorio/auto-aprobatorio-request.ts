import { Acuerdos } from "@core/interfaces/provincial/tramites/acta-acuerdo/acta-acuerdo-reparatorio.interface";

export interface AutoAprobatorioRequest{
  idCaso: string;
  idActoTramiteCaso: string;
  acuerdos: Acuerdos[];
  fechaNotificacion: string;
  observaciones: string;
}
