import * as i0 from '@angular/core';
import { Injectable, Component, Input, Pipe, EventEmitter, ChangeDetectionStrategy, Optional, Self, Output, ViewChild, HostListener, NgModule } from '@angular/core';
import * as i1$1 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i1 from '@angular/platform-browser';
import { iCalendarClock, iClock, iCalendar, iFileUpload, iTrash, iFile, iEdit, iCheck, iFileImage, iFileAudio, iFileVideo } from 'ngx-mpfn-dev-icojs-regular';
import * as i3 from '@angular/forms';
import { FormsModule } from '@angular/forms';
import * as i3$1 from 'primeng/inputtext';
import { InputTextModule } from 'primeng/inputtext';
import * as i2 from 'primeng/button';
import { ButtonModule } from 'primeng/button';
import * as i1$2 from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { v4 } from 'uuid';
import * as i6 from 'primeng/progressbar';
import * as i7 from 'primeng/messages';
import * as i8 from 'primeng/radiobutton';
import { RadioButtonModule } from 'primeng/radiobutton';
import * as i9 from 'primeng/dropdown';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';

class CmpLibService {
    constructor() { }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: CmpLibService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: CmpLibService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: CmpLibService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

class CmpLibComponent {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: CmpLibComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: CmpLibComponent, selector: "lib-cmp-lib", ngImport: i0, template: `
    <p>
      cmp-lib works!
    </p>
  `, isInline: true }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: CmpLibComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-cmp-lib', template: `
    <p>
      cmp-lib works!
    </p>
  ` }]
        }] });

class IconComponent {
    constructor() {
        this.ico = {
            viewBox: '0 0 512 512',
            path: 'M512 216c0-9.079-7.009-23.88-23.72-23.88c-5.738 0-11.49 2.064-16.09 6.142l-158.5-158.5c4.078-4.593 6.143-10.35 6.143-16.09C319.9 7.028 305.2 0 296 0c-6.141 0-12.48 2.344-17.17 7.031l-127.8 128C146.3 139.7 144 145.9 144 152c0 12.79 10.3 24 24 24c5.689 0 11.27-2.234 15.8-6.258L246.1 232L175 303L169.4 297.4C163.1 291.1 154.9 288 146.7 288S130.4 291.1 124.1 297.4l-114.7 114.7c-6.25 6.248-9.375 14.43-9.375 22.62s3.125 16.37 9.375 22.62l45.25 45.25C60.87 508.9 69.06 512 77.25 512s16.37-3.125 22.62-9.375l114.7-114.7c6.25-6.25 9.376-14.44 9.376-22.62c0-8.185-3.125-16.37-9.374-22.62l-5.656-5.656L280 265.9l62.26 62.26c-4.078 4.593-6.143 10.35-6.143 16.09C336.1 360.1 350.8 368 360 368c6.141 0 12.28-2.344 16.97-7.031l128-127.8C509.7 228.5 512 222.1 512 216zM376 294.1L217.9 136L280 73.94L438.1 232L376 294.1z'
        };
        this.height = '1rem';
        this.color = "currentColor";
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: IconComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: IconComponent, selector: "fn-icon", inputs: { ico: "ico", height: "height", color: "color" }, host: { properties: { "style.width": "'calc('+height+'*1.25)'" } }, ngImport: i0, template: `
    <svg
      version="1.1"
      [attr.viewBox]="ico.viewBox"
      [attr.height]="height"
      [attr.fill]="color"
      >
      <path [attr.d]="ico.path" />
    </svg>
  `, isInline: true, styles: [":host{display:inline-flex;justify-content:center}\n", ":host-context(.p-input-icon-left):first-of-type{left:.75rem;color:#6c757d}\n", ":host-context(.p-input-icon-left){position:absolute;top:50%;margin-top:-.5rem}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: IconComponent, decorators: [{
            type: Component,
            args: [{ selector: 'fn-icon', template: `
    <svg
      version="1.1"
      [attr.viewBox]="ico.viewBox"
      [attr.height]="height"
      [attr.fill]="color"
      >
      <path [attr.d]="ico.path" />
    </svg>
  `, host: {
                        '[style.width]': "'calc('+height+'*1.25)'"
                    }, styles: [":host{display:inline-flex;justify-content:center}\n", ":host-context(.p-input-icon-left):first-of-type{left:.75rem;color:#6c757d}\n", ":host-context(.p-input-icon-left){position:absolute;top:50%;margin-top:-.5rem}\n"] }]
        }], propDecorators: { ico: [{
                type: Input
            }], height: [{
                type: Input
            }], color: [{
                type: Input
            }] } });

class SafeHtmlPipe {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
    }
    transform(value) {
        return this.sanitizer.bypassSecurityTrustHtml(value);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: SafeHtmlPipe, deps: [{ token: i1.DomSanitizer }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.3", ngImport: i0, type: SafeHtmlPipe, name: "safeHtml" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: SafeHtmlPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'safeHtml'
                }]
        }], ctorParameters: () => [{ type: i1.DomSanitizer }] });

class FnIconInstComponent {
    constructor() {
        this.ico = {
            viewBox: '0 0 640 512',
            path: ['<path fill="#0f2c52" d="M313.1 511.2l-288-63.1C10.42 443.1 0 430.1 0 416V64.01C0 43.19 19.56 27.92 39.76 32.97L64 39.03v325.6c0 14.1 10.42 27.98 25.06 31.24L320 447.2l230.9-51.32C565.6 392.6 576 379.7 576 364.7V39.03l24.24-6.058C620.4 27.92 640 43.19 640 64.01v351.1c0 14.1-10.42 27.99-25.06 31.24l-288 63.1C322.4 512.3 317.6 512.3 313.1 511.2z"/>', '<path fill="#d9a927" d="M64 32.4v323.1L304 416V40.02L100.9 .3879C81.5-2.649 64 12.54 64 32.4zM539.1 .3879L336 40.02V416l240-59.62V32.4C576 12.54 558.5-2.649 539.1 .3879z"/>']
        };
        this.height = "3rem";
        this.arrViewBox = this.ico.viewBox.split(' ');
        this.proportion = this.arrViewBox[2] / this.arrViewBox[3];
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnIconInstComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: FnIconInstComponent, selector: "fn-icon-inst", inputs: { ico: "ico", height: "height" }, host: { properties: { "style.width": "'calc(' + height + '*' + proportion + '*2)'", "style.height": "'calc(' + height + '*' + proportion + ' + ' + height + ')'" } }, ngImport: i0, template: `
    <svg
      version="1.1"
      [attr.viewBox]="ico.viewBox"
      [attr.height]="height"
    >
      <path *ngFor="let p of ico.path" [outerHTML]="p | safeHtml"/>
    </svg>
  `, isInline: true, styles: [":host{display:inline-flex;justify-content:center;align-items:center}\n"], dependencies: [{ kind: "directive", type: i1$1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "pipe", type: SafeHtmlPipe, name: "safeHtml" }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnIconInstComponent, decorators: [{
            type: Component,
            args: [{ selector: 'fn-icon-inst', template: `
    <svg
      version="1.1"
      [attr.viewBox]="ico.viewBox"
      [attr.height]="height"
    >
      <path *ngFor="let p of ico.path" [outerHTML]="p | safeHtml"/>
    </svg>
  `, host: {
                        '[style.width]': "'calc(' + height + '*' + proportion + '*2)'",
                        '[style.height]': "'calc(' + height + '*' + proportion + ' + ' + height + ')'",
                    }, styles: [":host{display:inline-flex;justify-content:center;align-items:center}\n"] }]
        }], propDecorators: { ico: [{
                type: Input
            }], height: [{
                type: Input
            }] } });

class FnTxtLogoComponent {
    constructor() {
        this.first = 'b';
        this.second = 'f';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnTxtLogoComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: FnTxtLogoComponent, selector: "fn-txt-logo", inputs: { first: "first", second: "second" }, ngImport: i0, template: `
    <div class="txt-logo font-bold text-5xl bg-white inline-block px-1">
      <span class="firstLetter">{{first}}</span>
      <span class="secondLetter">{{second}}</span>
    </div>
  `, isInline: true, styles: [".txt-logo{text-transform:uppercase;border-radius:0 0 12px 12px;line-height:1.2}\n", ".firstLetter{letter-spacing:-.6rem;color:#0e2e4a}\n", ".secondLetter{color:#f19700}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnTxtLogoComponent, decorators: [{
            type: Component,
            args: [{ selector: 'fn-txt-logo', template: `
    <div class="txt-logo font-bold text-5xl bg-white inline-block px-1">
      <span class="firstLetter">{{first}}</span>
      <span class="secondLetter">{{second}}</span>
    </div>
  `, styles: [".txt-logo{text-transform:uppercase;border-radius:0 0 12px 12px;line-height:1.2}\n", ".firstLetter{letter-spacing:-.6rem;color:#0e2e4a}\n", ".secondLetter{color:#f19700}\n"] }]
        }], propDecorators: { first: [{
                type: Input
            }], second: [{
                type: Input
            }] } });

class InputWrapperComponent {
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
  `, isInline: true, dependencies: [{ kind: "directive", type: i1$1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1$1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: IconComponent, selector: "fn-icon", inputs: ["ico", "height", "color"] }] }); }
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

