import { IconType } from "@core/types/IconType";

export interface ModalTramiteData {
  containerClass: string,
  icon: IconType,
  title: string,
  description?: string,
  tituloPrimerBoton?: string,
  tituloSegundoBoton?: string,
  confirm?: boolean,
  accion: string,
}
