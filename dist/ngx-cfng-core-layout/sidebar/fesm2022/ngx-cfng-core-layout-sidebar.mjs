import * as i0 from '@angular/core';
import { Injectable, EventEmitter, inject, Component, Input, Output, HostListener } from '@angular/core';
import * as i1 from '@angular/router';
import { NavigationEnd, RouterLink } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import { NgClass, NgStyle } from '@angular/common';

class SidebarService {
    router;
    urlActual = '';
    actualizarSidebarSubject = new BehaviorSubject(false);
    actualizarSidebar$ = this.actualizarSidebarSubject.asObservable();
    constructor(router) {
        this.router = router;
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event) => {
            this.urlActual = event.urlAfterRedirects;
        });
    }
    setActualizarSidebar(valor) {
        this.actualizarSidebarSubject.next(valor);
    }
    getUrlActual(prefijoURL) {
        return this.urlActual.replace(prefijoURL, '').split('?')[0];
    }
    transformarUrl(url) {
        const rutasTransformar = [
            'bandeja-tramites/nuevos',
            'bandeja-tramites/enviados-para-revisar',
            'bandeja-tramites/enviados-para-visar',
            'bandeja-tramites/pendientes-para-revisar',
            'bandeja-tramites/firmados'
        ];
        return rutasTransformar.includes(url) ? 'bandeja-tramites/bandeja-de-tramites' : url;
    }
    getMenuIndexActual(menu, prefijoURL) {
        const url = this.transformarUrl(this.getUrlActual(prefijoURL));
        let bestMatchIndex = -1;
        let bestMatchLength = 0;
        menu.forEach((item, index) => {
            if (item.url) {
                const isExactMatch = url === item.url;
                const isPrefixMatch = url.startsWith(item.url + '/');
                if (isExactMatch || isPrefixMatch) {
                    if (item.url.length > bestMatchLength) {
                        bestMatchLength = item.url.length;
                        bestMatchIndex = index;
                    }
                }
            }
        });
        return bestMatchIndex;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: SidebarService, deps: [{ token: i1.Router }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: SidebarService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: SidebarService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: () => [{ type: i1.Router }] });

