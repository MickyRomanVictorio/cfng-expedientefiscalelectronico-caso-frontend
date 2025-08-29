/// <reference path="string-util.ngtypecheck.d.ts" />
import { DomSanitizer } from "@angular/platform-browser";
import { Delito } from "../interfaces/comunes/casosFiscales-interface";
import * as i0 from "@angular/core";
export declare class StringUtil {
    private sanitizer;
    constructor(sanitizer: DomSanitizer);
    delitosArray: Delito[];
    formatearCodigoCaso(codigoCaso: string): import("@angular/platform-browser").SafeHtml;
    obtenerNumeroCaso(numeroCaso: string): string;
    obtenerPlazo(plazo: string): string;
    obtenerPlazoItem(plazo: string): string;
    formatearNombre(nombre: string): string;
    mostrarDelitosFromArray(delitoArray: Delito[]): string;
    getColor(indSemaforo: number): "greenbar" | "yellowbar" | "redbar";
    capitalizedFirstWord(texto?: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<StringUtil, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<StringUtil>;
}
