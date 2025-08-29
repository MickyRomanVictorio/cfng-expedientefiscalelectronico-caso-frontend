import {
  SujetoApelacion
} from "@interfaces/provincial/tramites/comun/cuadernos-incidentales/recurso-apelacion/sujeto-apelacion.interface";

export interface RecursoApelacion {
  etapa?: string,
  idActoTramiteCaso?: string,
  sujetosApelacion?: SujetoApelacion[],
}