class NgxCfngCoreLayoutSidebarComponent {
    baseAssetsUrl = '';
    menuNavegacion = {};
    toggleSidebar = new EventEmitter();
    prefijoURL = '/app/'; //'/layout/layout/efe/'
    //Para indicar que el sidebar necesita ocupar un ancho fijo
    anchoFijoSidebar = new EventEmitter();
    menuNavegacionSeleccionado = new EventEmitter();
    mostrarSidebar = true;
    opcionSeleccionadoCodigo = '';
    opcionSeleccionadoCodigoAnterior = '';
    opcionSeleccionadoCodigoSiguiente = '';
    tamanioVentanaMediano = 768; //Tamaño mediano
    sidebarService = inject(SidebarService);
    router = inject(i1.Router);
    ngOnInit() {
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
            this.verificarOpcionSeleccionada();
        });
        setTimeout(() => {
            this.verificarTamanioVentana();
            this.verificarAnchoFijoSidebar();
            this.verificarOpcionSeleccionada();
        }, 0);
    }
    onCambiarTamanioVentana(event) {
        //
        this.verificarTamanioVentana();
        //
        this.verificarAnchoFijoSidebar();
        //
    }
    reiniciarValores(menuNavegacion) {
        this.opcionSeleccionadoCodigo = '';
        this.opcionSeleccionadoCodigoAnterior = '';
        this.opcionSeleccionadoCodigoSiguiente = '';
        //
        this.menuNavegacion = menuNavegacion;
        //
        this.verificarOpcionSeleccionada();
    }
    verificarTamanioVentana() {
        if (window.innerWidth < this.tamanioVentanaMediano) {
            this.mostrarSidebar = false;
        }
        else {
            this.mostrarSidebar = true;
        }
        this.toggleSidebar.emit(this.mostrarSidebar);
    }
    verificarAnchoFijoSidebar() {
        const isAnchoFijo = window.innerWidth >= this.tamanioVentanaMediano && this.mostrarSidebar;
        this.anchoFijoSidebar.emit(isAnchoFijo);
    }
    verificarOpcionSeleccionada() {
        if (this.menuNavegacion.options === undefined) {
            return;
        }

        let bestMatch = {
            menuIndexNivel1: -1,
            menuIndexNivel2: -1,
            menuNivel: 0,
            matchLength: 0,
        };

        this.menuNavegacion.options.forEach((menu, index1) => {
            if (menu.options && menu.options.length > 0) {
                const subMenuIndex = this.sidebarService.getMenuIndexActual(menu.options, this.prefijoURL);
                if (subMenuIndex > -1) {
                    const subMenuItem = menu.options[subMenuIndex];
                    if (subMenuItem.url.length > bestMatch.matchLength) {
                        bestMatch = {
                            menuIndexNivel1: index1,
                            menuIndexNivel2: subMenuIndex,
                            menuNivel: 2,
                            matchLength: subMenuItem.url.length,
                        };
                    }
                }
            } else {
                const menuIndex = this.sidebarService.getMenuIndexActual([menu], this.prefijoURL);
                if (menuIndex > -1) {
                    if (menu.url.length > bestMatch.matchLength) {
                        bestMatch = {
                            menuIndexNivel1: index1,
                            menuIndexNivel2: -1,
                            menuNivel: 1,
                            matchLength: menu.url.length,
                        };
                    }
                }
            }
        });

        if (bestMatch.menuNivel > 0) {
            const { menuIndexNivel1, menuIndexNivel2, menuNivel } = bestMatch;
            const menu = this.menuNavegacion.options[menuIndexNivel1];
            if (menuNivel === 2 && !menu.extended) {
                menu.extended = true;
            }
            this.opcionSeleccionadoCodigo = this.generarCodigoSeleccionado(menuIndexNivel1, menuIndexNivel2, menuNivel);
            this.opcionSeleccionadoCodigoAnterior = this.generarCodigoSeleccionadoAnterior(menuIndexNivel1, menuIndexNivel2, menuNivel);
            this.opcionSeleccionadoCodigoSiguiente = this.generarCodigoSeleccionadoSiguiente(menuIndexNivel1, menuIndexNivel2, menuNivel);
            this.verificarMenuObjetoSeleccionado(menuIndexNivel1, menuIndexNivel2);
        }
    }
    verificarMenuObjetoSeleccionado(index, subIndex) {
        const menuPrincipal = JSON.parse(JSON.stringify(this.menuNavegacion));
        let menuSeleccionado = menuPrincipal.options[index];
        if (menuSeleccionado === undefined)
            menuSeleccionado = menuPrincipal.options[0];
        if (menuSeleccionado === undefined) {
            this.menuNavegacionSeleccionado.emit(menuPrincipal);
            return;
        }
        if (menuSeleccionado.options && menuSeleccionado.options[subIndex]) {
            const submeniSeleccionado = { ...menuSeleccionado.options[subIndex] };
            menuSeleccionado.options = [];
            menuSeleccionado.options.push(submeniSeleccionado);
        }
        else {
            menuSeleccionado.options = [];
        }
        menuPrincipal.options = [];
        menuPrincipal.options.push(menuSeleccionado);
        this.menuNavegacionSeleccionado.emit(menuPrincipal);
    }
    eventoMostrarOcultarSidebar() {
        this.mostrarSidebar = !this.mostrarSidebar;
        this.toggleSidebar.emit(this.mostrarSidebar);
        //
        this.verificarAnchoFijoSidebar();
    }
    eventoSeleccionarOpcion(e, index, subIndex, nivel, submenu) {
        if (!submenu?.url) {
            e.preventDefault();
        }
        e.stopPropagation();
        // Determina el código seleccionado según el nivel
        this.opcionSeleccionadoCodigo = this.generarCodigoSeleccionado(index, subIndex, nivel);
        this.opcionSeleccionadoCodigoAnterior = this.generarCodigoSeleccionadoAnterior(index, subIndex, nivel);
        this.opcionSeleccionadoCodigoSiguiente = this.generarCodigoSeleccionadoSiguiente(index, subIndex, nivel);
        // Mostrar el submenu
        if (nivel === 1) {
            this._toggleSubmenu(submenu);
        }
        this.verificarMenuObjetoSeleccionado(index, subIndex);
    }
    eventoToggleSubmenu(event, submenu) {
        event.preventDefault();
        event.stopPropagation();
        this._toggleSubmenu(submenu);
    }
    _toggleSubmenu(submenu) {
        if (submenu?.options?.length > 0) {
            submenu.extended = !submenu.extended;
        }
    }
    generarCodigoSeleccionado(index, subIndex, nivel) {
        return nivel === 1 ? `${index}` : `${index}${subIndex}`;
    }
    generarCodigoSeleccionadoAnterior(index, subIndex, nivel) {
        return nivel === 1 ? `${index - 1}` : `${index}${(subIndex ?? 0) - 1}`;
    }
    generarCodigoSeleccionadoSiguiente(index, subIndex, nivel) {
        return nivel === 1 ? `${index + 1}` : `${index}${(subIndex ?? 0) + 1}`;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreLayoutSidebarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0", type: NgxCfngCoreLayoutSidebarComponent, isStandalone: true, selector: "ngx-cfng-core-layout-sidebar", inputs: { baseAssetsUrl: "baseAssetsUrl", menuNavegacion: "menuNavegacion", prefijoURL: "prefijoURL" }, outputs: { toggleSidebar: "toggleSidebar", anchoFijoSidebar: "anchoFijoSidebar", menuNavegacionSeleccionado: "menuNavegacionSeleccionado" }, host: { listeners: { "window:resize": "onCambiarTamanioVentana($event)" } }, ngImport: i0, template: "\r\n@if (menuNavegacion.options && menuNavegacion.options!.length > 0) {\r\n\r\n\r\n<div class=\"sidebar\" [ngClass]=\"{'sidebar--ocultar':!mostrarSidebar}\">\r\n\r\n  <div class=\"sidebar__btn-contenedor\">\r\n    <div class=\"text-right relative sidebar__btn\"\r\n    [ngStyle]=\"{'border-bottom-right-radius': opcionSeleccionadoCodigo === '0' ? '12px' : '0px'}\"\r\n    >\r\n      @if (mostrarSidebar===true) {\r\n        <button class=\"border-none border-round m-3 cursor-pointer sidebar__btn-ocultar\" (click)=\"eventoMostrarOcultarSidebar()\">\r\n          <img [src]=\"baseAssetsUrl+'/icons/menu.svg'\" alt=\"Menu Icono\">\r\n        </button>\r\n      }@else {\r\n        <a class=\"border-none cursor-pointer absolute sidebar__btn-mostrar\" (click)=\"eventoMostrarOcultarSidebar()\">\r\n          <img [src]=\"baseAssetsUrl+'/icons/collapsed.svg'\" alt=\"Menu Icono\">\r\n          <span class=\"absolute block sidebar__btn-mostrar-titulo\">Men\u00FA</span>\r\n        </a>\r\n      }\r\n    </div>\r\n  </div>\r\n\r\n  <div class=\"px-0 pt-0 pb-3\">\r\n    @if (menuNavegacion.options) {\r\n      <ul class=\"opciones\">\r\n        @for (opcion of menuNavegacion.options; let indexPrincipal = $index;track indexPrincipal) {\r\n          <li class=\"opciones__contenedor\"\r\n              [ngClass]=\"{'opciones__vinculo--anterior':opcionSeleccionadoCodigoAnterior===indexPrincipal+'', 'opciones__vinculo--siguiente':opcionSeleccionadoCodigoSiguiente===indexPrincipal+''}\"\r\n          >\r\n            <a [routerLink]=\"opcion.url ? opcion.url : null\" routerLinkActive=\"url_active\"\r\n              class=\"opciones__vinculo\"\r\n              (click)=\"eventoSeleccionarOpcion($event, indexPrincipal, -1, 1, opcion)\"\r\n              [ngClass]=\"{'opciones__vinculo--activo':opcionSeleccionadoCodigo===indexPrincipal+''}\"\r\n              [attr.tabindex]=\"opcion.url ? '0' : '-1'\"\r\n              [attr.aria-disabled]=\"!opcion.url\"\r\n            >\r\n              <span>\r\n                {{opcion.name}}\r\n              </span>\r\n              <!--Contador -->\r\n              @if (opcion.count && opcion.count > 0) {\r\n                <span class=\"absolute flex align-items-center justify-content-center ml-2 border-round opciones__vinculo__numero\">{{ opcion.count }}</span>\r\n              }\r\n              <!--Icono mostrar sub menu-->\r\n              @if (opcion.options && opcion.options.length > 0) {\r\n                <img [src]=\"baseAssetsUrl+'/icons/downrow.svg'\" class=\"absolute opciones__btn-desplegable\"  alt=\"{{ opcion.name }} DropDown\"\r\n                    [ngStyle]=\"{'transform': opcion.extended &&  opcion.extended===true? 'rotate(180deg)' : 'rotate(0)'}\"\r\n                    (click)=\"eventoToggleSubmenu($event, opcion)\"\r\n                >\r\n              }\r\n            </a>\r\n            <!--Ini - Submenu-->\r\n            @if (opcion.options && opcion.options.length>0) {\r\n              <ul class=\"opciones sub-opciones\" [class.sub-opciones--mostrar]=\"opcion.extended===true\">\r\n                @for (child of opcion.options; let subIndex = $index; track subIndex) {\r\n                  <li class=\"opciones__contenedor\"\r\n                    [ngClass]=\"{'opciones__vinculo--anterior':opcionSeleccionadoCodigoAnterior===indexPrincipal+''+subIndex, 'opciones__vinculo--siguiente':opcionSeleccionadoCodigoSiguiente===indexPrincipal+''+subIndex}\"\r\n                  >\r\n                    <a\r\n                      routerLink=\"{{ child.url }}\" routerLinkActive=\"url_active\"\r\n                      (click)=\"eventoSeleccionarOpcion($event, indexPrincipal, subIndex, 2)\"\r\n                      [ngClass]=\"{'opciones__vinculo--activo':opcionSeleccionadoCodigo==indexPrincipal+''+subIndex}\"\r\n                      class=\"opciones__vinculo pl-6\">\r\n                      <span class=\"pl-1\">\r\n                        {{child.name}}\r\n                      </span>\r\n                        <!--Contador -->\r\n                        @if (child.count && child.count > 0) {\r\n                          <span class=\"absolute flex align-items-center justify-content-center ml-2 border-round opciones__vinculo__numero\">{{ child.count }}</span>\r\n                        }\r\n                    </a>\r\n                  </li>\r\n                }\r\n              </ul>\r\n            }\r\n            <!--Fin - Submenu-->\r\n           </li>\r\n        }\r\n      </ul>\r\n\r\n      <div class=\"sidebar__inferior-contenedor\">\r\n        <div class=\"sidebar__inferior-altura\" [ngStyle]=\"{'border-top-right-radius': opcionSeleccionadoCodigo === (menuNavegacion.options.length-1)+'' ? '12px' : '0px'}\">\r\n        </div>\r\n      </div>\r\n\r\n    }\r\n  </div>\r\n\r\n</div>\r\n\r\n}\r\n", styles: [".sidebar{width:var(--sidebar-width);min-height:calc(100vh - var(--header-height));background-color:var(--white);transition:.3s all ease;z-index:2}@media (max-width: 768px){.sidebar{position:absolute;top:var(--header-height);left:0}.sidebar__btn-mostrar{opacity:.5}.sidebar__btn-mostrar:hover{opacity:1}}.sidebar__btn-contenedor{background-color:var(--mpfn-background)}.sidebar__btn{background-color:var(--white);height:4.5rem}.sidebar--ocultar{transform:translate(-100%)}.sidebar__btn-ocultar{background-color:var(--mpfn-background);width:2.8rem;height:2.8rem;outline:none}.sidebar__btn-ocultar:hover{background-color:var(--mpfn-background2)}.sidebar__btn-mostrar{background-color:var(--mpfn-background-opaque);height:4.8rem;border-top-right-radius:.4rem;border-bottom-right-radius:.4rem;top:0;padding:.5rem}.sidebar__btn-mostrar-titulo{transform:rotate(90deg);margin-top:.3rem;font-size:.9rem;width:1.5rem}.sidebar__inferior-contenedor{background-color:var(--mpfn-background)}.sidebar__inferior-altura{width:100%;height:5rem;background-color:var(--white)}.opciones{margin-block-start:0;margin-block-end:0;margin-inline-start:0;margin-inline-end:0;padding-inline-start:0;background-color:var(--mpfn-background)}.opciones__contenedor{list-style:none;background-color:var(--white)}.opciones__vinculo{text-decoration:none;color:#000;font-size:1.1em;position:relative;padding:1rem 2.2rem;display:block;width:100%}.opciones__vinculo:hover{color:var(--primary-color);background-color:#fbfaf6}.opciones__vinculo--activo{position:relative;font-weight:500}.opciones__vinculo--activo span{position:relative;z-index:1}.opciones__vinculo--activo:before{content:\"\";position:absolute;width:calc(100% - 20px);height:100%;top:0;left:20px;background-color:var(--mpfn-background);z-index:0;border-top-left-radius:12px;border-bottom-left-radius:12px;border-right:2px solid var(--mpfn-background);mask-border-width:100px}.opciones__vinculo--anterior{border-bottom-right-radius:12px}.opciones__vinculo--siguiente{border-top-right-radius:12px}.opciones__vinculo__numero{font-family:var(--mpfn-font-semi-bold);color:var(--mpfn-white);background-color:var(--mpfn-secondary);font-size:.7rem;width:1.375rem;height:1.375rem;top:1rem;right:.8rem}.sub-opciones{max-height:0;transition:max-height .4s ease-in-out;overflow:hidden}.sub-opciones--mostrar{max-height:35.25rem;transition:max-height .4s ease-in-out}.opciones__btn-desplegable{top:1.5rem;right:1rem;width:.938rem;transition:transform .3s ease-in-out}\n"], dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: RouterLink, selector: "[routerLink]", inputs: ["target", "queryParams", "fragment", "queryParamsHandling", "state", "info", "relativeTo", "preserveFragment", "skipLocationChange", "replaceUrl", "routerLink"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreLayoutSidebarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-cfng-core-layout-sidebar', standalone: true, imports: [
                        NgClass,
                        NgStyle,
                        RouterLink
                    ], template: "\r\n@if (menuNavegacion.options && menuNavegacion.options!.length > 0) {\r\n\r\n\r\n<div class=\"sidebar\" [ngClass]=\"{'sidebar--ocultar':!mostrarSidebar}\">\r\n\r\n  <div class=\"sidebar__btn-contenedor\">\r\n    <div class=\"text-right relative sidebar__btn\"\r\n    [ngStyle]=\"{'border-bottom-right-radius': opcionSeleccionadoCodigo === '0' ? '12px' : '0px'}\"\r\n    >\r\n      @if (mostrarSidebar===true) {\r\n        <button class=\"border-none border-round m-3 cursor-pointer sidebar__btn-ocultar\" (click)=\"eventoMostrarOcultarSidebar()\">\r\n          <img [src]=\"baseAssetsUrl+'/icons/menu.svg'\" alt=\"Menu Icono\">\r\n        </button>\r\n      }@else {\r\n        <a class=\"border-none cursor-pointer absolute sidebar__btn-mostrar\" (click)=\"eventoMostrarOcultarSidebar()\">\r\n          <img [src]=\"baseAssetsUrl+'/icons/collapsed.svg'\" alt=\"Menu Icono\">\r\n          <span class=\"absolute block sidebar__btn-mostrar-titulo\">Men\u00FA</span>\r\n        </a>\r\n      }\r\n    </div>\r\n  </div>\r\n\r\n  <div class=\"px-0 pt-0 pb-3\">\r\n    @if (menuNavegacion.options) {\r\n      <ul class=\"opciones\">\r\n        @for (opcion of menuNavegacion.options; let indexPrincipal = $index;track indexPrincipal) {\r\n          <li class=\"opciones__contenedor\"\r\n              [ngClass]=\"{'opciones__vinculo--anterior':opcionSeleccionadoCodigoAnterior===indexPrincipal+'', 'opciones__vinculo--siguiente':opcionSeleccionadoCodigoSiguiente===indexPrincipal+''}\"\r\n          >\r\n            <a [routerLink]=\"opcion.url ? opcion.url : null\" routerLinkActive=\"url_active\"\r\n              class=\"opciones__vinculo\"\r\n              (click)=\"eventoSeleccionarOpcion($event, indexPrincipal, -1, 1, opcion)\"\r\n              [ngClass]=\"{'opciones__vinculo--activo':opcionSeleccionadoCodigo===indexPrincipal+''}\"\r\n              [attr.tabindex]=\"opcion.url ? '0' : '-1'\"\r\n              [attr.aria-disabled]=\"!opcion.url\"\r\n            >\r\n              <span>\r\n                {{opcion.name}}\r\n              </span>\r\n              <!--Contador -->\r\n              @if (opcion.count && opcion.count > 0) {\r\n                <span class=\"absolute flex align-items-center justify-content-center ml-2 border-round opciones__vinculo__numero\">{{ opcion.count }}</span>\r\n              }\r\n              <!--Icono mostrar sub menu-->\r\n              @if (opcion.options && opcion.options.length > 0) {\r\n                <img [src]=\"baseAssetsUrl+'/icons/downrow.svg'\" class=\"absolute opciones__btn-desplegable\"  alt=\"{{ opcion.name }} DropDown\"\r\n                    [ngStyle]=\"{'transform': opcion.extended &&  opcion.extended===true? 'rotate(180deg)' : 'rotate(0)'}\"\r\n                >\r\n              }\r\n            </a>\r\n            <!--Ini - Submenu-->\r\n            @if (opcion.options && opcion.options.length>0) {\r\n              <ul class=\"opciones sub-opciones\" [class.sub-opciones--mostrar]=\"opcion.extended===true\">\r\n                @for (child of opcion.options; let subIndex = $index; track subIndex) {\r\n                  <li class=\"opciones__contenedor\"\r\n                    [ngClass]=\"{'opciones__vinculo--anterior':opcionSeleccionadoCodigoAnterior===indexPrincipal+''+subIndex, 'opciones__vinculo--siguiente':opcionSeleccionadoCodigoSiguiente===indexPrincipal+''+subIndex}\"\r\n                  >\r\n                    <a\r\n                      routerLink=\"{{ child.url }}\" routerLinkActive=\"url_active\"\r\n                      (click)=\"eventoSeleccionarOpcion($event, indexPrincipal, subIndex, 2)\"\r\n                      [ngClass]=\"{'opciones__vinculo--activo':opcionSeleccionadoCodigo==indexPrincipal+''+subIndex}\"\r\n                      class=\"opciones__vinculo pl-6\">\r\n                      <span class=\"pl-1\">\r\n                        {{child.name}}\r\n                      </span>\r\n                        <!--Contador -->\r\n                        @if (child.count && child.count > 0) {\r\n                          <span class=\"absolute flex align-items-center justify-content-center ml-2 border-round opciones__vinculo__numero\">{{ child.count }}</span>\r\n                        }\r\n                    </a>\r\n                  </li>\r\n                }\r\n              </ul>\r\n            }\r\n            <!--Fin - Submenu-->\r\n           </li>\r\n        }\r\n      </ul>\r\n\r\n      <div class=\"sidebar__inferior-contenedor\">\r\n        <div class=\"sidebar__inferior-altura\" [ngStyle]=\"{'border-top-right-radius': opcionSeleccionadoCodigo === (menuNavegacion.options.length-1)+'' ? '12px' : '0px'}\">\r\n        </div>\r\n      </div>\r\n\r\n    }\r\n  </div>\r\n\r\n</div>\r\n\r\n}\r\n", styles: [".sidebar{width:var(--sidebar-width);min-height:calc(100vh - var(--header-height));background-color:var(--white);transition:.3s all ease;z-index:2}@media (max-width: 768px){.sidebar{position:absolute;top:var(--header-height);left:0}.sidebar__btn-mostrar{opacity:.5}.sidebar__btn-mostrar:hover{opacity:1}}.sidebar__btn-contenedor{background-color:var(--mpfn-background)}.sidebar__btn{background-color:var(--white);height:4.5rem}.sidebar--ocultar{transform:translate(-100%)}.sidebar__btn-ocultar{background-color:var(--mpfn-background);width:2.8rem;height:2.8rem;outline:none}.sidebar__btn-ocultar:hover{background-color:var(--mpfn-background2)}.sidebar__btn-mostrar{background-color:var(--mpfn-background-opaque);height:4.8rem;border-top-right-radius:.4rem;border-bottom-right-radius:.4rem;top:0;padding:.5rem}.sidebar__btn-mostrar-titulo{transform:rotate(90deg);margin-top:.3rem;font-size:.9rem;width:1.5rem}.sidebar__inferior-contenedor{background-color:var(--mpfn-background)}.sidebar__inferior-altura{width:100%;height:5rem;background-color:var(--white)}.opciones{margin-block-start:0;margin-block-end:0;margin-inline-start:0;margin-inline-end:0;padding-inline-start:0;background-color:var(--mpfn-background)}.opciones__contenedor{list-style:none;background-color:var(--white)}.opciones__vinculo{text-decoration:none;color:#000;font-size:1.1em;position:relative;padding:1rem 2.2rem;display:block;width:100%}.opciones__vinculo:hover{color:var(--primary-color);background-color:#fbfaf6}.opciones__vinculo--activo{position:relative;font-weight:500}.opciones__vinculo--activo span{position:relative;z-index:1}.opciones__vinculo--activo:before{content:\"\";position:absolute;width:calc(100% - 20px);height:100%;top:0;left:20px;background-color:var(--mpfn-background);z-index:0;border-top-left-radius:12px;border-bottom-left-radius:12px;border-right:2px solid var(--mpfn-background);mask-border-width:100px}.opciones__vinculo--anterior{border-bottom-right-radius:12px}.opciones__vinculo--siguiente{border-top-right-radius:12px}.opciones__vinculo__numero{font-family:var(--mpfn-font-semi-bold);color:var(--mpfn-white);background-color:var(--mpfn-secondary);font-size:.7rem;width:1.375rem;height:1.375rem;top:1rem;right:.8rem}.sub-opciones{max-height:0;transition:max-height .4s ease-in-out;overflow:hidden}.sub-opciones--mostrar{max-height:35.25rem;transition:max-height .4s ease-in-out}.opciones__btn-desplegable{top:1.5rem;right:1rem;width:.938rem;transition:transform .3s ease-in-out}\n"] }]
        }], propDecorators: { baseAssetsUrl: [{
                type: Input,
                args: [{ required: true }]
            }], menuNavegacion: [{
                type: Input
            }], toggleSidebar: [{
                type: Output
            }], prefijoURL: [{
                type: Input
            }], anchoFijoSidebar: [{
                type: Output
            }], menuNavegacionSeleccionado: [{
                type: Output
            }], onCambiarTamanioVentana: [{
                type: HostListener,
                args: ['window:resize', ['$event']]
            }] } });

/* ####### Ini - Menú de Opciones ########## */

/*
 * Public API Surface of sidebar
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NgxCfngCoreLayoutSidebarComponent, SidebarService };
//# sourceMappingURL=ngx-cfng-core-layout-sidebar.mjs.map
