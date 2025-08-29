import * as i0 from '@angular/core';
import { Injectable, Component, NgModule } from '@angular/core';
import { NgClass } from '@angular/common';
import * as i2 from 'primeng/dynamicdialog';
import { DialogService } from 'primeng/dynamicdialog';
import * as i3 from '@angular/platform-browser';
import { Observable } from 'rxjs';

var CfeDialogRespuesta;
(function (CfeDialogRespuesta) {
    CfeDialogRespuesta["Confirmado"] = "confirmado";
    CfeDialogRespuesta["Cancelado"] = "cancelado";
    CfeDialogRespuesta["Cerrado"] = "cerrado";
})(CfeDialogRespuesta || (CfeDialogRespuesta = {}));

class NgxCfngCoreModalDialogConfigService {
    iconBaseUrl = '';
    constructor() {
    }
    setIconBaseUrl(url) {
        this.iconBaseUrl = url;
    }
    getIconUrl(iconName) {
        return `${this.iconBaseUrl}/${iconName}`;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogConfigService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogConfigService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogConfigService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

class NgxCfngCoreModalDialogComponent {
    modalDialogConfigService;
    ref;
    config;
    sanitizer;
    containerClass;
    icono;
    titulo;
    descripcion;
    textoBotonConfirmar;
    textoBotonCancelar;
    tieneBotonCancelar;
    ocultarBotones;
    ocultarCierre;
    constructor(modalDialogConfigService, ref, config, sanitizer) {
        this.modalDialogConfigService = modalDialogConfigService;
        this.ref = ref;
        this.config = config;
        this.sanitizer = sanitizer;
        this.containerClass = this.config.data.containerClass;
        this.icono = this.config.data.tipoIcono;
        this.titulo = this.config.data.titulo || '';
        this.descripcion = this.config.data.descripcion || '';
        this.textoBotonConfirmar = this.config.data.textoBotonConfirmar || 'Confirmar';
        this.tieneBotonCancelar = this.config.data.tieneBotonCancelar || false;
        this.textoBotonCancelar = this.config.data.textoBotonCancelar || 'Cancelar';
        this.ocultarBotones = this.config.data.ocultarBotones || false;
        this.ocultarCierre = this.config.data.ocultarCierre || false;
    }
    ngOnInit() {
    }
    get iconoCerrar() {
        return this.modalDialogConfigService.getIconUrl('close.svg');
    }
    get iconoDialog() {
        return this.modalDialogConfigService.getIconUrl(`${this.icono}.svg`);
    }
    get mostrarDescripcion() {
        return this.descripcion !== '';
    }
    obtenerDescripcion() {
        return this.sanitizer.bypassSecurityTrustHtml(this.descripcion);
    }
    confirmar() {
        this.ref.close(CfeDialogRespuesta.Confirmado);
    }
    cancelar() {
        this.ref.close(CfeDialogRespuesta.Cancelado);
    }
    cerrar() {
        this.ref.close(CfeDialogRespuesta.Cerrado);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogComponent, deps: [{ token: NgxCfngCoreModalDialogConfigService }, { token: i2.DynamicDialogRef }, { token: i2.DynamicDialogConfig }, { token: i3.DomSanitizer }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0", type: NgxCfngCoreModalDialogComponent, isStandalone: true, selector: "ngx-cfng-core-modal-dialog", ngImport: i0, template: "<div class=\"p-2\" [ngClass]=\"containerClass\">\r\n  @if (!ocultarCierre) {\r\n    <div (click)=\"cerrar()\" class=\"absolute cursor-pointer cfe-dialog-cerrar\">\r\n      <img [src]=\"iconoCerrar\" alt=\"Cerrar\"/>\r\n    </div>\r\n  }\r\n\r\n  @if (icono) {\r\n    <div class=\"flex justify-content-center mb-4 cfe-dialog-icono\">\r\n      <img [src]=\"iconoDialog\" alt=\"Icono\">\r\n    </div>\r\n  }\r\n\r\n  <div class=\"text-center m-0 mb-4 font-semibold cfe-dialog-titulo\">\r\n    {{ titulo }}\r\n  </div>\r\n\r\n  @if (mostrarDescripcion) {\r\n    <p [innerHTML]=\"obtenerDescripcion()\" class=\"text-center text-lg mt-3 cfe-dialog-descripcion\">\r\n    </p>\r\n  }\r\n\r\n  @if (!ocultarBotones) {\r\n    <div class=\"flex justify-content-center mt-4\">\r\n      @if (tieneBotonCancelar) {\r\n        <button class=\"cfe-boton-secondary cfe-boton-lg mr-3\" (click)=\"cancelar()\">\r\n          {{ textoBotonCancelar }}\r\n        </button>\r\n      }\r\n\r\n      <button class=\"cfe-boton-primary cfe-boton-lg\" (click)=\"confirmar()\">\r\n        {{ textoBotonConfirmar }}\r\n      </button>\r\n    </div>\r\n  }\r\n\r\n</div>\r\n", styles: [".cfe-dialog-cerrar{right:20px;top:20px}.cfe-dialog-cerrar img{width:18px}.cfe-dialog-icono img{width:65px}.cfe-dialog-titulo{font-family:var(--mpfn-font-semi-bold),sans-serif;font-size:1.5em}.cfe-dialog-descripcion{font-family:var(--mpfn-font-regular),sans-serif;font-size:1.05em}\n"], dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-cfng-core-modal-dialog', standalone: true, imports: [
                        NgClass
                    ], template: "<div class=\"p-2\" [ngClass]=\"containerClass\">\r\n  @if (!ocultarCierre) {\r\n    <div (click)=\"cerrar()\" class=\"absolute cursor-pointer cfe-dialog-cerrar\">\r\n      <img [src]=\"iconoCerrar\" alt=\"Cerrar\"/>\r\n    </div>\r\n  }\r\n\r\n  @if (icono) {\r\n    <div class=\"flex justify-content-center mb-4 cfe-dialog-icono\">\r\n      <img [src]=\"iconoDialog\" alt=\"Icono\">\r\n    </div>\r\n  }\r\n\r\n  <div class=\"text-center m-0 mb-4 font-semibold cfe-dialog-titulo\">\r\n    {{ titulo }}\r\n  </div>\r\n\r\n  @if (mostrarDescripcion) {\r\n    <p [innerHTML]=\"obtenerDescripcion()\" class=\"text-center text-lg mt-3 cfe-dialog-descripcion\">\r\n    </p>\r\n  }\r\n\r\n  @if (!ocultarBotones) {\r\n    <div class=\"flex justify-content-center mt-4\">\r\n      @if (tieneBotonCancelar) {\r\n        <button class=\"cfe-boton-secondary cfe-boton-lg mr-3\" (click)=\"cancelar()\">\r\n          {{ textoBotonCancelar }}\r\n        </button>\r\n      }\r\n\r\n      <button class=\"cfe-boton-primary cfe-boton-lg\" (click)=\"confirmar()\">\r\n        {{ textoBotonConfirmar }}\r\n      </button>\r\n    </div>\r\n  }\r\n\r\n</div>\r\n", styles: [".cfe-dialog-cerrar{right:20px;top:20px}.cfe-dialog-cerrar img{width:18px}.cfe-dialog-icono img{width:65px}.cfe-dialog-titulo{font-family:var(--mpfn-font-semi-bold),sans-serif;font-size:1.5em}.cfe-dialog-descripcion{font-family:var(--mpfn-font-regular),sans-serif;font-size:1.05em}\n"] }]
        }], ctorParameters: () => [{ type: NgxCfngCoreModalDialogConfigService }, { type: i2.DynamicDialogRef }, { type: i2.DynamicDialogConfig }, { type: i3.DomSanitizer }] });

