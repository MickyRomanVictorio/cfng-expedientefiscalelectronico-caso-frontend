/// <reference path="num-row-pipe.ngtypecheck.d.ts" />
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class NumRowPipe implements PipeTransform {
    transform(row: number, param?: {
        page: number;
        perPage: number;
    }): string | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<NumRowPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<NumRowPipe, "numrow", true>;
}
