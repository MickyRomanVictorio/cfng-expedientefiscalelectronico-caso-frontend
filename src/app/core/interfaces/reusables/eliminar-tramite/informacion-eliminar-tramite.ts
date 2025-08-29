import { IconType } from "@core/types/IconType";

export interface InformacionEliminarTramite {
  containerClass: string,
  icon: IconType,
  titulo: string,
  descripcion?: string,
  confirmButtonText?: string,
  cancelButtonText?: string,
  confirm?: boolean,
  dato?: any
}
