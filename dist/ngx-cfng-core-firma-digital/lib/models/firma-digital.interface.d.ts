export interface FirmaInterface {
    id: string;
    rol?: string | null;
    motivo?: string | null;
    posicionX?: number | null;
    posicionY?: number | null;
    pagina?: number | null;
    estiloFirma?: number | null;
    posicionVisible?: boolean | null;
    extension: 'pdf' | '7z';
    firma_url: string;
    repositorio_url: string;
    param_url: string;
}
export interface FirmaParamInterface {
    param_url: string;
    param_token: string;
    document_extension: 'pdf' | '7z';
}
