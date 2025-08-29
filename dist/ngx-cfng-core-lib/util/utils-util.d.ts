/// <reference path="utils-util.ngtypecheck.d.ts" />
import { BandejaTramite } from '../interfaces/provincial/bandeja-tramites/BandejaTramite-interface';
import { TipoOpcionCasoFiscal } from '../constant/menu-constant';
export declare const cleanEmptyFields: (object: Object) => {
    [k: string]: any;
};
export declare const obtenerCasoHtml: (numeroCaso: string) => string;
export declare const obtenerRutaParaEtapa: (etapa: string) => string;
export declare const obtenerTipoOpcionEtapa: (etapa: string) => TipoOpcionCasoFiscal;
export declare const urlEditarTramite: (tramite: BandejaTramite) => string;
export declare function limmpiarTildes(str: string): string;
export declare const noQuotes: (event: any) => boolean;
export declare const validOnlyNumbers: (event: any) => boolean;
export declare const validLongitud: (event: KeyboardEvent, maxLen: number) => void;
export declare const validAlfanumerica: (event: KeyboardEvent) => void;
export declare const obtenerCodigoCasoHtml: (numeroCaso: string) => string;
export declare const formatDate: (date: Date) => string;
export declare const formatDatetime: (date: Date) => string;
export declare const formatStringDatetime: (date: Date, hour: Date) => string;
export declare const formatTime: (hour: Date) => string;
export declare const formatTimeHHMM: (hour: Date) => string;
export declare const getValidString: (value: string | null) => string | null;
export declare const validText: (event: any, customPattern?: any) => any;
export declare const validOnlyTextOnPaste: (event: any) => void;
export declare const validOnlyNumberOnPaste: (event: any) => void;
export declare const validAlfanumericaOnPaste: (event: ClipboardEvent) => void;
export declare const formatDateText: (value: string) => string;
export declare const getDateFromString: (value: string) => Date | null;
export declare const formatDateString: (value: string) => string;
export declare const validateDateTime: (dateTimeString: string) => boolean;
export declare function getCapitalized(text?: string): string;
export declare function actualizarContadorInputTextArea(maximo: number, texto: string): number;
declare const _default: {
    getCapitalized: typeof getCapitalized;
};
export default _default;
