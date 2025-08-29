/// <reference path="safe-url-pipe.ngtypecheck.d.ts" />
import { PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as i0 from "@angular/core";
export declare class SafeUrlPipe implements PipeTransform {
    private sanitizer;
    constructor(sanitizer: DomSanitizer);
    transform(url: any): unknown;
    static ɵfac: i0.ɵɵFactoryDeclaration<SafeUrlPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<SafeUrlPipe, "safeUrl", true>;
}
