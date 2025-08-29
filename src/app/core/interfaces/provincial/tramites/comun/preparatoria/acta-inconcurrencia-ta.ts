export interface ActaInconcurrenciaTA {
  idActoTramiteCaso: string,
  idCaso: string,
  incluyeAgendaReprogramacion: boolean,
  idAgendaFiscalCitacion: string | null,
  fechaNuevaReunion: string | null,
  tipoReunion: number,
  urlReunion: string,
  lugar: string,
  observaciones: string,
  formularioIncompleto: boolean;
  sujetosCompletos: boolean;
}

export interface SujetosInconcurrenciaTA {
  idActoTramiteSujeto: string,
  idSujetoCaso: string,
  nombreSujeto: string,
  tipoSujetoProcesal: string,
  delitos: Delito[],
  noAsistio: boolean,
  reprogramado: boolean
}

interface Delito {
  noDelito: string,
  noDelitoGenerico: string,
  noDelitoEspecifico: string
}

export interface GuardarSujetosInconcurrencia {
  idActoTramiteCaso: string,
  formularioIncompleto: boolean,
  listaSujetos: SujetosInconcurrenciaTA[]
}