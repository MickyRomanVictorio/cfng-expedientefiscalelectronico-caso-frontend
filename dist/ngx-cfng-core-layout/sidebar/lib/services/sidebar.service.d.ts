import { Router } from '@angular/router';
import { MenuNavegacion } from '../models/configuracion.model';
import * as i0 from "@angular/core";
export declare class SidebarService {
    private readonly router;
    urlActual: string;
    private readonly actualizarSidebarSubject;
    actualizarSidebar$: import("rxjs").Observable<boolean>;
    constructor(router: Router);
    setActualizarSidebar(valor: boolean): void;
    getUrlActual(prefijoURL: string): string;
    private transformarUrl;
    getMenuIndexActual(menu: MenuNavegacion[], prefijoURL: string): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<SidebarService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SidebarService>;
}
