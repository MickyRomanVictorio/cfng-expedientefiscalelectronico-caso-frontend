import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "primeng/button";
import * as i3 from "../../icon/icon.component";
export class FnTableBtnComponent {
    constructor() {
        this.text = 'Button description';
        this.shading = false;
        this.ico = null;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnTableBtnComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: FnTableBtnComponent, selector: "fn-table-btn", inputs: { text: "text", shading: "shading", ico: "ico" }, ngImport: i0, template: `
    <button pButton pRipple class="p-button-rounded p-button-outlined font-semibold text-primary" [ngClass]="{'btn-shading': shading}">
      <fn-icon *ngIf="ico" [ico]="ico" height="1.25em" class="mr-2" />
      {{text}}
    </button>
  `, isInline: true, styles: ["button{border:2px solid!important}\n", ".btn-shading{background-color:var(--surface-overlay)}\n"], dependencies: [{ kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.ButtonDirective, selector: "[pButton]", inputs: ["iconPos", "loadingIcon", "label", "icon", "loading", "severity", "raised", "rounded", "text", "outlined", "size", "plain"] }, { kind: "component", type: i3.IconComponent, selector: "fn-icon", inputs: ["ico", "height", "color"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnTableBtnComponent, decorators: [{
            type: Component,
            args: [{ selector: 'fn-table-btn', template: `
    <button pButton pRipple class="p-button-rounded p-button-outlined font-semibold text-primary" [ngClass]="{'btn-shading': shading}">
      <fn-icon *ngIf="ico" [ico]="ico" height="1.25em" class="mr-2" />
      {{text}}
    </button>
  `, styles: ["button{border:2px solid!important}\n", ".btn-shading{background-color:var(--surface-overlay)}\n"] }]
        }], propDecorators: { text: [{
                type: Input
            }], shading: [{
                type: Input
            }], ico: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm4tdGFibGUtYnRuLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2NtcC1saWIvc3JjL2xpYi9idXR0b24vZm4tdGFibGUtYnRuL2ZuLXRhYmxlLWJ0bi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7O0FBZWpELE1BQU0sT0FBTyxtQkFBbUI7SUFiaEM7UUFjVyxTQUFJLEdBQVcsb0JBQW9CLENBQUM7UUFDcEMsWUFBTyxHQUFZLEtBQUssQ0FBQztRQUN6QixRQUFHLEdBQVEsSUFBSSxDQUFDO0tBQzFCOzhHQUpZLG1CQUFtQjtrR0FBbkIsbUJBQW1CLDhHQVhwQjs7Ozs7R0FLVDs7MkZBTVUsbUJBQW1CO2tCQWIvQixTQUFTOytCQUNFLGNBQWMsWUFDZDs7Ozs7R0FLVDs4QkFPUSxJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUNHLEdBQUc7c0JBQVgsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnZm4tdGFibGUtYnRuJyxcclxuICB0ZW1wbGF0ZTogYFxyXG4gICAgPGJ1dHRvbiBwQnV0dG9uIHBSaXBwbGUgY2xhc3M9XCJwLWJ1dHRvbi1yb3VuZGVkIHAtYnV0dG9uLW91dGxpbmVkIGZvbnQtc2VtaWJvbGQgdGV4dC1wcmltYXJ5XCIgW25nQ2xhc3NdPVwieydidG4tc2hhZGluZyc6IHNoYWRpbmd9XCI+XHJcbiAgICAgIDxmbi1pY29uICpuZ0lmPVwiaWNvXCIgW2ljb109XCJpY29cIiBoZWlnaHQ9XCIxLjI1ZW1cIiBjbGFzcz1cIm1yLTJcIiAvPlxyXG4gICAgICB7e3RleHR9fVxyXG4gICAgPC9idXR0b24+XHJcbiAgYCxcclxuICBzdHlsZXM6IFtcclxuICAgICdidXR0b24ge2JvcmRlcjogMnB4IHNvbGlkICFpbXBvcnRhbnQ7fScsXHJcbiAgICAnLmJ0bi1zaGFkaW5nIHtiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1zdXJmYWNlLW92ZXJsYXkpO30nXHJcbiAgXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgRm5UYWJsZUJ0bkNvbXBvbmVudCB7XHJcbiAgQElucHV0KCkgdGV4dDogc3RyaW5nID0gJ0J1dHRvbiBkZXNjcmlwdGlvbic7XHJcbiAgQElucHV0KCkgc2hhZGluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIGljbzogYW55ID0gbnVsbDtcclxufVxyXG4iXX0=