const onlyNumbers = /^[0-9]+$/;
const validNames = /^(?! )(?!\s)[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+(?<!\s)(?! )$/i;
const onlyLetterNumberDash = /^[a-zA-Z0-9-]+$/;

var patternErrorMessage = {
    [onlyNumbers]: 'Campo debe ser númerico',
    [validNames]: 'Caracteres no válidos',
    [onlyLetterNumberDash]: 'Caracteres no válidos'
};

const errorMsg = {
    required: () => `El campo es requerido.`,
    minlength: ({ minlength }) => `Campo debe ser mínimo ${minlength.requiredLength} caracteres.`,
    maxlength: ({ maxlength }) => `Campo debe ser máximo ${maxlength.requiredLength} caracteres.`,
    email: () => `Correo electrónico inválido.`,
    notEqual: () => `Los campos ingresados no coinciden`
};
function getMessage(error) {
    let keyName = Object.keys(error)[0];
    if (keyName === 'pattern')
        return patternErrorMessage[error.pattern.requiredPattern];
    return errorMsg[keyName](error);
}
function ctrlErrorMsg(ctrl) {
    const hasError = ctrl?.touched && !ctrl?.valid;
    if (!hasError)
        return '';
    if (!ctrl.errors)
        return '';
    return getMessage(ctrl?.errors);
}

class FnInputComponent {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnInputComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i3.NgControl, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: FnInputComponent, selector: "fn-input", inputs: { type: "type", label: "label", ico: "ico", placeholder: "placeholder", disabled: "disabled", styleClass: "styleClass", checking: "checking", counter: "counter" }, outputs: { onBlur: "onBlur" }, providers: [
        // {
        //   provide: NG_VALUE_ACCESSOR,
        //   useExisting: forwardRef(() => FnInputComponent),
        //   multi: true
        // }
        ], viewQueries: [{ propertyName: "input", first: true, predicate: ["input"], descendants: true }], ngImport: i0, template: "<div\r\n  class=\"field\"\r\n  [ngClass]=\"{'mb-0': ngControl && counter && !errorMsg}\"\r\n>\r\n  <label\r\n    *ngIf=\"label\"\r\n    class=\"block text-sm font-semibold\"\r\n  >{{label}}</label>\r\n  <div\r\n    class=\"block\"\r\n    [ngClass]=\"{\r\n      'p-input-icon-left': ico,\r\n      'p-input-icon-right': !errorMsg\r\n    }\"\r\n  >\r\n    <fn-icon *ngIf=\"ico\" class=\"text-primary\" [ico]=\"ico\"></fn-icon>\r\n    <ng-container *ngIf=\"checking\">\r\n      <i></i>\r\n      <i\r\n        *ngIf=\"ngControl?.touched && !errorMsg\"\r\n        class=\"pi pi-check text-green-500\"\r\n      ></i>\r\n    </ng-container>\r\n    <input\r\n      #input\r\n      pInputText\r\n      [class]=\"'w-full ' + styleClass\"\r\n      [attr.type]=\"type\"\r\n      [value]=\"value\"\r\n      [attr.placeholder]=\"placeholder\"\r\n      [disabled]=\"disabled\"\r\n      (input)=\"onInput($event)\"\r\n      (blur)=\"onInputBlur($event)\"\r\n      [ngClass]=\"{\r\n        'ng-invalid ng-dirty': errorMsg\r\n      }\"\r\n    >\r\n  </div>\r\n  <small *ngIf=\"ngControl && counter && !errorMsg\" class=\"block text-right\">\r\n    {{ ngControl?.value?.length }}/{{ counter }}\r\n  </small>\r\n  <small *ngIf=\"errorMsg\" class=\"p-error block\">{{errorMsg}}</small>\r\n</div>", dependencies: [{ kind: "directive", type: i1$1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1$1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i3$1.InputText, selector: "[pInputText]", inputs: ["variant"] }, { kind: "component", type: IconComponent, selector: "fn-icon", inputs: ["ico", "height", "color"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
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
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i3.NgControl, decorators: [{
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

class FnDataFieldComponent {
    constructor() {
        this.label = 'Label';
        this.text = 'Texto Informativo';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnDataFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: FnDataFieldComponent, selector: "fn-data-field", inputs: { label: "label", text: "text" }, ngImport: i0, template: `
    <div class="field">
      <label class="text-color-secondary">{{label}}</label>
      <div>{{text}}</div>
    </div>
  `, isInline: true }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnDataFieldComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'fn-data-field',
                    template: `
    <div class="field">
      <label class="text-color-secondary">{{label}}</label>
      <div>{{text}}</div>
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: Input
            }], text: [{
                type: Input
            }] } });

class FnTimelineComponent {
    constructor() {
        this.items = [];
        this.currentIndex = 0;
        this.orientation = 'horizontal';
        this.maxWidth = 820;
        this.currentOrientation = 'horizontal';
        this.currentOrientation = this.orientation;
    }
    ngOnInit() {
        this.checkWindowSize();
    }
    onResize(event) {
        this.checkWindowSize();
    }
    checkWindowSize() {
        this.currentOrientation = window.innerWidth <= this.maxWidth ? 'vertical' : this.orientation;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnTimelineComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: FnTimelineComponent, selector: "fn-timeline", inputs: { items: "items", currentIndex: "currentIndex", orientation: "orientation", maxWidth: "maxWidth" }, host: { listeners: { "window:resize": "onResize($event)" } }, ngImport: i0, template: "<ul class=\"fn-timeline-container\">\r\n    <div\r\n        class=\"fn-timeline-content fn-timeline-{{currentOrientation}}\"\r\n    >\r\n        <div\r\n            *ngFor=\"let item of items; let index = index\"\r\n            class=\"timeline-point\"\r\n            [ngClass]=\"{\r\n                'current-point': index === currentIndex,\r\n                'passed-point': index < currentIndex,\r\n                'future-point': index > currentIndex\r\n            }\"\r\n        >   \r\n            <div class=\"point-container\">\r\n                <span></span>\r\n                <li>{{ item }}</li>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</ul>\r\n", styles: [".timeline-point-style,.fn-timeline-container .future-point span,.fn-timeline-container .passed-point span{background-color:#fff;border-radius:100%;border:2.5px solid #3F9FD6;display:block;height:15px;position:relative;width:15px}.timeline-item-style,.fn-timeline-container .future-point,.fn-timeline-container .current-point,.fn-timeline-container .passed-point{width:120px;min-width:120px;margin-left:20px}.timeline-item-style .point-container,.fn-timeline-container .future-point .point-container,.fn-timeline-container .current-point .point-container,.fn-timeline-container .passed-point .point-container{display:flex;flex-wrap:wrap;justify-content:center}.timeline-separator-style,.fn-timeline-container .future-point span:before,.fn-timeline-container .current-point span:before,.fn-timeline-container .passed-point span:before{content:\"\";height:2px;left:6px;position:absolute;top:4px;width:130px;z-index:-1}.fn-timeline-container{list-style:none;margin:0;padding:0;width:100%}.fn-timeline-container .fn-timeline-content.fn-timeline-horizontal{display:flex;justify-content:flex-start;padding-bottom:10px;overflow:auto}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical{display:block}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point{width:100%;min-width:100%;display:flex;margin-left:0!important;margin-bottom:20px}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point .point-container{align-items:center}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point .point-container li{display:inline-block;width:auto;margin-top:0;margin-left:15px}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point:last-child{margin-bottom:0}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.current-point .point-container li{margin-left:10px}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.passed-point .point-container,.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.future-point .point-container{margin-left:3px}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.passed-point .point-container li,.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.future-point .point-container li{margin-left:12px}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.passed-point span:before{height:34px;left:4px;width:2px}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.current-point span:before{border-bottom:none;width:2px;left:7px;height:36px;top:4px;border-left:2.5px dashed #CACACA}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.future-point span:before{border-bottom:none;width:2px;left:4px;height:34px;border-left:2.5px dashed #CACACA}.fn-timeline-container .fn-timeline-content::-webkit-scrollbar{width:4px;height:5px}.fn-timeline-container .fn-timeline-content::-webkit-scrollbar-thumb{background-color:#888;border-radius:4px}.fn-timeline-container .fn-timeline-content::-webkit-scrollbar-track{background-color:#f1f1f1}.fn-timeline-container li{margin-top:10px;text-align:center;width:100%}.fn-timeline-container .passed-point span{border:2.5px solid #3F9FD6}.fn-timeline-container .passed-point span:before{background-color:#3f9fd6}.fn-timeline-container .current-point span{height:20px;width:20px;display:block;background-color:#3f9fd6;border-radius:100%;border:2.5px solid #3F9FD6;position:relative}.fn-timeline-container .current-point span:before{background-color:transparent;border-bottom:2.5px dashed #CACACA;left:12px;top:2px}.fn-timeline-container .future-point span{border:2.5px solid #CACACA}.fn-timeline-container .future-point span:before{background-color:transparent;border-bottom:2.5px dashed #CACACA;top:2px}.fn-timeline-container .timeline-point:first-child{margin-left:0}.fn-timeline-container .timeline-point:last-child span:before{display:none}\n"], dependencies: [{ kind: "directive", type: i1$1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1$1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnTimelineComponent, decorators: [{
            type: Component,
            args: [{ selector: 'fn-timeline', template: "<ul class=\"fn-timeline-container\">\r\n    <div\r\n        class=\"fn-timeline-content fn-timeline-{{currentOrientation}}\"\r\n    >\r\n        <div\r\n            *ngFor=\"let item of items; let index = index\"\r\n            class=\"timeline-point\"\r\n            [ngClass]=\"{\r\n                'current-point': index === currentIndex,\r\n                'passed-point': index < currentIndex,\r\n                'future-point': index > currentIndex\r\n            }\"\r\n        >   \r\n            <div class=\"point-container\">\r\n                <span></span>\r\n                <li>{{ item }}</li>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</ul>\r\n", styles: [".timeline-point-style,.fn-timeline-container .future-point span,.fn-timeline-container .passed-point span{background-color:#fff;border-radius:100%;border:2.5px solid #3F9FD6;display:block;height:15px;position:relative;width:15px}.timeline-item-style,.fn-timeline-container .future-point,.fn-timeline-container .current-point,.fn-timeline-container .passed-point{width:120px;min-width:120px;margin-left:20px}.timeline-item-style .point-container,.fn-timeline-container .future-point .point-container,.fn-timeline-container .current-point .point-container,.fn-timeline-container .passed-point .point-container{display:flex;flex-wrap:wrap;justify-content:center}.timeline-separator-style,.fn-timeline-container .future-point span:before,.fn-timeline-container .current-point span:before,.fn-timeline-container .passed-point span:before{content:\"\";height:2px;left:6px;position:absolute;top:4px;width:130px;z-index:-1}.fn-timeline-container{list-style:none;margin:0;padding:0;width:100%}.fn-timeline-container .fn-timeline-content.fn-timeline-horizontal{display:flex;justify-content:flex-start;padding-bottom:10px;overflow:auto}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical{display:block}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point{width:100%;min-width:100%;display:flex;margin-left:0!important;margin-bottom:20px}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point .point-container{align-items:center}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point .point-container li{display:inline-block;width:auto;margin-top:0;margin-left:15px}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point:last-child{margin-bottom:0}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.current-point .point-container li{margin-left:10px}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.passed-point .point-container,.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.future-point .point-container{margin-left:3px}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.passed-point .point-container li,.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.future-point .point-container li{margin-left:12px}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.passed-point span:before{height:34px;left:4px;width:2px}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.current-point span:before{border-bottom:none;width:2px;left:7px;height:36px;top:4px;border-left:2.5px dashed #CACACA}.fn-timeline-container .fn-timeline-content.fn-timeline-vertical .timeline-point.future-point span:before{border-bottom:none;width:2px;left:4px;height:34px;border-left:2.5px dashed #CACACA}.fn-timeline-container .fn-timeline-content::-webkit-scrollbar{width:4px;height:5px}.fn-timeline-container .fn-timeline-content::-webkit-scrollbar-thumb{background-color:#888;border-radius:4px}.fn-timeline-container .fn-timeline-content::-webkit-scrollbar-track{background-color:#f1f1f1}.fn-timeline-container li{margin-top:10px;text-align:center;width:100%}.fn-timeline-container .passed-point span{border:2.5px solid #3F9FD6}.fn-timeline-container .passed-point span:before{background-color:#3f9fd6}.fn-timeline-container .current-point span{height:20px;width:20px;display:block;background-color:#3f9fd6;border-radius:100%;border:2.5px solid #3F9FD6;position:relative}.fn-timeline-container .current-point span:before{background-color:transparent;border-bottom:2.5px dashed #CACACA;left:12px;top:2px}.fn-timeline-container .future-point span{border:2.5px solid #CACACA}.fn-timeline-container .future-point span:before{background-color:transparent;border-bottom:2.5px dashed #CACACA;top:2px}.fn-timeline-container .timeline-point:first-child{margin-left:0}.fn-timeline-container .timeline-point:last-child span:before{display:none}\n"] }]
        }], ctorParameters: () => [], propDecorators: { items: [{
                type: Input
            }], currentIndex: [{
                type: Input
            }], orientation: [{
                type: Input
            }], maxWidth: [{
                type: Input
            }], onResize: [{
                type: HostListener,
                args: ['window:resize', ['$event']]
            }] } });

class FnTableBtnComponent {
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
  `, isInline: true, styles: ["button{border:2px solid!important}\n", ".btn-shading{background-color:var(--surface-overlay)}\n"], dependencies: [{ kind: "directive", type: i1$1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1$1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.ButtonDirective, selector: "[pButton]", inputs: ["iconPos", "loadingIcon", "label", "icon", "loading", "severity", "raised", "rounded", "text", "outlined", "size", "plain"] }, { kind: "component", type: IconComponent, selector: "fn-icon", inputs: ["ico", "height", "color"] }] }); }
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

const FILE_TYPE = Object.freeze({
    image: '.jpg, .jpeg, .png',
    video: '.h264, .3gp, .webm, .mkv, .mp4, .mov, .avi',
    audio: '.mp3, .aac, .wav',
    document: '.pdf, .doc, .docx, .ppt',
    pdf: '.pdf',
    excel: '.xls,.xlsx',
    get all() {
        return [this.image, this.video, this.audio, this.document].join();
    }
});
//descripción de extensión
const EXT_DESC = (type) => {
    return FILE_TYPE[type].replace(/,([^,]*)$/, ' O$1').replaceAll('.', '').toUpperCase();
};
const FILE_DESCRIPTION = {
    all: `Puede subir imágenes (${EXT_DESC('image')}), videos (${EXT_DESC('video')}), audios (${EXT_DESC('audio')}) y documentos (${EXT_DESC('document')}).`,
    image: `Puede subir imágenes (${EXT_DESC('image')}).`,
    video: `Puede subir videos (${EXT_DESC('video')}).`,
    audio: `Puede subir audios (${EXT_DESC('audio')}).`,
    document: `Puede subir documentos (${EXT_DESC('document')}).`,
    pdf: `Solo puede subir un documento en formato PDF.`,
    excel: `Solo puede subir un archivo en formato Excel.`,
};
const FORMAT_FILE_SIZE = (bytes, decimalPoint = 2) => {
    if (bytes == 0)
        return '0 Bytes';
    let k = 1024;
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) + ' ' + sizes[i];
};
class FnFileUploadComponent {
    constructor(http, zone, renderer) {
        this.http = http;
        this.zone = zone;
        this.renderer = renderer;
        this.url = 'http://172.16.111.128:8081/ms-mesa/repositorio/676'; //endpoint
        this.deleteURL = 'http://172.16.111.128:8081/ms-mesa/repositorio/eliminar?url=';
        this.maxFileSize = 1048576; //1mb
        this.label = 'Subir documentos';
        this.type = 'all';
        this.headers = new HttpHeaders;
        this.disabled = false;
        this.multiple = true;
        this.files = [];
        this.perFileLabel = 'por archivo';
        this.firstLabel = 'Arrastra y suelta los archivos a subir o';
        this.isAccumulated = false; //Es acumulado, por defecto false. Indica que todo el peso de los archivos de todos los componentes tendran una sumatoria total que no debe superar a maxFileSize
        this.isInMemory = false; //La lógica de subida de files se mantiene en memoria y no envia al servidor
        this.sumSize = 0;
        this.sumSizeChange = new EventEmitter();
        this.isSignDigital = false; //Muestra otra lista de documentos adjuntos
        this.isSignMassive = false; //Oculta lista documentos adjuntos el formulario se hace en cada componente por agilidad y limitantes en este componente
        this.dataDropDown = [];
        this.dataDropDownSelected = null;
        this.dataRadioButton = [];
        this.filesChange = new EventEmitter();
        this.processSignDocument = new EventEmitter();
        this.invalidFileLimitMessageSummary = "Se ha excedido el número máximo de archivos, ";
        this.invalidFileLimitMessageDetail = "el límite es {0} como máximo.";
        //error msg for maxFileSize
        this.invalidFileSizeMessageSummary = "{0}: Tamaño de archivo no válido, ";
        this.invalidFileSizeMessageDetail = "el tamaño máximo de subida es {0}.";
        //tipo de archivo no permitido
        this.invalidFileTypeMessageSummary = '{0}: Tipo de archivo inválido, ';
        this.invalidFileTypeMessageDetail = 'tipo de archivos permitidos: {0}';
        //error maximo total de tamaño cuando isInMemory: true
        this.invalidmaxSizeLimitMessageSummary = "Se ha excedido en el limite total de los archivos {0}, ";
        this.invalidmaxSizeLimitMessageDetail = "el límite restante es de {0}";
        this.iFileUpload = iFileUpload;
        this.iTrashCan = iTrash;
        this.iFile = iFile;
        this.iEdit = iEdit;
        this.iCheck = iCheck;
        // public uploadedFiles: any[] = [];
        this.msgs = [];
        this.uploadingFile = false;
        this.tmpFormData = new FormData();
    }
    get acceptedFiles() {
        return FILE_TYPE[this.type];
    }
    get filesDescription() {
        if (this.type === 'pdf') {
            return this.fileLimit === 1 ? FILE_DESCRIPTION[this.type] : 'Solo puede subir documentos en formato PDF';
        }
        else {
            return FILE_DESCRIPTION[this.type];
        }
    }
    get titleDocumentUpload() {
        if (this.files.length === 1) {
            return 'Documento subido';
        }
        else {
            return 'Documentos subidos';
        }
    }
    get maxFileSizeDescription() {
        return FORMAT_FILE_SIZE(this.maxFileSize);
    }
    getFileSize(size) {
        return FORMAT_FILE_SIZE(size);
    }
    ngAfterViewInit() {
        this.zone.runOutsideAngular(() => {
            if (this.content) {
                this.dragOverListener = this.renderer.listen(this.content.nativeElement, 'dragover', this.onDragOver.bind(this));
            }
        });
    }
    getFileCategoryIcon(fileName) {
        const extension = fileName.slice(fileName.lastIndexOf('.'));
        if (FILE_TYPE.image.includes(extension))
            return iFileImage;
        else if (FILE_TYPE.audio.includes(extension))
            return iFileAudio;
        else if (FILE_TYPE.video.includes(extension))
            return iFileVideo;
        else
            return iFile;
    }
    /* public onUpload(e:any) {
      console.log('El e: ', e);
      
      console.log(e.originalEvent.body);
      for(let file of e.files) {
        this.uploadedFiles.push({
          name: file.name,
          size: file.size,
          id: Date.now().toString(36) + Math.random().toString(36).substring(2)
        });
      }
  
    } */
    chooseFile() {
        this.fileInput.nativeElement.click();
    }
    onFileUpload(event) {
        console.log(event);
    }
    //TODO: new component
    validate(file) {
        this.msgs = [];
        if (this.fileLimit && (this.fileLimit <= this.files.length)) {
            this.msgs.push({
                severity: 'error',
                summary: this.invalidFileLimitMessageSummary.replace('{0}', this.fileLimit.toString()),
                detail: this.invalidFileLimitMessageDetail.replace('{0}', this.fileLimit.toString())
            });
            return false;
        }
        if (this.isFileExists(file)) {
            this.msgs.push({
                severity: 'error',
                summary: `Archivo duplicado, `,
                detail: `el archivo ${file.name} ya ha sido subido.`
            });
            return false;
        }
        if (this.acceptedFiles && !this.isFileTypeValid(file)) {
            this.msgs.push({
                severity: 'error',
                summary: this.invalidFileTypeMessageSummary.replace('{0}', file.name),
                detail: this.invalidFileTypeMessageDetail.replace('{0}', this.acceptedFiles)
            });
            return false;
        }
        if (this.maxFileSize && file.size > this.maxFileSize) {
            this.msgs.push({
                severity: 'error',
                summary: this.invalidFileSizeMessageSummary.replace('{0}', file.name),
                detail: this.invalidFileSizeMessageDetail.replace('{0}', FORMAT_FILE_SIZE(this.maxFileSize))
            });
            this.processSignDocument.emit({ process: 3 });
            return false;
        }
        if (this.isInMemory || this.isAccumulated) {
            let sumFile = file.size;
            if ((this.sumSize + sumFile) > this.maxFileSize) {
                this.msgs.push({
                    severity: 'error',
                    summary: this.invalidmaxSizeLimitMessageSummary.replace('{0}', FORMAT_FILE_SIZE(this.maxFileSize)),
                    detail: this.invalidmaxSizeLimitMessageDetail.replace('{0}', FORMAT_FILE_SIZE(this.maxFileSize - this.sumSize))
                });
                this.processSignDocument.emit({ process: 3 });
                return false;
            }
        }
        return true;
    }
    isFileTypeValid(file) {
        let acceptableTypes = this.acceptedFiles?.split(',').map((type) => type.trim());
        for (let type of acceptableTypes) {
            let acceptable = this.isWildcard(type) ? this.getTypeClass(file.type) === this.getTypeClass(type) : file.type == type || this.getFileExtension(file).toLowerCase() === type.toLowerCase();
            if (acceptable) {
                return true;
            }
        }
        return false;
    }
    getTypeClass(fileType) {
        return fileType.substring(0, fileType.indexOf('/'));
    }
    isWildcard(fileType) {
        return fileType.indexOf('*') !== -1;
    }
    getFileExtension(file) {
        return '.' + file.name.split('.').pop();
    }
    isFileExists(file) {
        const fileFound = this.files.find(i => i.nombreOrigen === file.name);
        return fileFound && (fileFound.tamanyo === file.size);
    }
    onFileSelect(event) {
        let files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
        if (this.fileLimit && files.length > this.fileLimit) {
            this.msgs = [];
            this.msgs.push({
                severity: 'error',
                summary: this.invalidFileLimitMessageSummary.replace('{0}', this.fileLimit.toString()),
                detail: this.invalidFileLimitMessageDetail.replace('{0}', this.fileLimit.toString())
            });
            return;
        }
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (this.validate(file)) {
                if (!this.isInMemory) {
                    this.uploadingFile = true;
                    this.tmpFormData = new FormData();
                    this.tmpFormData.append('file', file);
                    /* const headers = new HttpHeaders()
                      .set('Authorization', 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJST0JFUlQgWkFDSEFSWSBFU1BJTk9aQSBDRVNQRURFUyIsImlzcyI6Imh0dHA6Ly8xODEuMTc2LjE0NS4xNTU6NzA4My9jZmV0b2tlbi9yZXNvdXJjZXMvdjIvbG9naW5Ub2tlbiIsImlwIjoiMTkyLjE2OC4xLjE0IiwidXN1YXJpbyI6eyJlc3RhZG8iOiIwMSIsImlwIjoiMTkyLjE2OC4xLjE0IiwidXN1YXJpbyI6IjEwNzY0MjY0IiwiaW5mbyI6eyJhcGVsbGlkb1BhdGVybm8iOiJFU1BJTk9aQSIsImVzUHJpbWVyTG9naW4iOmZhbHNlLCJkbmkiOiIxMDc2NDI2NCIsIm5vbWJyZXMiOiJST0JFUlQgWkFDSEFSWSIsImFwZWxsaWRvTWF0ZXJubyI6IkNFU1BFREVTIn0sImNvZERlcGVuZGVuY2lhIjoiNDAwNjAxNDUwNCIsImRlcGVuZGVuY2lhIjoiNMKwIEZJU0NBTElBIFBST1ZJTkNJQUwgUEVOQUwgQ09SUE9SQVRJVkEgREUgVkVOVEFOSUxMQSIsImNvZERlc3BhY2hvIjoiNDAwNjAxNDUwNC0yIiwic2VkZSI6IkNPUlBPUkFUSVZBIiwiZGVzcGFjaG8iOiIywrAgREVTUEFDSE8iLCJjb2RDYXJnbyI6IkZQIiwiY29kU2VkZSI6IjAwMTAwIiwiY2FyZ28iOiJGSVNDQUwgUFJPVklOQ0lBTCIsImNvZERpc3RyaXRvRmlzY2FsIjoiMDA0NyIsImRpc3RyaXRvRmlzY2FsIjoiRElTVFJJVE8gRklTQ0FMIERFIExJTUEgTk9ST0VTVEUiLCJkbmlGaXNjYWwiOiIxMDc2NDI2NCIsImRpcmVjY2lvbiI6IkFBLiBISC4gTE9TIExJQ0VOQ0lBRE9TIE1aLiBWLSAzIExPVEUgMzMgLSBWRU5UQU5JTExBIiwiZmlzY2FsIjoiUk9CRVJUIFpBQ0hBUlkgRVNQSU5PWkEgQ0VTUEVERVMiLCJjb3JyZW9GaXNjYWwiOiJjcmlzb3RnQGhvdG1haWwuY29tIiwiY29kSmVyYXJxdWlhIjoiMDEiLCJjb2RDYXRlZ29yaWEiOiIwMSIsImNvZEVzcGVjaWFsaWRhZCI6IjAxIiwidWJpZ2VvIjoiMDcwMTA2IiwiZGlzdHJpdG8iOiJWRU5UQU5JTExBIiwiY29ycmVvIjoiY3Jpc290Z0Bob3RtYWlsLmNvbSIsInRlbGVmb25vIjoiIiwic2lzdGVtYXMiOlt7ImNvZGlnbyI6IjE0NSIsIm9wY2lvbmVzIjpbIjAyIiwiMDMiLCIwNCIsIjA3IiwiMjEiLCIyMiIsIjIzIiwiMjQiLCIyNSIsIjI2IiwiMjgiLCIzMSIsIjQ2IiwiNTAiXSwicGVyZmlsZXMiOlsiMDMiXX0seyJjb2RpZ28iOiIxNDciLCJvcGNpb25lcyI6W10sInBlcmZpbGVzIjpbIjExIl19LHsiY29kaWdvIjoiMjAwIiwib3BjaW9uZXMiOlsiMjAwLTAxIiwiMjAwLTAzIiwiMjAwLTA0IiwiMjAwLTA2IiwiMjAwLTA5Il0sInBlcmZpbGVzIjpbIjI1IiwiMjkiLCIzMSJdfSx7ImNvZGlnbyI6IjE1NSIsIm9wY2lvbmVzIjpbIjAyIiwiMDQiLCIwNSIsIjA2IiwiMDciLCIwOCIsIjA5Il0sInBlcmZpbGVzIjpbIjIxIl19LHsiY29kaWdvIjoiMjAzIiwib3BjaW9uZXMiOlsiMjAzLTAxIiwiMjAzLTAyIl0sInBlcmZpbGVzIjpbIjY0Il19XX0sImlhdCI6MTYyNTc4NjY5NSwiZXhwIjoxNzgzNTUzMDk1fQ.MYVn7aUf-CWoZaNqRvoCSAUz1t1J3LOsVos2SAQj1orveXvYg1onhCRe9PbRkXBbMQvCZIAt0JgEkLKxzfjmMw') */
                    this.http.post(`${this.url}`, this.tmpFormData)
                        .subscribe({
                        next: (res) => {
                            this.uploadingFile = false;
                            this.setFilesSaved(file, res.data);
                            // this.files.push(res.data);
                        },
                        error: (error) => {
                            this.uploadingFile = false;
                            this.msgs = [];
                            this.msgs.push({
                                severity: 'error',
                                summary: 'Error: ',
                                detail: `el archivo ${file.name} no pudo ser cargado.`
                            });
                        }
                    });
                    // this.files.push(file.name)
                    /* this.files.push({
                      id: 40311 + i + 1,
                      carpeta: "mesa-partes/anexos",
                      extension: "pdf",
                      mimetype: "application/pdf",
                      path: "mesa-partes/anexos/anexo1.pdf",
                      tags: [],
                      detalle: {},
                      nombre: `${file.name}`,
                      tamanyo: file.size,
                      paginas: 1,
                      archivo: 623312,
                      fecCreacion: "2023-05-25 19:25:06",
                      fecModificacion: "2023-05-25 19:25:06",
                      nombreUsuarioCreacion: "",
                      nombreUsuarioModificacion: ''
                    }) */
                }
                else {
                    let data = { nombreArchivo: file.name, numeroFolios: 0 };
                    this.setFilesSaved(file, data);
                    /* let info={
                       id: uuidv4(),
                       file: file,
                       nombre: file.name,
                       nombreOrigen: file.name,
                       tamanyo: file.size
                     }
                     this.files.push(info);
                     this.getCurrentSumSize(); */
                }
            }
        }
    }
    setFilesSaved(file, data) {
        let isFocus = this.files.length === 0 ? true : false;
        let isFirst = this.files.length === 0 ? true : false;
        let info = {
            id: v4(),
            file: file,
            nombre: data.nombreArchivo,
            numeroFolios: data.numeroFolios,
            nombreOrigen: file.name,
            tamanyo: file.size,
            dataSelected: this.dataDropDownSelected,
            descriptionDocument: null,
            observationDocument: null,
            nombreRadio: null,
            optionRadio: null,
            isSign: false,
            isFocus: isFocus,
            isFirst: isFirst,
            process: 0 //0 para visualizar, 1 para firmar, 2 eliminar, 3 se supero peso máximo permito
        };
        this.files.push(info);
        this.getCurrentSumSize();
        if (isFocus)
            this.processSignDocument.emit(info);
    }
    /*emitterFirstFile(): void {
      this.files[0].isFocus = true
      this.processSignDocument.emit(this.files[0])
    }*/
    getCurrentSumSize() {
        this.sumSize = this.files.map(file => file.tamanyo)
            .reduce((acc, value) => acc + value, 0);
        this.sumSizeChange.emit(this.sumSize);
    }
    showDocument(file) {
        if (!file.isFocus) {
            this.files.map(fileArray => {
                if (fileArray.id === file.id)
                    fileArray.isFocus = true;
                else
                    fileArray.isFocus = false;
            });
            file.process = 0;
            this.processSignDocument.emit(file);
        }
    }
    signDocument(file) {
        /*VALIDACION FILE*/
        this.msgs = [];
        if (file.dataSelected === null || file.dataSelected.code === 'TDD') {
            this.msgs.push({
                severity: 'error',
                summary: 'Tipo de documento',
                detail: 'Seleccione un tipo de documento'
            });
            return false;
        }
        if (file.descriptionDocument === null || file.descriptionDocument === '') {
            this.msgs.push({
                severity: 'error',
                summary: 'Número de documento',
                detail: 'Dígite descripción de número de documento'
            });
            return false;
        }
        if (file.descriptionDocument.trim().length > 60) {
            this.msgs.push({
                severity: 'error',
                summary: 'Número de documento',
                detail: 'La descripción de número de documento no debe superar los 60 caracteres'
            });
            return false;
        }
        if (file.optionRadio === null || file.optionRadio === '') {
            this.msgs.push({
                severity: 'error',
                summary: 'Tipo de copia',
                detail: 'Seleccione un tipo de copia válido'
            });
            return false;
        }
        if (!file.isFocus) {
            this.files.map(fileArray => {
                if (fileArray.id === file.id)
                    fileArray.isFocus = true;
                else
                    fileArray.isFocus = false;
            });
        }
        file.process = 1;
        this.processSignDocument.emit(file);
        return true;
    }
    onDragEnter(e) {
        if (!this.disabled) {
            e.stopPropagation();
            e.preventDefault();
        }
    }
    onDragOver(e) {
        if (!this.disabled) {
            /* DomHandler.addClass(this.content?.nativeElement, 'p-fileupload-highlight');
            this.dragHighlight = true; */
            e.stopPropagation();
            e.preventDefault();
        }
    }
    onDragLeave(event) {
        if (!this.disabled) {
            // DomHandler.removeClass(this.content?.nativeElement, 'p-fileupload-highlight');
        }
    }
    onDrop(event) {
        if (!this.disabled) {
            // DomHandler.removeClass(this.content?.nativeElement, 'p-fileupload-highlight');
            event.stopPropagation();
            event.preventDefault();
            let files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
            let allowDrop = this.multiple || (files && files.length === 1);
            if (allowDrop) {
                this.onFileSelect(event);
            }
        }
    }
    /* public onDeleteFile(id: number) {
      const indexToDelete = this.files.findIndex(i => i.id === id);
      // Remove via api await
      this.files.splice(indexToDelete, 1);
    } */
    removeAttachment(file) {
        if (!this.isInMemory) {
            /* const headers = new HttpHeaders()
                  .set('Authorization', 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJST0JFUlQgWkFDSEFSWSBFU1BJTk9aQSBDRVNQRURFUyIsImlzcyI6Imh0dHA6Ly8xODEuMTc2LjE0NS4xNTU6NzA4My9jZmV0b2tlbi9yZXNvdXJjZXMvdjIvbG9naW5Ub2tlbiIsImlwIjoiMTkyLjE2OC4xLjE0IiwidXN1YXJpbyI6eyJlc3RhZG8iOiIwMSIsImlwIjoiMTkyLjE2OC4xLjE0IiwidXN1YXJpbyI6IjEwNzY0MjY0IiwiaW5mbyI6eyJhcGVsbGlkb1BhdGVybm8iOiJFU1BJTk9aQSIsImVzUHJpbWVyTG9naW4iOmZhbHNlLCJkbmkiOiIxMDc2NDI2NCIsIm5vbWJyZXMiOiJST0JFUlQgWkFDSEFSWSIsImFwZWxsaWRvTWF0ZXJubyI6IkNFU1BFREVTIn0sImNvZERlcGVuZGVuY2lhIjoiNDAwNjAxNDUwNCIsImRlcGVuZGVuY2lhIjoiNMKwIEZJU0NBTElBIFBST1ZJTkNJQUwgUEVOQUwgQ09SUE9SQVRJVkEgREUgVkVOVEFOSUxMQSIsImNvZERlc3BhY2hvIjoiNDAwNjAxNDUwNC0yIiwic2VkZSI6IkNPUlBPUkFUSVZBIiwiZGVzcGFjaG8iOiIywrAgREVTUEFDSE8iLCJjb2RDYXJnbyI6IkZQIiwiY29kU2VkZSI6IjAwMTAwIiwiY2FyZ28iOiJGSVNDQUwgUFJPVklOQ0lBTCIsImNvZERpc3RyaXRvRmlzY2FsIjoiMDA0NyIsImRpc3RyaXRvRmlzY2FsIjoiRElTVFJJVE8gRklTQ0FMIERFIExJTUEgTk9ST0VTVEUiLCJkbmlGaXNjYWwiOiIxMDc2NDI2NCIsImRpcmVjY2lvbiI6IkFBLiBISC4gTE9TIExJQ0VOQ0lBRE9TIE1aLiBWLSAzIExPVEUgMzMgLSBWRU5UQU5JTExBIiwiZmlzY2FsIjoiUk9CRVJUIFpBQ0hBUlkgRVNQSU5PWkEgQ0VTUEVERVMiLCJjb3JyZW9GaXNjYWwiOiJjcmlzb3RnQGhvdG1haWwuY29tIiwiY29kSmVyYXJxdWlhIjoiMDEiLCJjb2RDYXRlZ29yaWEiOiIwMSIsImNvZEVzcGVjaWFsaWRhZCI6IjAxIiwidWJpZ2VvIjoiMDcwMTA2IiwiZGlzdHJpdG8iOiJWRU5UQU5JTExBIiwiY29ycmVvIjoiY3Jpc290Z0Bob3RtYWlsLmNvbSIsInRlbGVmb25vIjoiIiwic2lzdGVtYXMiOlt7ImNvZGlnbyI6IjE0NSIsIm9wY2lvbmVzIjpbIjAyIiwiMDMiLCIwNCIsIjA3IiwiMjEiLCIyMiIsIjIzIiwiMjQiLCIyNSIsIjI2IiwiMjgiLCIzMSIsIjQ2IiwiNTAiXSwicGVyZmlsZXMiOlsiMDMiXX0seyJjb2RpZ28iOiIxNDciLCJvcGNpb25lcyI6W10sInBlcmZpbGVzIjpbIjExIl19LHsiY29kaWdvIjoiMjAwIiwib3BjaW9uZXMiOlsiMjAwLTAxIiwiMjAwLTAzIiwiMjAwLTA0IiwiMjAwLTA2IiwiMjAwLTA5Il0sInBlcmZpbGVzIjpbIjI1IiwiMjkiLCIzMSJdfSx7ImNvZGlnbyI6IjE1NSIsIm9wY2lvbmVzIjpbIjAyIiwiMDQiLCIwNSIsIjA2IiwiMDciLCIwOCIsIjA5Il0sInBlcmZpbGVzIjpbIjIxIl19LHsiY29kaWdvIjoiMjAzIiwib3BjaW9uZXMiOlsiMjAzLTAxIiwiMjAzLTAyIl0sInBlcmZpbGVzIjpbIjY0Il19XX0sImlhdCI6MTYyNTc4NjY5NSwiZXhwIjoxNzgzNTUzMDk1fQ.MYVn7aUf-CWoZaNqRvoCSAUz1t1J3LOsVos2SAQj1orveXvYg1onhCRe9PbRkXBbMQvCZIAt0JgEkLKxzfjmMw') */
            this.http.delete(`${this.deleteURL}${file.name}`).subscribe({
                next: (res) => {
                    const indexToDelete = this.files.findIndex(i => i.id === file.id);
                    this.files.splice(indexToDelete, 1);
                    this.msgs = [];
                    this.msgs.push({
                        severity: 'success',
                        summary: `${file.nombreOrigen}: `,
                        detail: `El anexo fue eliminado satisfactoriamente.`
                    });
                    file.process = 2; //eliminar
                    this.processSignDocument.emit(file);
                },
                error: (error) => {
                    this.msgs = [];
                    this.msgs.push({
                        severity: 'error',
                        summary: `${file.nombreOrigen}: `,
                        detail: `El archivo no pudo ser removido.`
                    });
                }
            });
        }
        else {
            const indexToDelete = this.files.findIndex(i => i.id === file.id);
            this.files.splice(indexToDelete, 1);
            this.getCurrentSumSize();
            this.msgs = [];
            this.msgs.push({
                severity: 'success',
                summary: `${file.nombreOrigen}: `,
                detail: `El anexo fue eliminado satisfactoriamente.`
            });
            file.process = 2; //eliminar
            this.processSignDocument.emit(file);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnFileUploadComponent, deps: [{ token: i1$2.HttpClient }, { token: i0.NgZone }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: FnFileUploadComponent, selector: "fn-file-upload", inputs: { url: "url", deleteURL: "deleteURL", maxFileSize: "maxFileSize", label: "label", type: "type", fileLimit: "fileLimit", headers: "headers", disabled: "disabled", multiple: "multiple", files: "files", perFileLabel: "perFileLabel", firstLabel: "firstLabel", isAccumulated: "isAccumulated", isInMemory: "isInMemory", sumSize: "sumSize", isSignDigital: "isSignDigital", isSignMassive: "isSignMassive", dataDropDown: "dataDropDown", dataDropDownSelected: "dataDropDownSelected", dataRadioButton: "dataRadioButton" }, outputs: { sumSizeChange: "sumSizeChange", filesChange: "filesChange", processSignDocument: "processSignDocument" }, viewQueries: [{ propertyName: "fileInput", first: true, predicate: ["fileInput"], descendants: true }, { propertyName: "content", first: true, predicate: ["content"], descendants: true }], ngImport: i0, template: "<div class=\"field\">\r\n  <label *ngIf=\"!isSignDigital\" class=\"block text-sm font-semibold\">{{ label }}</label>\r\n\r\n  <div #content (dragenter)=\"onDragEnter($event)\" (dragleave)=\"onDragLeave($event)\" (drop)=\"onDrop($event)\"\r\n    class=\"flex flex-column align-items-center border-dashed border-round border-2 select-none surface-border\"\r\n    [ngClass]=\"isSignDigital ? 'p-3' : 'p-6'\">\r\n    <div *ngIf=\"uploadingFile\" class=\"w-full -mt-3 mb-5\">\r\n      <p-progressBar mode=\"indeterminate\" [style]=\"{ height: '6px' }\"></p-progressBar>\r\n    </div>\r\n    <p-messages [value]=\"msgs\" [enableService]=\"false\"></p-messages>\r\n\r\n    <fn-icon [ico]=\"iFileUpload\" height=\"2rem\" color=\"#B3B3B3\" class=\"mb-3 mt-3\"></fn-icon>\r\n    <div class=\"font-semibold\">\r\n      {{ firstLabel }}\r\n      <label (click)=\"chooseFile()\" class=\"text-blue-400 underline cursor-pointer\">\r\n        haz click aqu\u00ED\r\n      </label>\r\n      <input #fileInput class=\"hidden\" type=\"file\" [multiple]=\"multiple\" [disabled]=\"disabled\" [accept]=\"acceptedFiles\"\r\n        (change)=\"onFileSelect($event)\">\r\n    </div>\r\n    <p class=\"text-center px-6 text-700\">{{ filesDescription }}</p>\r\n    <p class=\"font-semibold text-sm text-700\">M\u00E1ximo {{ maxFileSizeDescription }} {{ perFileLabel }}</p>\r\n  </div>\r\n\r\n</div>\r\n\r\n<div class=\"field\" *ngIf=\"files.length > 0 && !isSignDigital\">\r\n  <label class=\"block text-sm font-semibold\">{{ titleDocumentUpload }}</label>\r\n  <div class=\"flex justify-content-between align-items-center mb-2\" *ngFor=\"let file of files; let i = index\">\r\n    <div class=\"flex align-items-center\">\r\n      <div class=\"surface-200 border-round px-1 py-2 flex align-items-center\">\r\n        <fn-icon [ico]=\"getFileCategoryIcon(file.nombre)\"></fn-icon>\r\n      </div>\r\n      <div class=\"ml-3\">\r\n        <span class=\"font-semibold mr-1\">Anexo {{ i+1 }}: </span>\r\n        {{ file.nombreOrigen }}\r\n        <i class=\"pi pi-check text-green-500 ml-1\"></i>\r\n      </div>\r\n    </div>\r\n    <div class=\"flex align-items-center\">\r\n      {{getFileSize(file.tamanyo)}}\r\n      <p-button (onClick)=\"removeAttachment(file)\" class=\"ml-1\" styleClass=\"p-button-text\">\r\n        <fn-icon [ico]=\"iTrashCan\"></fn-icon>\r\n      </p-button>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class=\"field\" *ngIf=\"files.length > 0 && isSignDigital && !isSignMassive\">\r\n  <div class=\"mb-2\" *ngFor=\"let file of files; let i = index\">\r\n    <div [ngClass]=\"file.isFocus ? 'bg-color' : 'null'\">\r\n      <div class=\"flex justify-content-between align-items-center\">\r\n        <div class=\"flex flex-wrap cursor-pointer\" (click)=\"showDocument(file)\">\r\n          <fn-icon [ico]=\"iFile\" height=\"1.1rem\"></fn-icon>\r\n          <span class=\"font-semibold mr-1\">Anexo {{ i+1 }}: </span>\r\n        </div>\r\n        <div class=\"flex flex-wrap border-round flex align-items-center\">\r\n          <i class=\"pi pi-check text-green-500 ml-1\"></i>\r\n          <span class=\"fontsize-10 ml-1 mr-2\">{{getFileSize(file.tamanyo)}}</span>\r\n          <p-button *ngIf=\"!file.isSign\" (onClick)=\"signDocument(file)\" styleClass=\"p-button-text refactor\">\r\n            <fn-icon [ico]=\"iEdit\" height=\"1.5rem\"></fn-icon>\r\n          </p-button>\r\n          <p-button *ngIf=\"file.isSign\" styleClass=\"p-button-text refactor\" [disabled]=\"true\">\r\n            <fn-icon [ico]=\"iCheck\" height=\"1.5rem\"></fn-icon>\r\n          </p-button>\r\n          <p-button (onClick)=\"removeAttachment(file)\" styleClass=\"p-button-text refactor\">\r\n            <fn-icon [ico]=\"iTrashCan\" height=\"1.5rem\"></fn-icon>\r\n          </p-button>\r\n        </div>\r\n      </div>\r\n      <div class=\"ml-3 cursor-pointer\" (click)=\"showDocument(file)\">  {{ file.nombreOrigen }} </div>\r\n    </div>\r\n\r\n    <div class=\"flex justify-content-between align-items-center gap-3 mt-2\">\r\n      <p-dropdown [options]=\"dataDropDown\" [disabled]=\"file.isSign\" [(ngModel)]=\"file.dataSelected\"\r\n        optionLabel=\"label\"></p-dropdown>\r\n      <input class=\"flex-1\" type=\"text\" maxlength=\"60\" pInputText [(ngModel)]=\"file.descriptionDocument\"\r\n        [disabled]=\"file.isSign\" placeholder=\"Ingresar el n\u00FAmero del documento\" />\r\n    </div>\r\n    <div class=\"flex justify-content-between align-items-center mt-2\">\r\n      <div *ngIf=\"!file.isSign\" class=\"flex flex-wrap gap-3\">\r\n        <div *ngFor=\"let dataRadio of dataRadioButton; index as i;\">\r\n          <div class=\"flex align-items-center\">\r\n            <p-radioButton name=\"typecopy\" value=\"{{dataRadio.id}}\" [(ngModel)]=\"file.optionRadio\"\r\n              inputId=\"or{{i}}{{file.id}}\" (onClick)=\"file.nombreRadio = dataRadio.noDescripcion\"></p-radioButton>\r\n            <label for=\"or{{i}}{{file.id}}\" class=\"ml-2\">{{dataRadio.noDescripcion}}</label>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      <div *ngIf=\"file.isSign\" class=\"flex flex-wrap gap-3\">\r\n        <div class=\"flex align-items-center\">\r\n          <p-radioButton name=\"result\" value=\"{{file.optionRadio}}\" [(ngModel)]=\"file.optionRadio\" [disabled]=\"true\"\r\n            inputId=\"ores{{file.id}}\"></p-radioButton>\r\n          <label class=\"ml-2\">{{file.nombreRadio}}</label>\r\n        </div>\r\n        <div class=\"badge-firma-ok flex align-items-center\">\r\n          <span>Documento firmado digitalmente</span>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"mt-2\">\r\n      <input class=\"wp-100\" type=\"text\" maxlength=\"60\" pInputText [(ngModel)]=\"file.observationDocument\"\r\n      [disabled]=\"file.isSign\" placeholder=\"Observaci\u00F3n (Opcional)\" />\r\n    </div>\r\n  </div>\r\n</div>", styles: [".flex-1{flex:1}.fontsize-10{font-size:10px}.badge-firma-ok{color:#3cc85a;background-color:#d9ecf7;padding:.3rem;border-radius:5px;font-weight:600;font-size:11px}.cursor-pointer{cursor:pointer}.bg-color{background-color:#89898929}.wp-100{width:100%}\n"], dependencies: [{ kind: "directive", type: i1$1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1$1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1$1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i3.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i3.MaxLengthValidator, selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]", inputs: ["maxlength"] }, { kind: "directive", type: i3.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i3$1.InputText, selector: "[pInputText]", inputs: ["variant"] }, { kind: "component", type: i2.Button, selector: "p-button", inputs: ["type", "iconPos", "icon", "badge", "label", "disabled", "loading", "loadingIcon", "raised", "rounded", "text", "plain", "severity", "outlined", "link", "tabindex", "size", "style", "styleClass", "badgeClass", "ariaLabel", "autofocus"], outputs: ["onClick", "onFocus", "onBlur"] }, { kind: "component", type: i6.ProgressBar, selector: "p-progressBar", inputs: ["value", "showValue", "styleClass", "style", "unit", "mode", "color"] }, { kind: "component", type: i7.Messages, selector: "p-messages", inputs: ["value", "closable", "style", "styleClass", "enableService", "key", "escape", "severity", "showTransitionOptions", "hideTransitionOptions"], outputs: ["valueChange", "onClose"] }, { kind: "component", type: i8.RadioButton, selector: "p-radioButton", inputs: ["value", "formControlName", "name", "disabled", "label", "variant", "tabindex", "inputId", "ariaLabelledBy", "ariaLabel", "style", "styleClass", "labelStyleClass", "autofocus"], outputs: ["onClick", "onFocus", "onBlur"] }, { kind: "component", type: i9.Dropdown, selector: "p-dropdown", inputs: ["id", "scrollHeight", "filter", "name", "style", "panelStyle", "styleClass", "panelStyleClass", "readonly", "required", "editable", "appendTo", "tabindex", "placeholder", "loadingIcon", "filterPlaceholder", "filterLocale", "variant", "inputId", "dataKey", "filterBy", "filterFields", "autofocus", "resetFilterOnHide", "checkmark", "dropdownIcon", "loading", "optionLabel", "optionValue", "optionDisabled", "optionGroupLabel", "optionGroupChildren", "autoDisplayFirst", "group", "showClear", "emptyFilterMessage", "emptyMessage", "lazy", "virtualScroll", "virtualScrollItemSize", "virtualScrollOptions", "overlayOptions", "ariaFilterLabel", "ariaLabel", "ariaLabelledBy", "filterMatchMode", "maxlength", "tooltip", "tooltipPosition", "tooltipPositionStyle", "tooltipStyleClass", "focusOnHover", "selectOnFocus", "autoOptionFocus", "autofocusFilter", "disabled", "itemSize", "autoZIndex", "baseZIndex", "showTransitionOptions", "hideTransitionOptions", "filterValue", "options"], outputs: ["onChange", "onFilter", "onFocus", "onBlur", "onClick", "onShow", "onHide", "onClear", "onLazyLoad"] }, { kind: "component", type: IconComponent, selector: "fn-icon", inputs: ["ico", "height", "color"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnFileUploadComponent, decorators: [{
            type: Component,
            args: [{ selector: 'fn-file-upload', template: "<div class=\"field\">\r\n  <label *ngIf=\"!isSignDigital\" class=\"block text-sm font-semibold\">{{ label }}</label>\r\n\r\n  <div #content (dragenter)=\"onDragEnter($event)\" (dragleave)=\"onDragLeave($event)\" (drop)=\"onDrop($event)\"\r\n    class=\"flex flex-column align-items-center border-dashed border-round border-2 select-none surface-border\"\r\n    [ngClass]=\"isSignDigital ? 'p-3' : 'p-6'\">\r\n    <div *ngIf=\"uploadingFile\" class=\"w-full -mt-3 mb-5\">\r\n      <p-progressBar mode=\"indeterminate\" [style]=\"{ height: '6px' }\"></p-progressBar>\r\n    </div>\r\n    <p-messages [value]=\"msgs\" [enableService]=\"false\"></p-messages>\r\n\r\n    <fn-icon [ico]=\"iFileUpload\" height=\"2rem\" color=\"#B3B3B3\" class=\"mb-3 mt-3\"></fn-icon>\r\n    <div class=\"font-semibold\">\r\n      {{ firstLabel }}\r\n      <label (click)=\"chooseFile()\" class=\"text-blue-400 underline cursor-pointer\">\r\n        haz click aqu\u00ED\r\n      </label>\r\n      <input #fileInput class=\"hidden\" type=\"file\" [multiple]=\"multiple\" [disabled]=\"disabled\" [accept]=\"acceptedFiles\"\r\n        (change)=\"onFileSelect($event)\">\r\n    </div>\r\n    <p class=\"text-center px-6 text-700\">{{ filesDescription }}</p>\r\n    <p class=\"font-semibold text-sm text-700\">M\u00E1ximo {{ maxFileSizeDescription }} {{ perFileLabel }}</p>\r\n  </div>\r\n\r\n</div>\r\n\r\n<div class=\"field\" *ngIf=\"files.length > 0 && !isSignDigital\">\r\n  <label class=\"block text-sm font-semibold\">{{ titleDocumentUpload }}</label>\r\n  <div class=\"flex justify-content-between align-items-center mb-2\" *ngFor=\"let file of files; let i = index\">\r\n    <div class=\"flex align-items-center\">\r\n      <div class=\"surface-200 border-round px-1 py-2 flex align-items-center\">\r\n        <fn-icon [ico]=\"getFileCategoryIcon(file.nombre)\"></fn-icon>\r\n      </div>\r\n      <div class=\"ml-3\">\r\n        <span class=\"font-semibold mr-1\">Anexo {{ i+1 }}: </span>\r\n        {{ file.nombreOrigen }}\r\n        <i class=\"pi pi-check text-green-500 ml-1\"></i>\r\n      </div>\r\n    </div>\r\n    <div class=\"flex align-items-center\">\r\n      {{getFileSize(file.tamanyo)}}\r\n      <p-button (onClick)=\"removeAttachment(file)\" class=\"ml-1\" styleClass=\"p-button-text\">\r\n        <fn-icon [ico]=\"iTrashCan\"></fn-icon>\r\n      </p-button>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class=\"field\" *ngIf=\"files.length > 0 && isSignDigital && !isSignMassive\">\r\n  <div class=\"mb-2\" *ngFor=\"let file of files; let i = index\">\r\n    <div [ngClass]=\"file.isFocus ? 'bg-color' : 'null'\">\r\n      <div class=\"flex justify-content-between align-items-center\">\r\n        <div class=\"flex flex-wrap cursor-pointer\" (click)=\"showDocument(file)\">\r\n          <fn-icon [ico]=\"iFile\" height=\"1.1rem\"></fn-icon>\r\n          <span class=\"font-semibold mr-1\">Anexo {{ i+1 }}: </span>\r\n        </div>\r\n        <div class=\"flex flex-wrap border-round flex align-items-center\">\r\n          <i class=\"pi pi-check text-green-500 ml-1\"></i>\r\n          <span class=\"fontsize-10 ml-1 mr-2\">{{getFileSize(file.tamanyo)}}</span>\r\n          <p-button *ngIf=\"!file.isSign\" (onClick)=\"signDocument(file)\" styleClass=\"p-button-text refactor\">\r\n            <fn-icon [ico]=\"iEdit\" height=\"1.5rem\"></fn-icon>\r\n          </p-button>\r\n          <p-button *ngIf=\"file.isSign\" styleClass=\"p-button-text refactor\" [disabled]=\"true\">\r\n            <fn-icon [ico]=\"iCheck\" height=\"1.5rem\"></fn-icon>\r\n          </p-button>\r\n          <p-button (onClick)=\"removeAttachment(file)\" styleClass=\"p-button-text refactor\">\r\n            <fn-icon [ico]=\"iTrashCan\" height=\"1.5rem\"></fn-icon>\r\n          </p-button>\r\n        </div>\r\n      </div>\r\n      <div class=\"ml-3 cursor-pointer\" (click)=\"showDocument(file)\">  {{ file.nombreOrigen }} </div>\r\n    </div>\r\n\r\n    <div class=\"flex justify-content-between align-items-center gap-3 mt-2\">\r\n      <p-dropdown [options]=\"dataDropDown\" [disabled]=\"file.isSign\" [(ngModel)]=\"file.dataSelected\"\r\n        optionLabel=\"label\"></p-dropdown>\r\n      <input class=\"flex-1\" type=\"text\" maxlength=\"60\" pInputText [(ngModel)]=\"file.descriptionDocument\"\r\n        [disabled]=\"file.isSign\" placeholder=\"Ingresar el n\u00FAmero del documento\" />\r\n    </div>\r\n    <div class=\"flex justify-content-between align-items-center mt-2\">\r\n      <div *ngIf=\"!file.isSign\" class=\"flex flex-wrap gap-3\">\r\n        <div *ngFor=\"let dataRadio of dataRadioButton; index as i;\">\r\n          <div class=\"flex align-items-center\">\r\n            <p-radioButton name=\"typecopy\" value=\"{{dataRadio.id}}\" [(ngModel)]=\"file.optionRadio\"\r\n              inputId=\"or{{i}}{{file.id}}\" (onClick)=\"file.nombreRadio = dataRadio.noDescripcion\"></p-radioButton>\r\n            <label for=\"or{{i}}{{file.id}}\" class=\"ml-2\">{{dataRadio.noDescripcion}}</label>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      <div *ngIf=\"file.isSign\" class=\"flex flex-wrap gap-3\">\r\n        <div class=\"flex align-items-center\">\r\n          <p-radioButton name=\"result\" value=\"{{file.optionRadio}}\" [(ngModel)]=\"file.optionRadio\" [disabled]=\"true\"\r\n            inputId=\"ores{{file.id}}\"></p-radioButton>\r\n          <label class=\"ml-2\">{{file.nombreRadio}}</label>\r\n        </div>\r\n        <div class=\"badge-firma-ok flex align-items-center\">\r\n          <span>Documento firmado digitalmente</span>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"mt-2\">\r\n      <input class=\"wp-100\" type=\"text\" maxlength=\"60\" pInputText [(ngModel)]=\"file.observationDocument\"\r\n      [disabled]=\"file.isSign\" placeholder=\"Observaci\u00F3n (Opcional)\" />\r\n    </div>\r\n  </div>\r\n</div>", styles: [".flex-1{flex:1}.fontsize-10{font-size:10px}.badge-firma-ok{color:#3cc85a;background-color:#d9ecf7;padding:.3rem;border-radius:5px;font-weight:600;font-size:11px}.cursor-pointer{cursor:pointer}.bg-color{background-color:#89898929}.wp-100{width:100%}\n"] }]
        }], ctorParameters: () => [{ type: i1$2.HttpClient }, { type: i0.NgZone }, { type: i0.Renderer2 }], propDecorators: { url: [{
                type: Input
            }], deleteURL: [{
                type: Input
            }], maxFileSize: [{
                type: Input
            }], label: [{
                type: Input
            }], type: [{
                type: Input
            }], fileLimit: [{
                type: Input
            }], headers: [{
                type: Input
            }], disabled: [{
                type: Input
            }], multiple: [{
                type: Input
            }], files: [{
                type: Input
            }], perFileLabel: [{
                type: Input
            }], firstLabel: [{
                type: Input
            }], isAccumulated: [{
                type: Input
            }], isInMemory: [{
                type: Input
            }], sumSize: [{
                type: Input
            }], sumSizeChange: [{
                type: Output
            }], fileInput: [{
                type: ViewChild,
                args: ['fileInput']
            }], content: [{
                type: ViewChild,
                args: ['content']
            }], isSignDigital: [{
                type: Input
            }], isSignMassive: [{
                type: Input
            }], dataDropDown: [{
                type: Input
            }], dataDropDownSelected: [{
                type: Input
            }], dataRadioButton: [{
                type: Input
            }], filesChange: [{
                type: Output
            }], processSignDocument: [{
                type: Output
            }] } });

class CmpLibModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: CmpLibModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.1.3", ngImport: i0, type: CmpLibModule, declarations: [CmpLibComponent,
            IconComponent,
            FnDataFieldComponent,
            FnTableBtnComponent,
            FnTxtLogoComponent,
            InputWrapperComponent,
            FnIconInstComponent,
            SafeHtmlPipe,
            FnInputComponent,
            FnFileUploadComponent,
            FnTimelineComponent], imports: [CommonModule,
            FormsModule,
            InputTextModule,
            ButtonModule,
            FileUploadModule,
            RadioButtonModule,
            DropdownModule
            // HttpClientModule
        ], exports: [CmpLibComponent,
            IconComponent,
            FnDataFieldComponent,
            FnTableBtnComponent,
            FnTxtLogoComponent,
            InputWrapperComponent,
            FnIconInstComponent,
            SafeHtmlPipe,
            FnInputComponent,
            FnFileUploadComponent,
            FnTimelineComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: CmpLibModule, imports: [CommonModule,
            FormsModule,
            InputTextModule,
            ButtonModule,
            FileUploadModule,
            RadioButtonModule,
            DropdownModule
            // HttpClientModule
        ] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: CmpLibModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        CmpLibComponent,
                        IconComponent,
                        FnDataFieldComponent,
                        FnTableBtnComponent,
                        FnTxtLogoComponent,
                        InputWrapperComponent,
                        FnIconInstComponent,
                        SafeHtmlPipe,
                        FnInputComponent,
                        FnFileUploadComponent,
                        FnTimelineComponent,
                    ],
                    imports: [
                        CommonModule,
                        FormsModule,
                        InputTextModule,
                        ButtonModule,
                        FileUploadModule,
                        RadioButtonModule,
                        DropdownModule
                        // HttpClientModule
                    ],
                    exports: [
                        CmpLibComponent,
                        IconComponent,
                        FnDataFieldComponent,
                        FnTableBtnComponent,
                        FnTxtLogoComponent,
                        InputWrapperComponent,
                        FnIconInstComponent,
                        SafeHtmlPipe,
                        FnInputComponent,
                        FnFileUploadComponent,
                        FnTimelineComponent
                    ]
                }]
        }] });

class ValidatorsService {
    constructor() { }
    isField1EqualFiel2(field1, field2) {
        return (formGroup) => {
            const fieldValue1 = formGroup.get(field1)?.value;
            const fieldValue2 = formGroup.get(field2)?.value;
            if (fieldValue1 !== fieldValue2) {
                formGroup.get(field2)?.setErrors({ notEqual: true });
                return { notEquals: true };
            }
            formGroup.get(field2)?.setErrors(null);
            return null;
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: ValidatorsService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: ValidatorsService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: ValidatorsService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

/*
 * Public API Surface of cmp-lib
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CmpLibComponent, CmpLibModule, CmpLibService, FnDataFieldComponent, FnFileUploadComponent, FnIconInstComponent, FnInputComponent, FnTableBtnComponent, FnTimelineComponent, FnTxtLogoComponent, IconComponent, InputWrapperComponent, SafeHtmlPipe, ValidatorsService, ctrlErrorMsg, onlyLetterNumberDash, onlyNumbers, validNames };
//# sourceMappingURL=ngx-mpfn-dev-cmp-lib.mjs.map
