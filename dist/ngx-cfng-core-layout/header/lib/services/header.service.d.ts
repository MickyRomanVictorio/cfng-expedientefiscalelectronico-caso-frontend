import { Router } from '@angular/router';
import { MenuNavegacion } from '../models/configuracion.model';
import * as i0 from "@angular/core";
export declare class HeaderService {
    private readonly router;
    urlActual: string;
    private readonly actualizarHeaderSubject;
    actualizarHeader$: import("rxjs").Observable<boolean>;
    constructor(router: Router);
    setActualizarHeader(valor: boolean): void;
    getUrlActual(prefijoURL: string): string;
    getMenuActual(menu: MenuNavegacion[], prefijoURL: string): MenuNavegacion | undefined;
    static ɵfac: i0.ɵɵFactoryDeclaration<HeaderService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HeaderService>;
}
