import { Directive, inject, ElementRef, Renderer2, HostListener } from "@angular/core";
import { NgControl } from "@angular/forms";
import { Subject, fromEvent, EMPTY, merge, takeUntil } from "rxjs";
import { FormSubmitDirective } from "./form-submit.directive";
import * as i0 from "@angular/core";
export class FormValidationDirective {
    constructor() {
        this.ngControl = inject(NgControl);
        this.form = inject(FormSubmitDirective, { optional: true });
        this.destroy$ = new Subject();
        this.elementRef = inject(ElementRef);
        this.blurEvent$ = fromEvent(this.elementRef.nativeElement, 'blur');
        this.submit$ = this.form ? this.form.submit$ : EMPTY;
        this.renderer = inject(Renderer2);
    }
    onBlur() {
        this.handlerInput();
    }
    ngOnInit() {
        merge(this.submit$, this.ngControl.statusChanges ?? EMPTY)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            this.updateClass();
        });
        // merge(this.blurEvent$, this.clickEvent$)
        merge(this.blurEvent$)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            this.handlerInput();
        });
    }
    handlerInput() {
        const control = this.ngControl.control;
        if (control?.invalid) {
            control.markAsTouched();
            control.markAsDirty();
        }
        this.updateClass();
    }
    updateClass() {
        if (this.ngControl?.control) {
            const nativeElement = this.elementRef.nativeElement;
            const control = this.ngControl.control;
            // Actualizar las clases ng-dirty y ng-invalid
            if ((control.dirty && control.invalid) || (control.touched && control.invalid)) {
                this.renderer.addClass(nativeElement, 'ng-dirty');
                this.renderer.addClass(nativeElement, 'ng-invalid');
                this.renderer.removeClass(nativeElement, 'ng-valid');
            }
            else {
                this.renderer.removeClass(nativeElement, 'ng-dirty');
                this.renderer.removeClass(nativeElement, 'ng-invalid');
                this.renderer.addClass(nativeElement, 'ng-valid');
            }
            // Actualizar la clase ng-pristine
            if (control.pristine) {
                this.renderer.addClass(nativeElement, 'ng-pristine');
            }
            else {
                this.renderer.removeClass(nativeElement, 'ng-pristine');
            }
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FormValidationDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: FormValidationDirective, selector: "[formControl], [formControlName]", host: { listeners: { "onBlur": "onBlur()" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FormValidationDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[formControl], [formControlName]' }]
        }], propDecorators: { onBlur: [{
                type: HostListener,
                args: ['onBlur']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS12YWxpZGF0aW9uLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jZm5nLWNvcmUtbGliL2RpcmVjdGl2ZXMvdmFsaWRhdGlvbi9mb3JtLXZhbGlkYXRpb24uZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQXFCLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMxRyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbkUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7O0FBRzlELE1BQU0sT0FBTyx1QkFBdUI7SUFEcEM7UUFFcUIsY0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QixTQUFJLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdkQsYUFBUSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFDL0IsZUFBVSxHQUE0QixNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFekQsZUFBVSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM5RCxZQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUVoRCxhQUFRLEdBQWMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBaUU1RDtJQS9EMkIsTUFBTTtRQUMx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ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgT25Jbml0LCBPbkRlc3Ryb3ksIGluamVjdCwgRWxlbWVudFJlZiwgUmVuZGVyZXIyLCBIb3N0TGlzdGVuZXIgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgTmdDb250cm9sIH0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBTdWJqZWN0LCBmcm9tRXZlbnQsIEVNUFRZLCBtZXJnZSwgdGFrZVVudGlsIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IEZvcm1TdWJtaXREaXJlY3RpdmUgfSBmcm9tIFwiLi9mb3JtLXN1Ym1pdC5kaXJlY3RpdmVcIjtcblxuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW2Zvcm1Db250cm9sXSwgW2Zvcm1Db250cm9sTmFtZV0nIH0pXG5leHBvcnQgY2xhc3MgRm9ybVZhbGlkYXRpb25EaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBuZ0NvbnRyb2wgPSBpbmplY3QoTmdDb250cm9sKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGZvcm0gPSBpbmplY3QoRm9ybVN1Ym1pdERpcmVjdGl2ZSwgeyBvcHRpb25hbDogdHJ1ZSB9KTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRlc3Ryb3kkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+ID0gaW5qZWN0KEVsZW1lbnRSZWYpO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBibHVyRXZlbnQkID0gZnJvbUV2ZW50KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnYmx1cicpO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3VibWl0JCA9IHRoaXMuZm9ybSA/IHRoaXMuZm9ybS5zdWJtaXQkIDogRU1QVFk7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlbmRlcmVyOiBSZW5kZXJlcjIgPSBpbmplY3QoUmVuZGVyZXIyKTtcblxuICAgIEBIb3N0TGlzdGVuZXIoJ29uQmx1cicpIG9uQmx1cigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5oYW5kbGVySW5wdXQoKTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAgICAgbWVyZ2UodGhpcy5zdWJtaXQkLCB0aGlzLm5nQ29udHJvbC5zdGF0dXNDaGFuZ2VzID8/IEVNUFRZKVxuICAgICAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveSQpKVxuICAgICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDbGFzcygpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gbWVyZ2UodGhpcy5ibHVyRXZlbnQkLCB0aGlzLmNsaWNrRXZlbnQkKVxuICAgICAgICBtZXJnZSh0aGlzLmJsdXJFdmVudCQpXG4gICAgICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95JCkpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZXJJbnB1dCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVySW5wdXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNvbnRyb2wgPSB0aGlzLm5nQ29udHJvbC5jb250cm9sO1xuXG4gICAgICAgIGlmIChjb250cm9sPy5pbnZhbGlkKSB7XG4gICAgICAgICAgICBjb250cm9sLm1hcmtBc1RvdWNoZWQoKTtcbiAgICAgICAgICAgIGNvbnRyb2wubWFya0FzRGlydHkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlQ2xhc3MoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZUNsYXNzKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5uZ0NvbnRyb2w/LmNvbnRyb2wpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hdGl2ZUVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRyb2wgPSB0aGlzLm5nQ29udHJvbC5jb250cm9sO1xuXG4gICAgICAgICAgICAvLyBBY3R1YWxpemFyIGxhcyBjbGFzZXMgbmctZGlydHkgeSBuZy1pbnZhbGlkXG4gICAgICAgICAgICBpZiAoKGNvbnRyb2wuZGlydHkgJiYgY29udHJvbC5pbnZhbGlkKSB8fCAoY29udHJvbC50b3VjaGVkICYmIGNvbnRyb2wuaW52YWxpZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKG5hdGl2ZUVsZW1lbnQsICduZy1kaXJ0eScpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3MobmF0aXZlRWxlbWVudCwgJ25nLWludmFsaWQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKG5hdGl2ZUVsZW1lbnQsICduZy12YWxpZCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKG5hdGl2ZUVsZW1lbnQsICduZy1kaXJ0eScpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3MobmF0aXZlRWxlbWVudCwgJ25nLWludmFsaWQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKG5hdGl2ZUVsZW1lbnQsICduZy12YWxpZCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBY3R1YWxpemFyIGxhIGNsYXNlIG5nLXByaXN0aW5lXG4gICAgICAgICAgICBpZiAoY29udHJvbC5wcmlzdGluZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3MobmF0aXZlRWxlbWVudCwgJ25nLXByaXN0aW5lJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3MobmF0aXZlRWxlbWVudCwgJ25nLXByaXN0aW5lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kZXN0cm95JC5uZXh0KCk7XG4gICAgICAgIHRoaXMuZGVzdHJveSQuY29tcGxldGUoKTtcbiAgICB9XG59Il19