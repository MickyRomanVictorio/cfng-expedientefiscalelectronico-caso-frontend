/// <reference path="form-validation.directive.ngtypecheck.d.ts" />
import { OnInit, OnDestroy } from "@angular/core";
import * as i0 from "@angular/core";
export declare class FormValidationDirective implements OnInit, OnDestroy {
    private readonly ngControl;
    private readonly form;
    private readonly destroy$;
    private readonly elementRef;
    private readonly blurEvent$;
    private readonly submit$;
    private readonly renderer;
    onBlur(): void;
    ngOnInit(): void;
    private handlerInput;
    private updateClass;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FormValidationDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FormValidationDirective, "[formControl], [formControlName]", never, {}, {}, never, never, false, never>;
}
