/// <reference path="input-util.ngtypecheck.d.ts" />
import * as i0 from "@angular/core";
export declare class InputUtil {
    constructor();
    validarSoloNumeros(event: Event): void;
    validarSoloLetras(event: Event): void;
    validarSoloLetrasNumeros(event: Event): void;
    contarTotalPalabras(inputText: any, maxLength: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<InputUtil, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<InputUtil>;
}
