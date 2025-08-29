import { Directive, inject, ElementRef } from "@angular/core";
import { fromEvent, shareReplay } from "rxjs";
import * as i0 from "@angular/core";
export class FormSubmitDirective {
    constructor() {
        this.host = inject(ElementRef);
        this.submit$ = fromEvent(this.element, 'submit').pipe(shareReplay(1));
    }
    get element() {
        return this.host.nativeElement;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FormSubmitDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: FormSubmitDirective, selector: "form", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FormSubmitDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'form' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1zdWJtaXQuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWNmbmctY29yZS1saWIvZGlyZWN0aXZlcy92YWxpZGF0aW9uL2Zvcm0tc3VibWl0LmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsTUFBTSxNQUFNLENBQUM7O0FBRzlDLE1BQU0sT0FBTyxtQkFBbUI7SUFEaEM7UUFFcUIsU0FBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUUzQyxZQUFPLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBS3BFO0lBSEcsSUFBSSxPQUFPO1FBQ1AsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUNuQyxDQUFDOzhHQVBRLG1CQUFtQjtrR0FBbkIsbUJBQW1COzsyRkFBbkIsbUJBQW1CO2tCQUQvQixTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgaW5qZWN0LCBFbGVtZW50UmVmIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGZyb21FdmVudCwgc2hhcmVSZXBsYXkgfSBmcm9tIFwicnhqc1wiO1xuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdmb3JtJyB9KVxuZXhwb3J0IGNsYXNzIEZvcm1TdWJtaXREaXJlY3RpdmUge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgaG9zdCA9IGluamVjdChFbGVtZW50UmVmKTtcblxuICAgIHN1Ym1pdCQgPSBmcm9tRXZlbnQodGhpcy5lbGVtZW50LCAnc3VibWl0JykucGlwZShzaGFyZVJlcGxheSgxKSk7XG5cbiAgICBnZXQgZWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaG9zdC5uYXRpdmVFbGVtZW50O1xuICAgIH1cbn0iXX0=