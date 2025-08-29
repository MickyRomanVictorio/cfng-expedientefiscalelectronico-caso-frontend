import { CatalogoInterface } from "@core/interfaces/comunes/catalogo-interface";



export interface RegistrarMedidasMultipleRequest {
  idCaso: string;
  idActoTramiteCaso: string;
  detalle:RegistrarMedidasMultipleDetalleRequest[];
}
export interface RegistrarMedidasMultipleDetalleRequest {
  idMedidaCoercion: number;
  idSujetoCaso: string;
  idTipoParteSujeto: number;
  sujeto:string;
  medida:string;
}
export interface MedidaCoercion {
  idSujeto: string;
  idTipoMedida: number;
  medidaCoarcion: number;
}

export interface SupuestosRequest {
  idActoTramiteCaso: string;
  supuestos: number[];
}

export interface MedidaCoercionSujeto {
  idActoTramiteCaso: string;
  idActoTramiteCasoSujeto: string;
  idActoTramiteCasoSujetoMedidaCoercitiva: string;
  nombreSujeto: string;
  idMedidaCoercitiva: number;
  descMedidaCoercitiva: string;
  idTipoMedidaCoercitiva: number;
  descTipoMedidaCoercitiva: string;
}
export interface RequerimientoIncoacionProcesoInmediato {
  idCaso: string;
  idActoTramiteCaso: string;
  supuestos: CatalogoInterface[];
  esMedidaCoercionCorrecta: boolean;
  esSupuestoCorrecto: boolean;
}
export interface RegistrarMedidasRequest {
  idCaso: string;
  idActoTramiteCaso: string;
  idMedidaCoercion: number;
  idSujetoCaso: string;
  idTipoParteSujeto: number;
}
