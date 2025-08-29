export interface AutoSobreSeimientoAdd {
    idActoTramiteCaso: string;
    idSujetoCaso: string;
    idDelito: number;
    idTipoParteSujeto: string;
    flagAgregarDelito: number;
    retiroReparacionCivil: string;
    flConsentido?: string;
    flRechazado?: string;
}
