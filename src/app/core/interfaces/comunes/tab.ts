import { TipoIcono } from "@core/types/icono.type";

export interface Tab {
  id?: number,
  titulo: string,
  ancho?: number,
  icono?: TipoIcono,
  cantidad?: number,
  tooltipCantidad?: string,
  oculto?: boolean,
  color?: string,
  rutaPadre?: string,
  rutasHijas?: string,
}
