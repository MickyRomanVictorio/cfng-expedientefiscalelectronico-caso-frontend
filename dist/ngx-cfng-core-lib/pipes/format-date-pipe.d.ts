/// <reference path="format-date-pipe.ngtypecheck.d.ts" />
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export type FormatType = 'date' | 'hour' | 'hour24';
export declare class DateFormatPipe implements PipeTransform {
    transform(value: string, type?: FormatType): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DateFormatPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<DateFormatPipe, "dateformat", true>;
}
