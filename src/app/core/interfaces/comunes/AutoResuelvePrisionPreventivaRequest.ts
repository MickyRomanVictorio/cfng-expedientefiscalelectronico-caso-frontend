import { AbstractControl, ValidatorFn } from "@angular/forms"

export interface AutoResuelvePrisionPreventiva {
  idActoTramiteCaso: string,
  fechaNotificacion: string,
  observaciones?: string,
  resultadoPrisionPreventiva?: string,
  resultadoAudiencia?: string
}

export interface SujetoProcesal {
  idSujetoCaso: string,
  nombreSujetoProcesal: string
  idTipoParteSujeto: number,
  idTipoResultado: number,
  tipoParteSujeto: string,
  idActoTramiteResultadoSujeto?: string,
}

export interface ResultadoAudienciaPrisionPreventiva extends SujetoProcesal {
  idApelacionResultado: string,
  idActoTramiteCaso: string,
}

export interface DelitoSujetoProcesal {
  idDelitoSujeto: string,
  nombreDelito: string,
}

export interface GrupoControlInterface {
  controlActual: AbstractControl,
  validador: ValidatorFn[]
}

export interface SujetoResultadoPrisionPreventivaInterface {
  idActoTramiteResultadoSujeto: string,
  idActoTramiteSujeto: string,
  delitosSujetoProcesal: DelitoSujetoProcesal[],
  idTipoMedidaCoercion: number,
  idMedidaCoercion: number,
  idDelitoSujeto: string[],
  fechaInicio: string,
  plazoOtorgado: number,
  plazoProlongado: number,
  idUnidadMedida: number,
  idUnidadMedidaProlongado: number,
  fechaCalculada: string,
  fechaCalculadaProlongado: string,
  descripcion: string
}

export interface ResultadoPrisionPreventivaInterface {
  idActoTramiteResultadoSujeto: string,
  idActoTramiteResultadoSujetoPadre: string,
  idActoTramiteCaso: string,
  idTipoResultado: number,
  idTipoResultadoProlongada: number,
  idTipoResultadoCesacion: number,
  idTipoResultadoAdecuacion: number,
  tipoResultado: string,
  idSujetoCaso: string,
  idTipoParteSujeto: number,
  nombreSujetoCaso: string,
  idDelitoSujeto: string[],
  delitos: string[],
  reoAusenteContumaz: boolean,
  reoAusenteContumazNuevo: boolean,
  flProlongado: boolean,
  flCesacion: boolean,
  flAdecuacion: boolean,
  fechaCese: string,
  fechaInicio: string,
  fechaInicioCesacion: string,
  plazoOtorgado: number,
  plazoProlongado: number,
  plazoCesacion: number,
  plazoAdecuacion: number,
  fechaFin: string,
  fechaCalculada: string,
  fechaCalculadaProlongado: string,
  fechaCalculadaCesacion: string,
  fechaCalculadaAdecuacion: string,
  idUnidadMedida: number,
  idUnidadMedidaProlongado: number,
  idUnidadMedidaCesacion: number,
  idUnidadMedidaAdecuacion: number,
  unidadMedida: string,
  unidadMedidaProlongado: string,
  unidadMedidaCesacion: string,
  unidadMedidaAdecuacion: string,
  idTipoMedidaCoercion: number,
  tipoMedidaCoercion: string,
  idMedidaCoercion: number,
  medidaCoercion: string,
  idReglaConducta: number[],
  reglasConducta: string[],
  descripcion: string,
  enEdicion: boolean,
  tipoMedida: string
  idTipoResultadoProceso: number
}
