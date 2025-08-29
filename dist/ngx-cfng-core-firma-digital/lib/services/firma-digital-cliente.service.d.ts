import { EventEmitter } from '@angular/core';
import { FirmaInterface } from '../models/firma-digital.interface';
import * as i0 from "@angular/core";
export declare class FirmaDigitalClienteService {
    processSignClient: EventEmitter<string>;
    sendDataSign: EventEmitter<FirmaInterface>;
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<FirmaDigitalClienteService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FirmaDigitalClienteService>;
}
