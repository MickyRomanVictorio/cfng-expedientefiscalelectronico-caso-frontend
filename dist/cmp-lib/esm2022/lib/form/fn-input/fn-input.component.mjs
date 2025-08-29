import { ChangeDetectionStrategy, Component, EventEmitter, Input, Optional, Output, Self, ViewChild } from '@angular/core';
//util
import { ctrlErrorMsg } from '../../shared/utils/input-error';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/common";
import * as i3 from "primeng/inputtext";
import * as i4 from "../../icon/icon.component";
export class FnInputComponent {
    constructor(cd, ngControl) {
        this.cd = cd;
        this.ngControl = ngControl;
        this.type = "text";
        this.label = "";
        this.ico = null;
        this.placeholder = "";
        this.disabled = false;
        this.styleClass = "";
        //
        this.checking = false;
        this.counter = 0;
        this.onBlur = new EventEmitter();
        this.value = '';
        this.onModelChange = () => { };
        this.onModelTouched = () => { };
        if (this.ngControl != null)
            this.ngControl.valueAccessor = this;
    }
    get errorMsg() {
        return ctrlErrorMsg(this.ngControl?.control);
    }
    onInput(event) {
        this.value = event.target.value;
        this.onModelChange(this.value);
    }
    onInputBlur(event) {
        this.onModelTouched();
        this.onBlur.emit(event);
    }
    writeValue(value) {
        if (value === undefined)
            this.value = '';
        else
            this.value = value;
        this.cd.markForCheck();
    }
    registerOnChange(fn) {
        this.onModelChange = fn;
    }
    registerOnTouched(fn) {
        this.onModelTouched = fn;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnInputComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.NgControl, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: FnInputComponent, selector: "fn-input", inputs: { type: "type", label: "label", ico: "ico", placeholder: "placeholder", disabled: "disabled", styleClass: "styleClass", checking: "checking", counter: "counter" }, outputs: { onBlur: "onBlur" }, providers: [
        // {
        //   provide: NG_VALUE_ACCESSOR,
        //   useExisting: forwardRef(() => FnInputComponent),
        //   multi: true
        // }
        ], viewQueries: [{ propertyName: "input", first: true, predicate: ["input"], descendants: true }], ngImport: i0, template: "<div\r\n  class=\"field\"\r\n  [ngClass]=\"{'mb-0': ngControl && counter && !errorMsg}\"\r\n>\r\n  <label\r\n    *ngIf=\"label\"\r\n    class=\"block text-sm font-semibold\"\r\n  >{{label}}</label>\r\n  <div\r\n    class=\"block\"\r\n    [ngClass]=\"{\r\n      'p-input-icon-left': ico,\r\n      'p-input-icon-right': !errorMsg\r\n    }\"\r\n  >\r\n    <fn-icon *ngIf=\"ico\" class=\"text-primary\" [ico]=\"ico\"></fn-icon>\r\n    <ng-container *ngIf=\"checking\">\r\n      <i></i>\r\n      <i\r\n        *ngIf=\"ngControl?.touched && !errorMsg\"\r\n        class=\"pi pi-check text-green-500\"\r\n      ></i>\r\n    </ng-container>\r\n    <input\r\n      #input\r\n      pInputText\r\n      [class]=\"'w-full ' + styleClass\"\r\n      [attr.type]=\"type\"\r\n      [value]=\"value\"\r\n      [attr.placeholder]=\"placeholder\"\r\n      [disabled]=\"disabled\"\r\n      (input)=\"onInput($event)\"\r\n      (blur)=\"onInputBlur($event)\"\r\n      [ngClass]=\"{\r\n        'ng-invalid ng-dirty': errorMsg\r\n      }\"\r\n    >\r\n  </div>\r\n  <small *ngIf=\"ngControl && counter && !errorMsg\" class=\"block text-right\">\r\n    {{ ngControl?.value?.length }}/{{ counter }}\r\n  </small>\r\n  <small *ngIf=\"errorMsg\" class=\"p-error block\">{{errorMsg}}</small>\r\n</div>", dependencies: [{ kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i3.InputText, selector: "[pInputText]", inputs: ["variant"] }, { kind: "component", type: i4.IconComponent, selector: "fn-icon", inputs: ["ico", "height", "color"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'fn-input', providers: [
                    // {
                    //   provide: NG_VALUE_ACCESSOR,
                    //   useExisting: forwardRef(() => FnInputComponent),
                    //   multi: true
                    // }
                    ], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div\r\n  class=\"field\"\r\n  [ngClass]=\"{'mb-0': ngControl && counter && !errorMsg}\"\r\n>\r\n  <label\r\n    *ngIf=\"label\"\r\n    class=\"block text-sm font-semibold\"\r\n  >{{label}}</label>\r\n  <div\r\n    class=\"block\"\r\n    [ngClass]=\"{\r\n      'p-input-icon-left': ico,\r\n      'p-input-icon-right': !errorMsg\r\n    }\"\r\n  >\r\n    <fn-icon *ngIf=\"ico\" class=\"text-primary\" [ico]=\"ico\"></fn-icon>\r\n    <ng-container *ngIf=\"checking\">\r\n      <i></i>\r\n      <i\r\n        *ngIf=\"ngControl?.touched && !errorMsg\"\r\n        class=\"pi pi-check text-green-500\"\r\n      ></i>\r\n    </ng-container>\r\n    <input\r\n      #input\r\n      pInputText\r\n      [class]=\"'w-full ' + styleClass\"\r\n      [attr.type]=\"type\"\r\n      [value]=\"value\"\r\n      [attr.placeholder]=\"placeholder\"\r\n      [disabled]=\"disabled\"\r\n      (input)=\"onInput($event)\"\r\n      (blur)=\"onInputBlur($event)\"\r\n      [ngClass]=\"{\r\n        'ng-invalid ng-dirty': errorMsg\r\n      }\"\r\n    >\r\n  </div>\r\n  <small *ngIf=\"ngControl && counter && !errorMsg\" class=\"block text-right\">\r\n    {{ ngControl?.value?.length }}/{{ counter }}\r\n  </small>\r\n  <small *ngIf=\"errorMsg\" class=\"p-error block\">{{errorMsg}}</small>\r\n</div>" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.NgControl, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }] }], propDecorators: { type: [{
                type: Input
            }], label: [{
                type: Input
            }], ico: [{
                type: Input
            }], placeholder: [{
                type: Input
            }], disabled: [{
                type: Input
            }], styleClass: [{
                type: Input
            }], checking: [{
                type: Input
            }], counter: [{
                type: Input
            }], onBlur: [{
                type: Output
            }], input: [{
                type: ViewChild,
                args: ['input']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm4taW5wdXQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvY21wLWxpYi9zcmMvbGliL2Zvcm0vZm4taW5wdXQvZm4taW5wdXQuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvY21wLWxpYi9zcmMvbGliL2Zvcm0vZm4taW5wdXQvZm4taW5wdXQuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHVCQUF1QixFQUFxQixTQUFTLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQWMsTUFBTSxlQUFlLENBQUM7QUFFdEssTUFBTTtBQUNOLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQzs7Ozs7O0FBYzlELE1BQU0sT0FBTyxnQkFBZ0I7SUFxQjNCLFlBQ1UsRUFBcUIsRUFDRixTQUFvQjtRQUR2QyxPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQUNGLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFyQmpDLFNBQUksR0FBeUIsTUFBTSxDQUFDO1FBQ3BDLFVBQUssR0FBVyxFQUFFLENBQUM7UUFDbkIsUUFBRyxHQUFRLElBQUksQ0FBQztRQUNoQixnQkFBVyxHQUFXLEVBQUUsQ0FBQztRQUN6QixhQUFRLEdBQVksS0FBSyxDQUFDO1FBQzFCLGVBQVUsR0FBVyxFQUFFLENBQUM7UUFDeEMsRUFBRTtRQUNjLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUUxQixXQUFNLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFJbEQsVUFBSyxHQUFXLEVBQUUsQ0FBQztRQUVuQixrQkFBYSxHQUFhLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQTtRQUNsQyxtQkFBYyxHQUFhLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztRQU16QyxJQUFHLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSTtZQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7SUFDdkMsQ0FBQztJQUVELElBQUksUUFBUTtRQUNWLE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDOUMsQ0FBQztJQUVELE9BQU8sQ0FBQyxLQUFVO1FBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDaEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFZO1FBQ3RCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQVU7UUFDbkIsSUFBSSxLQUFLLEtBQUssU0FBUztZQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDOztZQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUV4QixJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxFQUFZO1FBQzNCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxFQUFZO1FBQzVCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQzNCLENBQUM7OEdBeERVLGdCQUFnQjtrR0FBaEIsZ0JBQWdCLDhPQVRoQjtRQUNULElBQUk7UUFDSixnQ0FBZ0M7UUFDaEMscURBQXFEO1FBQ3JELGdCQUFnQjtRQUNoQixJQUFJO1NBQ0wsMEhDZEgsMnZDQTBDTTs7MkZEekJPLGdCQUFnQjtrQkFaNUIsU0FBUzsrQkFDRSxVQUFVLGFBRVQ7b0JBQ1QsSUFBSTtvQkFDSixnQ0FBZ0M7b0JBQ2hDLHFEQUFxRDtvQkFDckQsZ0JBQWdCO29CQUNoQixJQUFJO3FCQUNMLG1CQUNnQix1QkFBdUIsQ0FBQyxNQUFNOzswQkF5QjVDLFFBQVE7OzBCQUFJLElBQUk7eUNBckJILElBQUk7c0JBQW5CLEtBQUs7Z0JBQ1UsS0FBSztzQkFBcEIsS0FBSztnQkFDVSxHQUFHO3NCQUFsQixLQUFLO2dCQUNVLFdBQVc7c0JBQTFCLEtBQUs7Z0JBQ1UsUUFBUTtzQkFBdkIsS0FBSztnQkFDVSxVQUFVO3NCQUF6QixLQUFLO2dCQUVVLFFBQVE7c0JBQXZCLEtBQUs7Z0JBQ1UsT0FBTztzQkFBdEIsS0FBSztnQkFFSSxNQUFNO3NCQUFmLE1BQU07Z0JBRWEsS0FBSztzQkFBeEIsU0FBUzt1QkFBQyxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE9wdGlvbmFsLCBPdXRwdXQsIFNlbGYsIFZpZXdDaGlsZCwgZm9yd2FyZFJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1IsIE5nQ29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuLy91dGlsXHJcbmltcG9ydCB7IGN0cmxFcnJvck1zZyB9IGZyb20gJy4uLy4uL3NoYXJlZC91dGlscy9pbnB1dC1lcnJvcic7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2ZuLWlucHV0JyxcclxuICB0ZW1wbGF0ZVVybDogJy4vZm4taW5wdXQuY29tcG9uZW50Lmh0bWwnLFxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAgLy8ge1xyXG4gICAgLy8gICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcclxuICAgIC8vICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gRm5JbnB1dENvbXBvbmVudCksXHJcbiAgICAvLyAgIG11bHRpOiB0cnVlXHJcbiAgICAvLyB9XHJcbiAgXSxcclxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxyXG59KVxyXG5leHBvcnQgY2xhc3MgRm5JbnB1dENvbXBvbmVudCBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcclxuXHJcbiAgQElucHV0KCkgcHVibGljIHR5cGU6IFwidGV4dFwiIHwgXCJwYXNzd29yZFwiID0gIFwidGV4dFwiO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBsYWJlbDogc3RyaW5nID0gXCJcIjtcclxuICBASW5wdXQoKSBwdWJsaWMgaWNvOiBhbnkgPSBudWxsO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBwbGFjZWhvbGRlcjogc3RyaW5nID0gXCJcIjtcclxuICBASW5wdXQoKSBwdWJsaWMgZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBASW5wdXQoKSBwdWJsaWMgc3R5bGVDbGFzczogc3RyaW5nID0gXCJcIjtcclxuICAvL1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBjaGVja2luZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBjb3VudGVyOiBudW1iZXIgPSAwO1xyXG5cclxuICBAT3V0cHV0KCkgb25CbHVyOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgQFZpZXdDaGlsZCgnaW5wdXQnKSBpbnB1dCE6IEVsZW1lbnRSZWZcclxuXHJcbiAgcHVibGljIHZhbHVlOiBzdHJpbmcgPSAnJztcclxuXHJcbiAgcHVibGljIG9uTW9kZWxDaGFuZ2U6IEZ1bmN0aW9uID0gKCkgPT4ge31cclxuICBwdWJsaWMgb25Nb2RlbFRvdWNoZWQ6IEZ1bmN0aW9uID0gKCkgPT4ge307XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYsXHJcbiAgICBAT3B0aW9uYWwoKSBAU2VsZigpIHB1YmxpYyBuZ0NvbnRyb2w6IE5nQ29udHJvbFxyXG4gICkge1xyXG4gICAgaWYodGhpcy5uZ0NvbnRyb2wgIT0gbnVsbClcclxuICAgICAgdGhpcy5uZ0NvbnRyb2wudmFsdWVBY2Nlc3NvciA9IHRoaXNcclxuICB9XHJcblxyXG4gIGdldCBlcnJvck1zZygpIHtcclxuICAgIHJldHVybiBjdHJsRXJyb3JNc2codGhpcy5uZ0NvbnRyb2w/LmNvbnRyb2wpXHJcbiAgfVxyXG5cclxuICBvbklucHV0KGV2ZW50OiBhbnkpIHtcclxuICAgIHRoaXMudmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XHJcbiAgICB0aGlzLm9uTW9kZWxDaGFuZ2UodGhpcy52YWx1ZSk7XHJcbiAgfVxyXG5cclxuICBvbklucHV0Qmx1cihldmVudDogRXZlbnQpIHtcclxuICAgIHRoaXMub25Nb2RlbFRvdWNoZWQoKTtcclxuICAgIHRoaXMub25CbHVyLmVtaXQoZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XHJcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkgdGhpcy52YWx1ZSA9ICcnO1xyXG4gICAgZWxzZSB0aGlzLnZhbHVlID0gdmFsdWU7XHJcblxyXG4gICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICB9XHJcblxyXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICB0aGlzLm9uTW9kZWxDaGFuZ2UgPSBmbjtcclxuICB9XHJcblxyXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgdGhpcy5vbk1vZGVsVG91Y2hlZCA9IGZuO1xyXG4gIH1cclxuXHJcbn1cclxuIiwiPGRpdlxyXG4gIGNsYXNzPVwiZmllbGRcIlxyXG4gIFtuZ0NsYXNzXT1cInsnbWItMCc6IG5nQ29udHJvbCAmJiBjb3VudGVyICYmICFlcnJvck1zZ31cIlxyXG4+XHJcbiAgPGxhYmVsXHJcbiAgICAqbmdJZj1cImxhYmVsXCJcclxuICAgIGNsYXNzPVwiYmxvY2sgdGV4dC1zbSBmb250LXNlbWlib2xkXCJcclxuICA+e3tsYWJlbH19PC9sYWJlbD5cclxuICA8ZGl2XHJcbiAgICBjbGFzcz1cImJsb2NrXCJcclxuICAgIFtuZ0NsYXNzXT1cIntcclxuICAgICAgJ3AtaW5wdXQtaWNvbi1sZWZ0JzogaWNvLFxyXG4gICAgICAncC1pbnB1dC1pY29uLXJpZ2h0JzogIWVycm9yTXNnXHJcbiAgICB9XCJcclxuICA+XHJcbiAgICA8Zm4taWNvbiAqbmdJZj1cImljb1wiIGNsYXNzPVwidGV4dC1wcmltYXJ5XCIgW2ljb109XCJpY29cIj48L2ZuLWljb24+XHJcbiAgICA8bmctY29udGFpbmVyICpuZ0lmPVwiY2hlY2tpbmdcIj5cclxuICAgICAgPGk+PC9pPlxyXG4gICAgICA8aVxyXG4gICAgICAgICpuZ0lmPVwibmdDb250cm9sPy50b3VjaGVkICYmICFlcnJvck1zZ1wiXHJcbiAgICAgICAgY2xhc3M9XCJwaSBwaS1jaGVjayB0ZXh0LWdyZWVuLTUwMFwiXHJcbiAgICAgID48L2k+XHJcbiAgICA8L25nLWNvbnRhaW5lcj5cclxuICAgIDxpbnB1dFxyXG4gICAgICAjaW5wdXRcclxuICAgICAgcElucHV0VGV4dFxyXG4gICAgICBbY2xhc3NdPVwiJ3ctZnVsbCAnICsgc3R5bGVDbGFzc1wiXHJcbiAgICAgIFthdHRyLnR5cGVdPVwidHlwZVwiXHJcbiAgICAgIFt2YWx1ZV09XCJ2YWx1ZVwiXHJcbiAgICAgIFthdHRyLnBsYWNlaG9sZGVyXT1cInBsYWNlaG9sZGVyXCJcclxuICAgICAgW2Rpc2FibGVkXT1cImRpc2FibGVkXCJcclxuICAgICAgKGlucHV0KT1cIm9uSW5wdXQoJGV2ZW50KVwiXHJcbiAgICAgIChibHVyKT1cIm9uSW5wdXRCbHVyKCRldmVudClcIlxyXG4gICAgICBbbmdDbGFzc109XCJ7XHJcbiAgICAgICAgJ25nLWludmFsaWQgbmctZGlydHknOiBlcnJvck1zZ1xyXG4gICAgICB9XCJcclxuICAgID5cclxuICA8L2Rpdj5cclxuICA8c21hbGwgKm5nSWY9XCJuZ0NvbnRyb2wgJiYgY291bnRlciAmJiAhZXJyb3JNc2dcIiBjbGFzcz1cImJsb2NrIHRleHQtcmlnaHRcIj5cclxuICAgIHt7IG5nQ29udHJvbD8udmFsdWU/Lmxlbmd0aCB9fS97eyBjb3VudGVyIH19XHJcbiAgPC9zbWFsbD5cclxuICA8c21hbGwgKm5nSWY9XCJlcnJvck1zZ1wiIGNsYXNzPVwicC1lcnJvciBibG9ja1wiPnt7ZXJyb3JNc2d9fTwvc21hbGw+XHJcbjwvZGl2PiJdfQ==