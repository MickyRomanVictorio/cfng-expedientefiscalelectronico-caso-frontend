import { IconType } from "@core/types/IconType";
import { GruposDesagregados } from "./GruposDesagregados";

export interface AlertaDataDesagregados {
  containerClass: string,
  icon: IconType,
  title: string,
  description?: string,
  confirmButtonText?: string,
  cancelButtonText?: string,
  confirm?: boolean,
  gruposDesagregados: GruposDesagregados[]
}
