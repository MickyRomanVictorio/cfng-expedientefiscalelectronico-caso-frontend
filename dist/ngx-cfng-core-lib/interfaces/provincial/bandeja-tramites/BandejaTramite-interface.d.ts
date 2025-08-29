/// <reference path="BandejaTramite-interface.ngtypecheck.d.ts" />
import { TramiteCreadoPor } from "./TramiteCreadoPor-interface";
import { TramiteEnviadoA } from "./TramiteEnviadoA-interface";
import { TramiteEnviadoPor } from "./TramiteEnviadoPor-interface";
import { TramiteFirmadoPor } from "./TramiteFirmadoPor-interface";
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
    orden: number;
    idActoTramiteCaso?: string;
}
