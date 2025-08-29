import * as i0 from '@angular/core';
import { Injectable, Component } from '@angular/core';

class SidebarService {
    constructor() { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: SidebarService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: SidebarService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: SidebarService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

class SidebarComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: SidebarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.0", type: SidebarComponent, isStandalone: true, selector: "lib-sidebar", ngImport: i0, template: `
    <p>
      sidebar works!
    </p>
  `, isInline: true, styles: [""] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: SidebarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-sidebar', standalone: true, imports: [], template: `
    <p>
      sidebar works!
    </p>
  ` }]
        }] });

/*
 * Public API Surface of sidebar
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SidebarComponent, SidebarService };
//# sourceMappingURL=layout-sidebar.mjs.map