class NgxCfngCoreModalDialogService {
    dialogService;
    dialogRef = null; // Guarda la referencia del diálogo actual
    constructor(dialogService) {
        this.dialogService = dialogService;
    }
    success(titulo, descripcion, textoBotonConfirmar) {
        const config = {
            tipoIcono: 'success',
            titulo: titulo,
            descripcion: descripcion,
            textoBotonConfirmar: textoBotonConfirmar,
        };
        return this.general(config);
    }
    info(titulo, descripcion, textoBotonConfirmar) {
        const config = {
            tipoIcono: 'info',
            titulo: titulo,
            descripcion: descripcion,
            textoBotonConfirmar: textoBotonConfirmar,
        };
        return this.general(config);
    }
    error(titulo, descripcion, textoBotonConfirmar) {
        const config = {
            tipoIcono: 'error',
            titulo: titulo,
            descripcion: descripcion,
            textoBotonConfirmar: textoBotonConfirmar,
        };
        return this.general(config);
    }
    warning(titulo, descripcion, textoBotonConfirmar, tieneBotonCancelar, textoBotonCancelar) {
        const config = {
            tipoIcono: 'warning',
            titulo: titulo,
            descripcion: descripcion,
            textoBotonConfirmar: textoBotonConfirmar,
            tieneBotonCancelar: tieneBotonCancelar,
            textoBotonCancelar: textoBotonCancelar,
        };
        return this.general(config);
    }
    warningRed(titulo, descripcion, textoBotonConfirmar, tieneBotonCancelar, textoBotonCancelar) {
        const config = {
            tipoIcono: 'warningred',
            titulo: titulo,
            descripcion: descripcion,
            textoBotonConfirmar: textoBotonConfirmar,
            tieneBotonCancelar: tieneBotonCancelar,
            textoBotonCancelar: textoBotonCancelar,
        };
        return this.general(config);
    }
    question(titulo, descripcion, textoBotonConfirmar, textoBotonCancelar) {
        const config = {
            tipoIcono: 'quest',
            titulo: titulo,
            descripcion: descripcion,
            textoBotonConfirmar: textoBotonConfirmar,
            tieneBotonCancelar: true,
            textoBotonCancelar: textoBotonCancelar,
        };
        return this.general(config);
    }
    general(config) {
        this.dialogRef = this.dialogService.open(NgxCfngCoreModalDialogComponent, {
            width: config.tamanioDialog ? config.tamanioDialog : '600px',
            showHeader: false,
            data: {
                tipoIcono: config.tipoIcono,
                titulo: config.titulo,
                descripcion: config.descripcion,
                tieneBotonCancelar: config.tieneBotonCancelar,
                textoBotonConfirmar: config.textoBotonConfirmar,
                textoBotonCancelar: config.textoBotonCancelar,
            }
        });
        // Retorna el observable para que el componente pueda subscribirse
        return new Observable(observer => {
            this.dialogRef.onClose.subscribe({
                next: (resp) => {
                    //
                    this.dialogRef.destroy();
                    this.dialogRef = null;
                    //
                    observer.next(resp);
                    observer.complete();
                },
                error: (err) => observer.error(err)
            });
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogService, deps: [{ token: i2.DialogService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i2.DialogService }] });

class NgxCfngCoreModalDialogModule {
    static forRoot() {
        return {
            ngModule: NgxCfngCoreModalDialogModule,
            providers: [DialogService, NgxCfngCoreModalDialogService]
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogModule, providers: [DialogService, NgxCfngCoreModalDialogService] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [DialogService, NgxCfngCoreModalDialogService]
                }]
        }] });

/*
 * Public API Surface of ngx-cfng-core-modal-dialog
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CfeDialogRespuesta, NgxCfngCoreModalDialogComponent, NgxCfngCoreModalDialogConfigService, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService };
//# sourceMappingURL=ngx-cfng-core-modal-dialog.mjs.map
