import { AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FnIcon } from "../../shared/interfaces/fn-icon";
import * as i0 from "@angular/core";
export declare class InputWrapperComponent implements AfterViewInit {
    private el;
    private cdRef;
    ico: FnIcon | null;
    label: string;
    constructor(el: ElementRef, cdRef: ChangeDetectorRef);
    ngAfterViewInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<InputWrapperComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<InputWrapperComponent, "fn-input-wrapper", never, { "ico": { "alias": "ico"; "required": false; }; "label": { "alias": "label"; "required": false; }; }, {}, never, ["*", "[error]"], false, never>;
}
