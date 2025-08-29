import { SujetoProcesal } from "./sujetos-procesales-interface";


export interface SolicitudActoInvestigacion {
  idClasificacion: string;
  elementos: ElementoConviccion[];
}

export interface ElementoConviccion {
  id: string;
  descripcion: string;
  // tipo: string;
  sujetos: SujetoProcesal[];
  fechaRegistro: string;
  estado: number;
  isCollapsed: boolean;
}
