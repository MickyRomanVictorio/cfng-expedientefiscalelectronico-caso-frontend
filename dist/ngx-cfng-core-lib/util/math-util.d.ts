/// <reference path="math-util.ngtypecheck.d.ts" />
import * as i0 from "@angular/core";
export declare class MathUtil {
    constructor();
    calcularPorcentaje(initialValue: number, difference: number): number;
    obtenerPesoFormateado(bytes: number): string;
    formatearPesoArchivo: (bytes: number, decimalPoint?: number) => string;
    bytesAMegabytes: (bytes: number, decimalPoint?: number) => string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MathUtil, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MathUtil>;
}
