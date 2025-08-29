import { OnDestroy, OnInit } from '@angular/core';
import { FirmaDigitalClienteService } from '../services/firma-digital-cliente.service';
import * as i0 from "@angular/core";
export declare class FirmaDigitalClienteComponent implements OnInit, OnDestroy {
    private firmaDigitalClienteService;
    private suscriptions;
    constructor(firmaDigitalClienteService: FirmaDigitalClienteService);
    ngOnInit(): void;
    private verificarDataFirma;
    private enviarDataFirma;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FirmaDigitalClienteComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FirmaDigitalClienteComponent, "cfe-lib-firma-digital-cliente", never, {}, {}, never, never, true, never>;
}
