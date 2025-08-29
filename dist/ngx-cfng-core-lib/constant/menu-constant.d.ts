/// <reference path="menu-constant.ngtypecheck.d.ts" />
import { FiltroTramite } from '../interfaces/provincial/bandeja-tramites/FiltroTramite-interface';
export declare const ID_ETAPA: Readonly<{
    CALI: "01";
    PREL: "02";
    PREP: "03";
    INTE: "04";
    JUZG: "05";
    EJEC: "06";
}>;
export declare enum TipoOpcionCasoFiscal {
    Ninguna = 0,
    Calificacion = 1,
    Preliminar = 2,
    Preparatoria = 3,
    Intermedia = 4,
    Juzgamiento = 5,
    Ejecucion = 6,
    Impugnacion = 7,
    ProcesosEspeciales = 8,
    Concluidos = 9
}
export declare const ETAPA: ({
    id: "01";
    nombre: string;
    path: string;
    tipoOpcion: TipoOpcionCasoFiscal;
} | {
    id: "02";
    nombre: string;
    path: string;
    tipoOpcion: TipoOpcionCasoFiscal;
} | {
    id: "03";
    nombre: string;
    path: string;
    tipoOpcion: TipoOpcionCasoFiscal;
} | {
    id: "04";
    nombre: string;
    path: string;
    tipoOpcion: TipoOpcionCasoFiscal;
} | {
    id: "05";
    nombre: string;
    path: string;
    tipoOpcion: TipoOpcionCasoFiscal;
} | {
    id: "06";
    nombre: string;
    path: string;
    tipoOpcion: TipoOpcionCasoFiscal;
})[];
export declare function etapaInfo(id: string): any;
export declare const TRAMITE_TIPO_CUADERNO: Readonly<{
    TRAMITE_CUADERNOS_INCIDENTALES: 541;
    TRAMITE_CUADERNOS: 542;
    TRAMITE_CUADERNOS_EJECUCION: 543;
    TRAMITE_CARPETA_PRINCIPAL: 683;
}>;
export declare const TRAMITE_TIPO_CUADERNO_FILTRO: FiltroTramite[];
export declare const TipoOpcionCasoFiscalRuta: Partial<{
    [key in TipoOpcionCasoFiscal]: string;
}>;
