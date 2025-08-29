import * as i0 from '@angular/core';
import { EventEmitter, Injectable, Output, Component } from '@angular/core';
import { fromEvent } from 'rxjs';

class FirmaDigitalClienteService {
    processSignClient = new EventEmitter();
    sendDataSign = new EventEmitter();
    constructor() { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: FirmaDigitalClienteService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: FirmaDigitalClienteService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: FirmaDigitalClienteService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [], propDecorators: { processSignClient: [{
                type: Output
            }], sendDataSign: [{
                type: Output
            }] } });

const enviroment = {
    production: true,
    cdn: {
        jquey: 'https://code.jquery.com/jquery-3.6.0.min.js',
        firma_peru: 'https://apps.firmaperu.gob.pe/web/clienteweb/firmaperu.min.js',
        integrador: 'http://172.16.111.112:8085/assets/js/integrador.firma.js'
    },
    portClientSign: '48596'
};

function sendParamOne(data) {
    const base64 = btoa(JSON.stringify(data));
    const port = `${enviroment.portClientSign}`;
    startSignature(port, base64);
}

class NgxCfngCoreFirmaDigitalService {
    scripts = {};
    load(scriptName, src) {
        return new Promise((resolve, reject) => {
            if (this.scripts[scriptName]) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
                this.scripts[scriptName] = true;
                resolve();
            };
            script.onerror = (error) => reject(error);
            document.head.appendChild(script);
        });
    }
    loadScriptsSequentially(scripts) {
        return scripts.reduce(async (promiseChain, script) => {
            return promiseChain.then(() => this.load(script.name, script.src));
        }, Promise.resolve());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: NgxCfngCoreFirmaDigitalService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: NgxCfngCoreFirmaDigitalService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: NgxCfngCoreFirmaDigitalService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }] });

class NgxCfngCoreFirmaDigitalComponent {
    ngxCoreFirmaDigitalService;
    constructor(ngxCoreFirmaDigitalService) {
        this.ngxCoreFirmaDigitalService = ngxCoreFirmaDigitalService;
    }
    ngAfterViewInit() {
        this.ngxCoreFirmaDigitalService
            .loadScriptsSequentially([
            { name: 'jquery', src: enviroment.cdn.jquey },
            { name: 'integrador', src: enviroment.cdn.integrador },
            { name: 'firmaperu', src: enviroment.cdn.firma_peru },
        ])
            .then(() => {
            console.log('CFE Core Firma Digital iniciado');
        })
            .catch((error) => {
            console.error('Error CFE Integrador Firma Digital: ', error.error);
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: NgxCfngCoreFirmaDigitalComponent, deps: [{ token: NgxCfngCoreFirmaDigitalService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.4", type: NgxCfngCoreFirmaDigitalComponent, isStandalone: true, selector: "cfe-core-firma-digital", ngImport: i0, template: ``, isInline: true, styles: [""] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: NgxCfngCoreFirmaDigitalComponent, decorators: [{
            type: Component,
            args: [{ selector: 'cfe-core-firma-digital', standalone: true, imports: [], template: `` }]
        }], ctorParameters: () => [{ type: NgxCfngCoreFirmaDigitalService }] });

class FirmaDigitalClienteComponent {
    firmaDigitalClienteService;
    suscriptions = [];
    constructor(firmaDigitalClienteService) {
        this.firmaDigitalClienteService = firmaDigitalClienteService;
    }
    ngOnInit() {
        this.suscriptions.push(this.firmaDigitalClienteService.sendDataSign.subscribe((data) => {
            this.verificarDataFirma(data);
        }));
        fromEvent(window, 'signOK').subscribe(() => {
            this.firmaDigitalClienteService.processSignClient.emit('0');
        });
        fromEvent(window, 'signBAD').subscribe(() => {
            this.firmaDigitalClienteService.processSignClient.emit('1');
        });
    }
    verificarDataFirma(dataFirma) {
        if (dataFirma.id === null ||
            dataFirma.id === undefined ||
            dataFirma.id === '') {
            alert('Es requerido un identificador de documento para continuar con el proceso');
            return;
        }
        this.enviarDataFirma(dataFirma);
    }
    enviarDataFirma(dataFirma) {
        let param_pdf = {
            param_url: dataFirma.param_url,
            param_token: JSON.stringify(dataFirma),
            document_extension: dataFirma.extension,
        };
        sendParamOne(param_pdf);
    }
    ngOnDestroy() {
        this.suscriptions.forEach((suscripcion) => suscripcion.unsubscribe());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: FirmaDigitalClienteComponent, deps: [{ token: FirmaDigitalClienteService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.4", type: FirmaDigitalClienteComponent, isStandalone: true, selector: "cfe-lib-firma-digital-cliente", ngImport: i0, template: `
    <div id="addComponent"></div>
    <cfe-core-firma-digital></cfe-core-firma-digital>
    `, isInline: true, styles: [""], dependencies: [{ kind: "component", type: NgxCfngCoreFirmaDigitalComponent, selector: "cfe-core-firma-digital" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: FirmaDigitalClienteComponent, decorators: [{
            type: Component,
            args: [{ selector: 'cfe-lib-firma-digital-cliente', standalone: true, imports: [NgxCfngCoreFirmaDigitalComponent], template: `
    <div id="addComponent"></div>
    <cfe-core-firma-digital></cfe-core-firma-digital>
    ` }]
        }], ctorParameters: () => [{ type: FirmaDigitalClienteService }] });

/*
 * Public API Surface of ngx-cfng-core-firma-digital
 */

/**
 * Generated bundle index. Do not edit.
 */

export { FirmaDigitalClienteComponent, FirmaDigitalClienteService };
//# sourceMappingURL=ngx-cfng-core-firma-digital.mjs.map
