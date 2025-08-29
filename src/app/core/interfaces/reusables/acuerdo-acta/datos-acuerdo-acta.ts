import { DatosAcuerdoActaReparacionCivil } from "./datos-acuerdo-acta-reparacion-civil";

export interface DatosAcuerdoActa{
    idAcuerdosActa: string | null;
    idSujetoCaso: string | null;
    reparacionCivil?: DatosAcuerdoActaReparacionCivil | null;
}
  