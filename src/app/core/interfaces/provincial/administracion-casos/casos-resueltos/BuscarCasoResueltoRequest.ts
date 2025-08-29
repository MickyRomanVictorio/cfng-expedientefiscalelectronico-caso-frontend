export interface BuscarCasosResueltosRequest {
    tipoElevacion? : number;
    tipoFiscalia? : number;
    tipoDespacho? : number;
    tipoResultado? : number;
    fechaDesde?: string | null,
    fechaHasta?: string | null,
    tipoFiscalDespacho? : number;
}
