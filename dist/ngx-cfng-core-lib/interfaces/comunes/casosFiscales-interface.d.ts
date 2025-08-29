/// <reference path="casosFiscales-interface.ngtypecheck.d.ts" />
export declare class CasoFiscal {
    idCaso?: string;
    numeroCaso?: string;
    dependenciaFiscal?: string;
    numSecuencial?: string;
    anioNumCaso?: string;
    flgAcumulado?: number;
    flgReservado?: string;
    flgLectura?: number;
    flgLecturaSuperior?: number;
    fechaIngreso?: Date;
    flgElevacion?: string;
    flgAcuerdoReparatorio?: string;
    flgPrincipioOportunidad?: string;
    flgDerivado?: string;
    idEtapa?: string;
    etapa?: string;
    fiscal?: string;
    ultimoTramite?: string;
    fechaUltimoTramite?: Date;
    actoProcesal?: string;
    flgCasoLeido?: string;
    idJerarquia?: string;
    numExpediente?: string;
    idEspecialidad?: string;
    idTipoEspecialidad?: string;
    idTipoProceso?: string;
    idTipoProcesoEtapa?: string;
    flgCuaderno?: string;
    idTipoCuaderno?: number;
    flgCarpeta?: string;
    idActoTramiteCasoUltimo?: string;
    idActoTramiteCasoDocumentoUltimo?: string;
    idEstadoRegistro?: number;
    estadoRegistro?: string;
    codigoCasoPadreAcumulacion?: string;
    usuarioOrigenTramite?: string;
    nombreUsuarioOrigenTramite?: string;
    usuarioActualTramite?: string;
    nombreUsuarioActualTramite?: string;
    idActoTramiteEstado?: string;
    delitos?: Delito[];
    plazos?: Plazo[];
    etiquetas?: Etiqueta[];
    notas?: Nota[];
    pendientes?: MetaInfo[];
    idTipoComplejidad?: number;
}
export type Delito = {
    id?: string;
    nombre?: string;
};
export interface Nota {
    idNota?: string | null;
    idCaso?: string;
    textoNota: string | null;
    numeroCaso: string;
    colorNota: string;
}
export type Etiqueta = {
    nombre?: string;
    bgColor?: string;
    btnPlazoPagos: boolean;
    btnDesacumular: boolean;
    btnAcumulaciones: boolean;
    btnMotivo: boolean;
};
export type Plazo = {
    actoTramiteEstado?: number;
    colorSemaforo?: string;
    diasPlazo?: number;
    diasRestantes?: number;
    diasTrasncurridos?: number;
    fechaEmision?: string | Date;
    fechaFinCalculada?: string;
    flgDiaHabil?: string;
    flgNivel?: string;
    idCaso?: string;
    indSemaforo?: number;
    tipoUnidad?: number;
    nombreActoProcesal?: string;
    complejidad?: number;
};
export type MetaInfo = {
    nombre?: string;
    total?: number;
    nuevos?: number;
};
export type NotaRequest = {
    idNnota?: number | null;
    textoNota: string | null;
    numeroCaso: string;
    colorNota: string;
};
export interface FormFilter {
    fecha?: string | Date | null;
    buscar?: string | null;
    proceso?: number | null;
    etapa?: string | null;
    acto_procesal?: string | null;
    tramite?: string | null;
    rango_fecha?: Date[] | null;
    ordenarPor?: string | null;
    order?: string;
    filtroTiempo?: number | null;
    concluido?: boolean | null;
}
export interface FormFilterElevacionSuperior {
    fecha?: string | Date | null;
    buscar?: string | null;
    proceso?: number | null;
    etapa?: string | null;
    acto_procesal?: string | null;
    tramite?: string | null;
    rango_fecha?: Date[] | null;
    ordenarPor?: string | null;
    order?: string;
    filtroTiempo?: number | null;
    concluido?: boolean | null;
    idTipoElevacion?: string;
}
export interface CasoFiscalResponse<T> {
    message: string;
    code: number;
    id: number | null;
    data: T;
}
export declare enum ColoresPostIt {
    GREEN = "#9BDCCB",//'#06A77D',
    ORANGE = "#FFBCB2",//'#F19700',
    YELLOW = "#FAEFA2",// '#F1D302',
    BLUE = "#A4A0D2",
    RED = "#FFE5E2"
}
export interface AcuerdoReparatorioInfo {
    idTramiteCaso?: string;
    idTramiteEstado?: string;
}
