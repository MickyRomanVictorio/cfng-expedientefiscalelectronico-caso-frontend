/// <reference path="file-util.ngtypecheck.d.ts" />
import * as i0 from "@angular/core";
export declare class FileUtil {
    constructor();
    base64ToFile: (base64String: string) => File | null;
    descargarArchivoB64: (archivoB64: string, nombreArchivo: string) => void;
    archivoFileToB64: (archivo: File) => Promise<string>;
    trustUrlB64: (archivoB64: string) => string;
    onlyB64File: (trustArchivoB64: string) => string;
    formatoPesoArchivo: (bytes: number, decimalPoint?: number) => string;
    superaPesoPermitido: (archivo: File, persoPermitido: number) => boolean;
    nombreArchivoExtenso: (archivo: File, longitudMaxima: number) => boolean;
    esExtensionValida: (archivo: File, extensionesPermitidas: string) => boolean;
    getTypeClass(fileType: string): string;
    isWildcard(fileType: string): boolean;
    getFileExtension(fileName: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<FileUtil, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FileUtil>;
}
