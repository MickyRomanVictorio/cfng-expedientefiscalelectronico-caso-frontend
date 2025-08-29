import {
  SujetoQueja
} from "@interfaces/provincial/tramites/comun/cuadernos-incidentales/queja-denegatoria-apelacion/sujeto-queja.interface";

export interface QuejaDenegatoriaApelacion {
  etapa?: string,
  idActoTramiteCaso?: string,
  sujetosQueja?: SujetoQueja[],
}
