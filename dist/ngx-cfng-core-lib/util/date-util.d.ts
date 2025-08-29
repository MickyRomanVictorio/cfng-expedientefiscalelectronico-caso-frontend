/// <reference path="date-util.ngtypecheck.d.ts" />
import { FormGroup, ValidationErrors } from '@angular/forms';
import * as i0 from "@angular/core";
export declare class DateUtil {
    constructor();
    obtenerTiempoTranscurrido_DHS(fechaInicio: any): string;
    obtenerFormatoFecha_DDMMYYYY(date: Date | string): string;
    validarFormatoHora(event: any): any;
    calcularDiasFecha(date: string): number;
    obtenerFormatoFechaFromDate_DDMMYYYY(fecha: Date): string;
    /**
    * Permite formatear una fecha en formato YYYY-MM-DD HH:mm:ss a una cadena en formato DD MM YYYY HH:mm a.m./p.m.
    * Ejemplo: 2023-05-15 14:30:00 a 15 May 2023 02:30 p.m.
    *
    * @param fechaHora
    * @returns string
    */
    formatearFechaHoraAbreviada: (fechaHora: string) => string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DateUtil, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DateUtil>;
}
export declare const formatDateToAbbreviated: (input: string) => string;
export declare const convertTo12HourFormat: (input: string) => string;
export declare const convertTo24HourFormat: (input: string) => string;
export declare const obtenerFechaLetras: (fecha: Date) => string;
export declare const obtenerHoraAMPM: (fecha: Date) => string;
export declare const getYYMMDDDashedToDDMMYYSlash: (dateStr: string) => string | null;
export declare const obtenerFechaDDMMYYYY: (fecha: Date) => string;
export declare const obtenerFechaTipoDate: (fecha: string) => Date;
export declare const obtenerHoraHH24MI: (fecha: Date) => string;
export declare const obtenerHoraTipoDate: (hora: string) => Date;
export declare const getDDMMYYSlashToDDMMYYDashed: (date?: null) => string;
export declare const calcularTiempoRestante: (fechaFinDetencion: string) => string;
export declare const string2DateReniec: (fechaReniec: string) => Date;
export declare const obtenerFechaHoraDDMMYYYYHHMMA: (fecha: Date) => string;
export declare function dateTimeValidator(control: FormGroup): ValidationErrors | null;
export declare const obtenerTiempoTranscurrido: (fechaInicial: Date) => string;
/**
 * Valida el rango de fechas máximo 1 mes. Usado para los formularios reactivos
 *
 * @param group
 * @returns null | object
 */
export declare const validarRangoFechaForm: (group: FormGroup) => null | object;
/**
 * Valida el rango de fechas máximo 6 meses. Usado para los formularios reactivos
 *
 * @param group
 * @returns null | object
 */
export declare const validarRangoUltimo6MesesForm: (group: FormGroup) => null | object;
export declare function rangoFechaXDefecto(): {
    inicio: Date;
    fin: Date;
};
