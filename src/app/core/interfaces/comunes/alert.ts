import { IconType } from "@core/types/IconType";

export interface AlertaData {
  containerClass: string,
  icon: IconType,
  title: string,
  description?: string,
  confirmButtonText?: string,
  confirmSecondButtonText?: string,
  cancelButtonText?: string,
  irHechoCasoButtonText?: string,
  confirm?: boolean,
  confirmSecond?: boolean,
  confirmHechosCasos?: boolean,
  ocultarBotones?: boolean,
  ocultarCierre?: boolean,
  rowsView?: boolean,
}
