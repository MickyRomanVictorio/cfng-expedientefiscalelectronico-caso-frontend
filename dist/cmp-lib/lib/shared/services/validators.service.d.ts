import { AbstractControl, ValidationErrors } from '@angular/forms';
import * as i0 from "@angular/core";
export declare class ValidatorsService {
    constructor();
    isField1EqualFiel2(field1: string, field2: string): (formGroup: AbstractControl) => ValidationErrors | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<ValidatorsService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ValidatorsService>;
}
