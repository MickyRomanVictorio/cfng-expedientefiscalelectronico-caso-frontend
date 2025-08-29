export interface AutoResuelveDesistimientoRequest {
  idActoTramiteCaso?: string,
  fechaNotificacion?: string,
  observaciones?: string
  esGuardar?: string,
  nuPestana?: string,
  totalSujetosDesestimado: number,
  totalSujetosGuardado: number,
  totalSujetos: number,
  esDevolverCaso: boolean,
  esApelacionRequerimiento: boolean,
  esApelacionReparacionCivil: boolean,
  esApelacionPena: boolean,
  esApelacionProcesoInmediato: boolean,
  esApelacionTerminacionAnticipada: boolean,
  observacionProvincial: string,
  nombreFiscalia: string,
  nombreFiscaliaProvincial: string,
  fiscalPronunciamiento: string,
  listSujetos: any
}
