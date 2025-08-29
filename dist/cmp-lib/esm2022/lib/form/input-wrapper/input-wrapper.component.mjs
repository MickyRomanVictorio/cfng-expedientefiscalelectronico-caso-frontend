import { Component, Input } from '@angular/core';
//icons
import { iCalendar, iClock, iCalendarClock } from "ngx-mpfn-dev-icojs-regular";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "../../icon/icon.component";
export class InputWrapperComponent {
    constructor(el, cdRef) {
        this.el = el;
        this.cdRef = cdRef;
        this.ico = null;
        this.label = '';
    }
    ngAfterViewInit() {
        const primeTag = this.el.nativeElement.firstChild.children[this.label ? 1 : 0].children[this.ico ? 1 : 0];
        //If primeTag.firstChild is null
        if (!primeTag.firstChild)
            return;
        primeTag.firstChild.classList.add('w-full');
        if (primeTag.localName === 'p-calendar') {
            const input = primeTag.firstChild.firstChild;
            if (primeTag.attributes.getNamedItem('ng-reflect-show-time'))
                this.ico = iCalendarClock;
            else if (primeTag.attributes.getNamedItem('ng-reflect-time-only'))
                this.ico = iClock;
            else
                this.ico = iCalendar;
            input.classList.add('w-full');
            input.style.paddingLeft = "2.5rem";
        }
        if (primeTag.localName === 'p-dropdown')
            if (this.ico)
                primeTag.firstChild.children[1].style.paddingLeft = '2.5rem';
        this.cdRef.detectChanges();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: InputWrapperComponent, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: InputWrapperComponent, selector: "fn-input-wrapper", inputs: { ico: "ico", label: "label" }, ngImport: i0, template: `
    <div class="field">
      <label *ngIf="label" class="block text-sm font-semibold"
        >{{label}}</label
      >
      <div [ngClass]="{ 'p-input-icon-left': ico }" class="block">
        <fn-icon *ngIf="ico" [ico]="ico" class="z-1 text-primary"></fn-icon>
        <ng-content></ng-content>
      </div>
      <ng-content select="[error]"></ng-content>
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i2.IconComponent, selector: "fn-icon", inputs: ["ico", "height", "color"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: InputWrapperComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'fn-input-wrapper',
                    template: `
    <div class="field">
      <label *ngIf="label" class="block text-sm font-semibold"
        >{{label}}</label
      >
      <div [ngClass]="{ 'p-input-icon-left': ico }" class="block">
        <fn-icon *ngIf="ico" [ico]="ico" class="z-1 text-primary"></fn-icon>
        <ng-content></ng-content>
      </div>
      <ng-content select="[error]"></ng-content>
    </div>
  `,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }], propDecorators: { ico: [{
                type: Input
            }], label: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtd3JhcHBlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9jbXAtbGliL3NyYy9saWIvZm9ybS9pbnB1dC13cmFwcGVyL2lucHV0LXdyYXBwZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBb0MsU0FBUyxFQUFjLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUcvRixPQUFPO0FBQ1AsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7Ozs7QUFpQi9FLE1BQU0sT0FBTyxxQkFBcUI7SUFJaEMsWUFDVSxFQUFjLEVBQ2QsS0FBd0I7UUFEeEIsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUNkLFVBQUssR0FBTCxLQUFLLENBQW1CO1FBTHpCLFFBQUcsR0FBa0IsSUFBSSxDQUFDO1FBQzFCLFVBQUssR0FBVyxFQUFFLENBQUM7SUFLekIsQ0FBQztJQUVKLGVBQWU7UUFDYixNQUFNLFFBQVEsR0FBSSxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUEsQ0FBQyxDQUFBLENBQUMsQ0FBQSxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUEsQ0FBQyxDQUFBLENBQUMsQ0FBQSxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUE7UUFFbEcsZ0NBQWdDO1FBQ2hDLElBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVTtZQUFFLE9BQU07UUFFL0IsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTVDLElBQUcsUUFBUSxDQUFDLFNBQVMsS0FBSyxZQUFZLEVBQUUsQ0FBQztZQUN2QyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztZQUU3QyxJQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLHNCQUFzQixDQUFDO2dCQUN6RCxJQUFJLENBQUMsR0FBRyxHQUFHLGNBQXdCLENBQUE7aUJBQ2hDLElBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUM7Z0JBQzlELElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBZ0IsQ0FBQTs7Z0JBRTNCLElBQUksQ0FBQyxHQUFHLEdBQUcsU0FBbUIsQ0FBQTtZQUVoQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QixLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUM7UUFDckMsQ0FBQztRQUVELElBQUcsUUFBUSxDQUFDLFNBQVMsS0FBSyxZQUFZO1lBQ3BDLElBQUcsSUFBSSxDQUFDLEdBQUc7Z0JBQ1QsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUE7UUFFaEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQTtJQUM1QixDQUFDOzhHQXBDVSxxQkFBcUI7a0dBQXJCLHFCQUFxQixnR0FidEI7Ozs7Ozs7Ozs7O0dBV1Q7OzJGQUVVLHFCQUFxQjtrQkFmakMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsa0JBQWtCO29CQUM1QixRQUFRLEVBQUU7Ozs7Ozs7Ozs7O0dBV1Q7aUJBQ0Y7K0dBRVUsR0FBRztzQkFBWCxLQUFLO2dCQUNHLEtBQUs7c0JBQWIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbi8vaW50ZXJmYWNlc1xyXG5pbXBvcnQgeyBGbkljb24gfSBmcm9tIFwiLi4vLi4vc2hhcmVkL2ludGVyZmFjZXMvZm4taWNvblwiO1xyXG4vL2ljb25zXHJcbmltcG9ydCB7IGlDYWxlbmRhciwgaUNsb2NrLCBpQ2FsZW5kYXJDbG9jayB9IGZyb20gXCJuZ3gtbXBmbi1kZXYtaWNvanMtcmVndWxhclwiO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdmbi1pbnB1dC13cmFwcGVyJyxcclxuICB0ZW1wbGF0ZTogYFxyXG4gICAgPGRpdiBjbGFzcz1cImZpZWxkXCI+XHJcbiAgICAgIDxsYWJlbCAqbmdJZj1cImxhYmVsXCIgY2xhc3M9XCJibG9jayB0ZXh0LXNtIGZvbnQtc2VtaWJvbGRcIlxyXG4gICAgICAgID57e2xhYmVsfX08L2xhYmVsXHJcbiAgICAgID5cclxuICAgICAgPGRpdiBbbmdDbGFzc109XCJ7ICdwLWlucHV0LWljb24tbGVmdCc6IGljbyB9XCIgY2xhc3M9XCJibG9ja1wiPlxyXG4gICAgICAgIDxmbi1pY29uICpuZ0lmPVwiaWNvXCIgW2ljb109XCJpY29cIiBjbGFzcz1cInotMSB0ZXh0LXByaW1hcnlcIj48L2ZuLWljb24+XHJcbiAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPG5nLWNvbnRlbnQgc2VsZWN0PVwiW2Vycm9yXVwiPjwvbmctY29udGVudD5cclxuICAgIDwvZGl2PlxyXG4gIGAsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBJbnB1dFdyYXBwZXJDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcclxuICBASW5wdXQoKSBpY286IEZuSWNvbiB8IG51bGwgPSBudWxsO1xyXG4gIEBJbnB1dCgpIGxhYmVsOiBzdHJpbmcgPSAnJztcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIGVsOiBFbGVtZW50UmVmLFxyXG4gICAgcHJpdmF0ZSBjZFJlZjogQ2hhbmdlRGV0ZWN0b3JSZWZcclxuICApIHt9XHJcblxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHByaW1lVGFnID0gIHRoaXMuZWwubmF0aXZlRWxlbWVudC5maXJzdENoaWxkLmNoaWxkcmVuW3RoaXMubGFiZWw/MTowXS5jaGlsZHJlblt0aGlzLmljbz8xOjBdXHJcblxyXG4gICAgLy9JZiBwcmltZVRhZy5maXJzdENoaWxkIGlzIG51bGxcclxuICAgIGlmKCFwcmltZVRhZy5maXJzdENoaWxkKSByZXR1cm5cclxuICAgIFxyXG4gICAgcHJpbWVUYWcuZmlyc3RDaGlsZC5jbGFzc0xpc3QuYWRkKCd3LWZ1bGwnKTtcclxuXHJcbiAgICBpZihwcmltZVRhZy5sb2NhbE5hbWUgPT09ICdwLWNhbGVuZGFyJykge1xyXG4gICAgICBjb25zdCBpbnB1dCA9IHByaW1lVGFnLmZpcnN0Q2hpbGQuZmlyc3RDaGlsZDtcclxuXHJcbiAgICAgIGlmKHByaW1lVGFnLmF0dHJpYnV0ZXMuZ2V0TmFtZWRJdGVtKCduZy1yZWZsZWN0LXNob3ctdGltZScpKVxyXG4gICAgICAgIHRoaXMuaWNvID0gaUNhbGVuZGFyQ2xvY2sgYXMgRm5JY29uXHJcbiAgICAgIGVsc2UgaWYocHJpbWVUYWcuYXR0cmlidXRlcy5nZXROYW1lZEl0ZW0oJ25nLXJlZmxlY3QtdGltZS1vbmx5JykpXHJcbiAgICAgICAgdGhpcy5pY28gPSBpQ2xvY2sgYXMgRm5JY29uXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB0aGlzLmljbyA9IGlDYWxlbmRhciBhcyBGbkljb25cclxuICAgICAgXHJcbiAgICAgIGlucHV0LmNsYXNzTGlzdC5hZGQoJ3ctZnVsbCcpO1xyXG4gICAgICBpbnB1dC5zdHlsZS5wYWRkaW5nTGVmdCA9IFwiMi41cmVtXCI7XHJcbiAgICB9XHJcblxyXG4gICAgaWYocHJpbWVUYWcubG9jYWxOYW1lID09PSAncC1kcm9wZG93bicpXHJcbiAgICAgIGlmKHRoaXMuaWNvKVxyXG4gICAgICAgIHByaW1lVGFnLmZpcnN0Q2hpbGQuY2hpbGRyZW5bMV0uc3R5bGUucGFkZGluZ0xlZnQgPSAnMi41cmVtJ1xyXG4gICAgXHJcbiAgICB0aGlzLmNkUmVmLmRldGVjdENoYW5nZXMoKVxyXG4gIH1cclxufVxyXG4iXX0=