export interface IncoacionSujeto {
  idSujetoCaso: string;
  idTipoParteSujeto: number;
  noTipoParteSujeto: string;
  numeroDocumento: string;
  idTipoDocumento: number;
  noTipoDocumento: string;
  nombreSujeto: string;
  flVerificado: string;
  idTipoReparacionCivil: string;
  noTipoReparacionCivil: string;
}

export interface RegistroSujetoApela {
  idReparacion: string;
  codigoReparacion: string;
  nombreActoProcesal: string;
  idSujetoCasoResultado: string;
  idSujetoCaso: string;
  nombreSujeto: string;
  nombreTipoParteSujeto: string;
  resultadoApelacion: string;
  queja: string;
  idApelacionResultado: string;
  idActoTramiteSujeto: string;
}

export interface ReparacionCivilCaso {
  idReparacion: string;
  codigoReparacion: string;
}

export interface ApelaFiscalia {
  idActoTramiteCaso: string;
  codigoDependecia: string;
}

export interface FiscaliaApelacion {
  codigoDependecia: string;
}
