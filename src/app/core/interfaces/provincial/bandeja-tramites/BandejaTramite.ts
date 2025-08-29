import { TramiteCreadoPor } from '@interfaces/provincial/bandeja-tramites/TramiteCreadoPor';
import { TramiteEnviadoA } from '@interfaces/provincial/bandeja-tramites/TramiteEnviadoA';
import { TramiteEnviadoPor } from '@interfaces/provincial/bandeja-tramites/TramiteEnviadoPor';
import { TramiteFirmadoPor } from '@interfaces/provincial/bandeja-tramites/TramiteFirmadoPor';

export interface BandejaTramite {
  idBandejaActoTramite: string;
  idDocumentoVersiones: string;
  coCaso: string;
  idCaso: string;
  idEtapa: string;
  noEtapa: string;
  idActoProcesal: string;
  noActoProcesal: string;
  idTramite: string;
  noTramite: string;
  feCreacion: string;
  feEnvio: string;
  feFirma: string;
  idTipoCuaderno?: number;
  noTipoCuaderno: string;
  idEstadoBandeja: number;
  noEstadoBandeja: string;
  idTipoDocumento: number;
  noTipoDocumento: string;
  idDocumentoTramite: string;
  documentoTramite: string;
  tramiteCreadoPor: TramiteCreadoPor;
  tramiteEnviadoA: TramiteEnviadoA;
  tramiteEnviadoPor: TramiteEnviadoPor;
  tramiteFirmadoPor: TramiteFirmadoPor;
  inReversion: number;
  inVisadoCompleto: number;
  inEliminacion: number;
  esMiTramite: boolean;
  /*--*/
  orden: number;
  idActoTramiteCaso: string;
  idNode: string;
  nombreDocumento: string;
  idMovimiento: string;
  flgConcluido: string;
  idTipoIngresoTramite: number;
  idEstadoTramite: number;
  esRevertir?: boolean;
  flgSinDataCompleta?: boolean;
}
