import { ChangeDetectorRef, ElementRef, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import * as i0 from "@angular/core";
export declare class FnInputComponent implements ControlValueAccessor {
    private cd;
    ngControl: NgControl;
    type: "text" | "password";
    label: string;
    ico: any;
    placeholder: string;
    disabled: boolean;
    styleClass: string;
    checking: boolean;
    counter: number;
    onBlur: EventEmitter<any>;
    input: ElementRef;
    value: string;
    onModelChange: Function;
    onModelTouched: Function;
    constructor(cd: ChangeDetectorRef, ngControl: NgControl);
    get errorMsg(): string;
    onInput(event: any): void;
    onInputBlur(event: Event): void;
    writeValue(value: any): void;
    registerOnChange(fn: Function): void;
    registerOnTouched(fn: Function): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FnInputComponent, [null, { optional: true; self: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FnInputComponent, "fn-input", never, { "type": { "alias": "type"; "required": false; }; "label": { "alias": "label"; "required": false; }; "ico": { "alias": "ico"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "styleClass": { "alias": "styleClass"; "required": false; }; "checking": { "alias": "checking"; "required": false; }; "counter": { "alias": "counter"; "required": false; }; }, { "onBlur": "onBlur"; }, never, never, false, never>;
}
