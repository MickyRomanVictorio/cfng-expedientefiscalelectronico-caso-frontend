import { RespuestasActoProcesal } from './acto-procesal-respuestas-interface';

export interface ActoProcesal {
  id: string;
  descripcion: string;
  actoProcesal: string;
  tramite: string;
  fechaOrigen: string;
  fechaIngreso: string;
  respuestas: RespuestasActoProcesal[];
  seleccionado: boolean;
}
