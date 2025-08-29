export interface BandejaAlertaResponse {
  limiteListadoPorAtender: number;
  limiteListadoAtendido: number;
  listaAlertaPorAtender: any[];
  listaAlertaAtendido: any[];
  totalPorAtender: number;
  totalAtendido: number;
  idDespacho: string;
}

export interface ListadoAlertasUrgentesResponse {
  listaAlertaPorAtender: Alerta[];
  totalPorAtender: number;
  idDespacho: string;
}

export interface Alerta {
  id?: string;
  forma?: string;
  codigoDespacho: string;
  idAsignado?: string;
  idOrigen?: string;
  tipo?: string;
  bandeja?: string;
  titulo?: string;
  texto: string;
  codigoCaso: string;
  estado?: string;
  fechaCreacion: string;
  url?: string;
  codigoUsuarioDestino?: string;
}

export interface SumarioAlertaResponseDTO {
  bandejaPlazoAlertas: BandejaAlertaResponse;
  bandejaGenericaAlertas: BandejaAlertaResponse;
  listadoAlertasUrgentes: ListadoAlertasUrgentesResponse;
}

export interface AlertaGeneralRequestDTO {
  idCaso: string;
  numeroCaso: string;
  idActoTramiteCaso: string;
  fechaVencimiento?: string;
  codigoAlertaTramite: string;
  idTipoOrigen: string;
  destino?: string;
  data?:  {
    campo: string;
    valor: any;
  }[];
}

export interface AlertaRequest {
  codigoDespacho: string;
  idAsignado: string;
  codigoCaso: string;

}
