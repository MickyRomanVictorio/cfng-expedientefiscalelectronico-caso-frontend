import * as i0 from '@angular/core';
import { Injectable, EventEmitter, inject, Component, Input, Output } from '@angular/core';
import * as i1 from '@angular/router';
import { NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import * as i3 from '@angular/common';
import { Location, NgClass, CommonModule, TitleCasePipe } from '@angular/common';
import * as i1$1 from 'primeng/menu';
import { MenuModule } from 'primeng/menu';

class HeaderService {
    router;
    urlActual = '';
    actualizarHeaderSubject = new BehaviorSubject(false);
    actualizarHeader$ = this.actualizarHeaderSubject.asObservable();
    constructor(router) {
        this.router = router;
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
            this.urlActual = event.urlAfterRedirects;
        });
    }
    setActualizarHeader(valor) {
        this.actualizarHeaderSubject.next(valor);
    }
    getUrlActual(prefijoURL) {
        return this.urlActual.replace(prefijoURL, '').split('?')[0];
    }
    getMenuActual(menu, prefijoURL) {
        const url = this.getUrlActual(prefijoURL);
        return menu.find((item) => url === item.url || url.startsWith(item.url + '/'));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: HeaderService, deps: [{ token: i1.Router }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: HeaderService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: HeaderService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: () => [{ type: i1.Router }] });

var TipoMenuNavegacion;
(function (TipoMenuNavegacion) {
    TipoMenuNavegacion[TipoMenuNavegacion["Sidebar"] = 1] = "Sidebar";
    TipoMenuNavegacion[TipoMenuNavegacion["Dropdown"] = 2] = "Dropdown";
})(TipoMenuNavegacion || (TipoMenuNavegacion = {}));

class NgxCfngCoreLayoutHeaderComponent {
    baseAssetsUrl = '';
    aplicaciones = [];
    alertas = [];
    usuario = {};
    titulos = {};
    menuNavegacion = [];
    tipoMenu = TipoMenuNavegacion.Sidebar;
    menuNavegacionBotones = [];
    prefijoURL = '/app/'; //'/layout/layout/efe/' /app/
    menuNavegacionSeleccionado = new EventEmitter();
    mostrarMasOpciones = false;
    mostrarMenuNavegacionMovil = false;
    version = '0.0.1';
    //private sessionMenuId = 'mpeMnPr';//Usado para almacenar el menu seleccionado
    menuNavegacionSeleccionadoId = null;
    TipoMenuNavegacion = TipoMenuNavegacion;
    location = inject(Location);
    headerService = inject(HeaderService);
    menuDropdownActivo = null;
    subscription;
    ngOnInit() {
        this.cargarMenuInicial();
        this.subscription = this.headerService.actualizarHeader$.subscribe(() => {
            this.cargarMenuInicial();
        });
    }
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    cargarMenuInicial() {
        const menu = this.headerService.getMenuActual(this.menuNavegacion, this.prefijoURL);
        if (menu) {
            this.sidebarMenuNavegacionSeleccionar(menu);
        }
    }
    eventoMenuNavegacionMovilMostrar() {
        this.mostrarMenuNavegacionMovil = !this.mostrarMenuNavegacionMovil;
    }
    eventoMenuNavegacionSeleccionar(e, menu) {
        if (this.tipoMenu === TipoMenuNavegacion.Sidebar) {
            this.sidebarMenuNavegacionSeleccionar(menu);
        }
        else {
            this.dropdownMenuNavegacionSeleccionar(menu);
        }
    }
    eventoSubmenuNavegacion(e, menu) {
        e.stopPropagation();
        menu.extended = false;
    }
    sidebarMenuNavegacionSeleccionar(menu) {
        this.menuNavegacionSeleccionadoId = menu.code;
        this.menuNavegacionSeleccionado.emit(menu);
        this.mostrarMenuNavegacionMovil = false;
    }
    dropdownMenuNavegacionSeleccionar(menu) {
        if (this.menuDropdownActivo !== null && menu.code !== this.menuDropdownActivo.code) {
            this.menuDropdownActivo.extended = false;
        }
        this.menuNavegacionSeleccionadoId = menu.code;
        this.menuDropdownActivo = menu;
        menu.extended = !menu.extended;
    }
    eventoSubmenuDropdown(e, menu) {
        if (menu.click) {
            menu.click(e);
        }
        menu.extended = !menu.extended;
    }
    mostrarAlerta(alerta) {
        this.ocultarTodasLasAlertas();
        alerta.mostrar = true;
    }
    ocultarTodasLasAlertas() {
        this.alertas?.forEach((alerta) => {
            alerta.mostrar = false;
        });
    }
    ocultarAlerta = (alerta) => () => {
        alerta.mostrar = false;
    };
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreLayoutHeaderComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.0", type: NgxCfngCoreLayoutHeaderComponent, isStandalone: true, selector: "ngx-cfng-core-layout-header", inputs: { baseAssetsUrl: "baseAssetsUrl", aplicaciones: "aplicaciones", alertas: "alertas", usuario: "usuario", titulos: "titulos", menuNavegacion: "menuNavegacion", tipoMenu: "tipoMenu", menuNavegacionBotones: "menuNavegacionBotones", prefijoURL: "prefijoURL" }, outputs: { menuNavegacionSeleccionado: "menuNavegacionSeleccionado" }, ngImport: i0, template: "<div class=\"p-1 linea-superior\">\r\n  <div class=\"flex align-items-center justify-content-between\">\r\n    <div class=\"flex align-items-center\">\r\n      <button class=\"cursor-pointer border-round ml-1 md:ml-3 btn-mas-opciones\"\r\n        (click)=\"mostrarMasOpciones = !mostrarMasOpciones\">\r\n        <img [src]=\"baseAssetsUrl + '/icons/points.svg'\" alt=\"More Options\" class=\"w-full h-full\" />\r\n      </button>\r\n      <div class=\"hidden md:block text-primary pl-2\"> {{ titulos.superior ?? \"\" }} </div>\r\n    </div>\r\n    <div class=\"hidden lg:block pr-2\"> {{ titulos.fiscalia ?? \"\" }} </div>\r\n  </div>\r\n</div>\r\n\r\n<div class=\"flex align-items-center py-1\">\r\n  <!--Ini-Logo-->\r\n  <div class=\"w-full\">\r\n    <div class=\"flex\">\r\n      <div class=\"md:pl-2 logo\">\r\n        <img [src]=\"baseAssetsUrl + '/images/mpfnBlack_2.webp'\" class=\"w-12rem sm:w-15rem\" alt=\"\" />\r\n      </div>\r\n      <div class=\"flex align-items-center\">\r\n        <!-- Se oculta el titulo en md -->\r\n        <div class=\"text-2xl font-bold text-primary titulo my-2 py-2 pl-2 hidden md:block ml-3\">\r\n          {{ titulos.principal ? titulos.principal : \"\" }}\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <!--Fin-Logo-->\r\n\r\n  <!--Ini-Usuario-->\r\n  <div class=\"w-full py-1\">\r\n    <div class=\"flex justify-content-end align-items-center\">\r\n      <!--Ini - Iconos de Alertas -->\r\n      <div class=\"flex alerta mr-3 relative\">\r\n        @for (alerta of alertas; track $index) {\r\n        <button class=\"border-none cursor-pointer alerta__btn\" (click)=\"mostrarAlerta(alerta)\">\r\n          <img [src]=\"alerta.icono\" class=\"w-2rem\" alt=\"\" />\r\n          @if(alerta.cantidad){\r\n          <div class=\"alerta__numero\">{{ alerta.cantidad }}</div>\r\n          }\r\n        </button>\r\n        @if (alerta.mostrar && alerta.template) {\r\n        <ng-container *ngTemplateOutlet=\"alerta.template; context: { fn: ocultarAlerta(alerta) }\"></ng-container>\r\n        }\r\n        }\r\n      </div>\r\n      <!--Fin - Iconos de Alertas -->\r\n\r\n      <div class=\"flex align-items-center usuario\">\r\n        <div class=\"usuario__foto border-round-lg\">\r\n          @if (usuario.nombres) {\r\n          <div class=\"font-bold text-primary text-lg text-center mt-2\">\r\n            {{ usuario.nombres.charAt(0) }}\r\n          </div>\r\n          }\r\n        </div>\r\n        <div class=\"px-2 text-primary text-sm hidden md:block\">\r\n          <!--Se oculara en md -->\r\n          <div class=\"font-bold\">\r\n            {{ usuario.nombres ? usuario.nombres : \"\" }}\r\n          </div>\r\n          <div>{{ usuario.perfil ? usuario.perfil : \"\" }}</div>\r\n        </div>\r\n        <div class=\"px-2\">\r\n          @if (usuario.opciones) {\r\n          <img [src]=\"baseAssetsUrl + '/icons/downrow.svg'\" alt=\"Ver opciones de usuario\" class=\"cursor-pointer w-1rem\"\r\n            (click)=\"usuarioMenu.toggle($event)\" />\r\n          <p-menu #usuarioMenu [model]=\"usuario.opciones\" [popup]=\"true\"></p-menu>\r\n          }\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <!--Fin-Usuario-->\r\n</div>\r\n\r\n@if(menuNavegacion.length === 0) {\r\n\r\n<!--Ini-Linea Azul-->\r\n<div class=\"linea-inferior\"></div>\r\n<!--Fin-Linea Azul-->\r\n\r\n}@else{\r\n<!--Ini-Menu Opciones-->\r\n<div class=\"lg:flex lg:align-items-center lg:flex-wrap menu-navegacion\">\r\n\r\n  <div (click)=\"eventoMenuNavegacionMovilMostrar()\"\r\n    class=\"lg:hidden block py-3 pr-3 cursor-pointer text-right menu-navegacion__toggle\">\r\n    <i [ngClass]=\"{ '-rotate-90': mostrarMenuNavegacionMovil }\" class=\"pi pi-bars -rotate-90\"></i>\r\n  </div>\r\n\r\n  <div [class.hidden]=\"!mostrarMenuNavegacionMovil\"\r\n    class=\"menu-navegacion__contenido lg:flex lg:align-items-center lg:pl-3\"\r\n    [ngClass]=\"{ 'menu-navegacion__contenido--ancho-version': tipoMenu === TipoMenuNavegacion.Sidebar, 'w-full': tipoMenu === TipoMenuNavegacion.Dropdown}\">\r\n    @for (tab of menuNavegacion; track $index) {\r\n    <a class=\"flex align-items-center cursor-pointer px-3 py-3 lg:py-3 text-md lg:text-lg relative menu-navegacion__opcion\"\r\n      routerLink=\"{{ tab.url === '' ? location.path() : tab.url }}\" routerLinkActive=\"menu-navegacion__opcion--activo\"\r\n      (click)=\"eventoMenuNavegacionSeleccionar($event, tab)\">\r\n      @if (tab.icon) {\r\n      <img [src]=\"tab.icon\" alt=\"{{ tab.name }} Icon\" class=\"pr-2\" style=\"height: 1.7rem; margin-bottom: 0.2rem\" />\r\n      }\r\n      {{ tab.name }}\r\n      @if (tab.count && tab.count > 0) {\r\n      <span class=\"menu-navegacion__numero flex align-items-center justify-content-center ml-2 border-round\">{{\r\n        tab.count }}</span>\r\n      }\r\n      <!-- Ini - Menu Dropdown -->\r\n      @if (tipoMenu === TipoMenuNavegacion.Dropdown) {\r\n      @if (menuNavegacionSeleccionadoId===tab.code) {\r\n      <i class=\"pi pi-sort-up-fill absolute bottom-0 left-50 hidden lg:block\" style=\"opacity: 0.6\"></i>\r\n      } @if (tab.options && tab.options.length > 0) {\r\n      <i class=\"pl-2 pi\" style=\"margin-left: auto\" [class.pi-chevron-down]=\"!tab.extended\"\r\n        [class.pi-chevron-up]=\"tab.extended\"></i>\r\n      @if (tab.extended===true) {\r\n      <ul class=\"absolute left-0 p-0 m-0 bg-white w-full lg:w-18rem lg:border-round-lg menu-navegacion__submenu\">\r\n        @for (item of tab.options; track $index) {\r\n        <li class=\"p-0 m-0\">\r\n          <a routerLink=\"{{ item.url }}\" (click)=\"eventoSubmenuNavegacion($event, tab)\" class=\"block\">{{ item.name\r\n            }}</a>\r\n        </li>\r\n        }\r\n      </ul>\r\n      }\r\n      }\r\n      }\r\n      <!-- Fin - Menu Dropdown -->\r\n    </a>\r\n    }\r\n\r\n    <!--Ini - Menu Botones -->\r\n    @if (tipoMenu === TipoMenuNavegacion.Dropdown && menuNavegacionBotones.length > 0) {\r\n    <div style=\"margin-left: auto\" class=\"flex\">\r\n      @for (item of menuNavegacionBotones; track $index) {\r\n      <button class=\"relative w-full lg:w-auto justify-content-start mx-2 {{item.styleClass ? item.styleClass : ''}}\"\r\n        (click)=\"eventoSubmenuDropdown($event, item)\" [attr.disabled]=\"item.disabled === true ? true : null\">\r\n        @if(item.icon && item.icon!==''){\r\n        <img [src]=\"item.icon\" alt=\"Icono {{ item.name }}\" class=\"cursor-pointer pr-1\" style=\"height: 1.5rem\" />\r\n        }\r\n        {{ item.name }}\r\n        @if (item.options && item.options.length > 0) {\r\n        <i class=\"pl-2 pi\" style=\"margin-left: auto\" [class.pi-chevron-down]=\"!item.extended\"\r\n          [class.pi-chevron-up]=\"item.extended\"></i>\r\n\r\n        @if (item.extended===true) {\r\n        <ul\r\n          class=\"absolute right-0 p-0 m-0 bg-white w-full lg:w-15rem lg:border-round-lg text-left menu-navegacion__submenu\">\r\n          @for (item of item.options; track $index) {\r\n          <li class=\"p-0 m-0\">\r\n            <a routerLink=\"{{ item.url }}\" (click)=\"item.extended = false\" class=\"block\">{{ item.name }}</a>\r\n          </li>\r\n          }\r\n        </ul>\r\n        }\r\n        }\r\n      </button>\r\n      }\r\n    </div>\r\n    }\r\n    <!--Fin - Menu Botones -->\r\n  </div>\r\n\r\n  @if (tipoMenu === TipoMenuNavegacion.Sidebar) {\r\n  <div class=\"hidden lg:block menu-navegacion__version\">\r\n    Versi\u00F3n {{ version }}\r\n  </div>\r\n  }\r\n</div>\r\n<!--Fin-Menu Opciones-->\r\n}\r\n\r\n<!--Ini - M\u00E1s Opciones Modal -->\r\n@if (mostrarMasOpciones===true) {\r\n<div class=\"absolute bg-white border-round-xl aplicaciones z-5\">\r\n  <img [src]=\"baseAssetsUrl + '/icons/close.svg'\" class=\"absolute cursor-pointer aplicaciones__cerrar\"\r\n    (click)=\"mostrarMasOpciones = false\" alt=\"img\" />\r\n  <div class=\"text-2xl text-primary px-3 py-3\">Carpeta Fiscal Electr\u00F3nico</div>\r\n  <div class=\"grid grid-nogutter aplicaciones__opciones\">\r\n    @for (aplicacion of aplicaciones; track $index) {\r\n    <div class=\"col-12 sm:col-6 aplicaciones__opcion\">\r\n      <a href=\"{{ aplicacion.url }}\" class=\"block w-full aplicaciones__vinculo\">{{ aplicacion.sistema | titlecase }}</a>\r\n    </div>\r\n    }\r\n  </div>\r\n</div>\r\n}\r\n<!--Fin - M\u00E1s Opciones Modal -->", styles: [".linea-superior{background-color:var(--mpfn-background-opaque)}.titulo{border-left:4px solid var(--primary-color)}.linea-inferior{background-color:var(--primary-color);height:.5rem}.btn-mas-opciones{border:1px solid var(--mpfn-gray2);padding:.3rem;width:2rem;height:2rem}.aplicaciones{top:2.2rem;left:0;width:100%;box-shadow:10px 10px 86px -22px var(--mpfn-black);-webkit-box-shadow:10px 10px 86px -22px var(--mpfn-black);-moz-box-shadow:10px 10px 86px -22px var(--mpfn-black);font-family:var(--mpfn-font-regular);overflow:hidden}.aplicaciones__opciones{border-top:1px solid var(--mpfn-gray3)}.aplicaciones__opcion{border-bottom:1px solid var(--mpfn-gray3);border-right:1px solid var(--mpfn-gray3)}.aplicaciones__vinculo{padding:.7rem .9rem}.aplicaciones__vinculo:hover{background-color:var(--mpfn-background)}.aplicaciones__cerrar{right:.7rem;top:.5rem;width:1.2rem}.usuario{padding-right:.5rem}.usuario__foto{background-color:#d8d8d8;width:2.6rem;height:2.6rem}@media (min-width: 768px){.aplicaciones{width:39rem;left:1.6rem}}.menu-navegacion{background-color:var(--primary-color);color:var(--mpfn-white)}.menu-navegacion__toggle i{transition:all .5s ease;color:var(--mpfn-white);font-size:22px}.menu-navegacion__contenido{transition:all .5s}.menu-navegacion__contenido--ancho-version{width:calc(100% - var(--version-width))}.menu-navegacion__opcion{font-family:var(--mpfn-font-light);text-decoration:none;color:var(--mpfn-white)}.menu-navegacion__opcion:hover,.menu-navegacion__opcion--activo{background-color:var(--mpfn-blue-hover)}.menu-navegacion__numero{font-family:var(--mpfn-font-semi-bold);color:var(--mpfn-white);background-color:var(--mpfn-secondary);font-size:.9rem;width:1.375rem;height:1.375rem}.menu-navegacion__version{width:var(--version-width);font-size:1em;font-family:var(--mpfn-font-regular);color:var(--mpfn-gray4)}.alerta__btn{background-color:transparent;position:relative}.alerta__btn:hover{opacity:.8}.alerta__numero{border-radius:50%;background-color:#f19700;color:#fff;width:1.2rem;height:1.3rem;font-size:.7rem;font-weight:700;text-align:center;position:absolute;top:-5px;left:26px;line-height:1.3rem}.menu-navegacion__submenu{top:calc(100% + .3rem);border:1px solid var(--mpfn-gray7);z-index:10;overflow:hidden}.menu-navegacion__submenu li{list-style:none}.menu-navegacion__submenu li a{font-size:1rem;padding:.6rem 1rem;border-bottom:1px solid var(--mpfn-gray7)}.menu-navegacion__submenu li a:hover{background-color:var(--mpfn-gray8)}.menu-navegacion__submenu li:last-child a{border-bottom:none}@media (max-width: 992px){.menu-navegacion__contenido--ancho-version{width:100%}}@media (max-width: 576px){.logo{display:none}}\n"], dependencies: [{ kind: "ngmodule", type: MenuModule }, { kind: "component", type: i1$1.Menu, selector: "p-menu", inputs: ["model", "popup", "style", "styleClass", "appendTo", "autoZIndex", "baseZIndex", "showTransitionOptions", "hideTransitionOptions", "ariaLabel", "ariaLabelledBy", "id", "tabindex"], outputs: ["onShow", "onHide", "onBlur", "onFocus"] }, { kind: "directive", type: i1.RouterLink, selector: "[routerLink]", inputs: ["target", "queryParams", "fragment", "queryParamsHandling", "state", "info", "relativeTo", "preserveFragment", "skipLocationChange", "replaceUrl", "routerLink"] }, { kind: "directive", type: i1.RouterLinkActive, selector: "[routerLinkActive]", inputs: ["routerLinkActiveOptions", "ariaCurrentWhenActive", "routerLinkActive"], outputs: ["isActiveChange"], exportAs: ["routerLinkActive"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i3.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "pipe", type: i3.TitleCasePipe, name: "titlecase" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreLayoutHeaderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-cfng-core-layout-header', standalone: true, imports: [
                        MenuModule,
                        NgClass,
                        RouterLink,
                        RouterLinkActive,
                        CommonModule,
                        TitleCasePipe
                    ], template: "<div class=\"p-1 linea-superior\">\r\n  <div class=\"flex align-items-center justify-content-between\">\r\n    <div class=\"flex align-items-center\">\r\n      <button class=\"cursor-pointer border-round ml-1 md:ml-3 btn-mas-opciones\"\r\n        (click)=\"mostrarMasOpciones = !mostrarMasOpciones\">\r\n        <img [src]=\"baseAssetsUrl + '/icons/points.svg'\" alt=\"More Options\" class=\"w-full h-full\" />\r\n      </button>\r\n      <div class=\"hidden md:block text-primary pl-2\"> {{ titulos.superior ?? \"\" }} </div>\r\n    </div>\r\n    <div class=\"hidden lg:block pr-2\"> {{ titulos.fiscalia ?? \"\" }} </div>\r\n  </div>\r\n</div>\r\n\r\n<div class=\"flex align-items-center py-1\">\r\n  <!--Ini-Logo-->\r\n  <div class=\"w-full\">\r\n    <div class=\"flex\">\r\n      <div class=\"md:pl-2 logo\">\r\n        <img [src]=\"baseAssetsUrl + '/images/mpfnBlack_2.webp'\" class=\"w-12rem sm:w-15rem\" alt=\"\" />\r\n      </div>\r\n      <div class=\"flex align-items-center\">\r\n        <!-- Se oculta el titulo en md -->\r\n        <div class=\"text-2xl font-bold text-primary titulo my-2 py-2 pl-2 hidden md:block ml-3\">\r\n          {{ titulos.principal ? titulos.principal : \"\" }}\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <!--Fin-Logo-->\r\n\r\n  <!--Ini-Usuario-->\r\n  <div class=\"w-full py-1\">\r\n    <div class=\"flex justify-content-end align-items-center\">\r\n      <!--Ini - Iconos de Alertas -->\r\n      <div class=\"flex alerta mr-3 relative\">\r\n        @for (alerta of alertas; track $index) {\r\n        <button class=\"border-none cursor-pointer alerta__btn\" (click)=\"mostrarAlerta(alerta)\">\r\n          <img [src]=\"alerta.icono\" class=\"w-2rem\" alt=\"\" />\r\n          @if(alerta.cantidad){\r\n          <div class=\"alerta__numero\">{{ alerta.cantidad }}</div>\r\n          }\r\n        </button>\r\n        @if (alerta.mostrar && alerta.template) {\r\n        <ng-container *ngTemplateOutlet=\"alerta.template; context: { fn: ocultarAlerta(alerta) }\"></ng-container>\r\n        }\r\n        }\r\n      </div>\r\n      <!--Fin - Iconos de Alertas -->\r\n\r\n      <div class=\"flex align-items-center usuario\">\r\n        <div class=\"usuario__foto border-round-lg\">\r\n          @if (usuario.nombres) {\r\n          <div class=\"font-bold text-primary text-lg text-center mt-2\">\r\n            {{ usuario.nombres.charAt(0) }}\r\n          </div>\r\n          }\r\n        </div>\r\n        <div class=\"px-2 text-primary text-sm hidden md:block\">\r\n          <!--Se oculara en md -->\r\n          <div class=\"font-bold\">\r\n            {{ usuario.nombres ? usuario.nombres : \"\" }}\r\n          </div>\r\n          <div>{{ usuario.perfil ? usuario.perfil : \"\" }}</div>\r\n        </div>\r\n        <div class=\"px-2\">\r\n          @if (usuario.opciones) {\r\n          <img [src]=\"baseAssetsUrl + '/icons/downrow.svg'\" alt=\"Ver opciones de usuario\" class=\"cursor-pointer w-1rem\"\r\n            (click)=\"usuarioMenu.toggle($event)\" />\r\n          <p-menu #usuarioMenu [model]=\"usuario.opciones\" [popup]=\"true\"></p-menu>\r\n          }\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <!--Fin-Usuario-->\r\n</div>\r\n\r\n@if(menuNavegacion.length === 0) {\r\n\r\n<!--Ini-Linea Azul-->\r\n<div class=\"linea-inferior\"></div>\r\n<!--Fin-Linea Azul-->\r\n\r\n}@else{\r\n<!--Ini-Menu Opciones-->\r\n<div class=\"lg:flex lg:align-items-center lg:flex-wrap menu-navegacion\">\r\n\r\n  <div (click)=\"eventoMenuNavegacionMovilMostrar()\"\r\n    class=\"lg:hidden block py-3 pr-3 cursor-pointer text-right menu-navegacion__toggle\">\r\n    <i [ngClass]=\"{ '-rotate-90': mostrarMenuNavegacionMovil }\" class=\"pi pi-bars -rotate-90\"></i>\r\n  </div>\r\n\r\n  <div [class.hidden]=\"!mostrarMenuNavegacionMovil\"\r\n    class=\"menu-navegacion__contenido lg:flex lg:align-items-center lg:pl-3\"\r\n    [ngClass]=\"{ 'menu-navegacion__contenido--ancho-version': tipoMenu === TipoMenuNavegacion.Sidebar, 'w-full': tipoMenu === TipoMenuNavegacion.Dropdown}\">\r\n    @for (tab of menuNavegacion; track $index) {\r\n    <a class=\"flex align-items-center cursor-pointer px-3 py-3 lg:py-3 text-md lg:text-lg relative menu-navegacion__opcion\"\r\n      routerLink=\"{{ tab.url === '' ? location.path() : tab.url }}\" routerLinkActive=\"menu-navegacion__opcion--activo\"\r\n      (click)=\"eventoMenuNavegacionSeleccionar($event, tab)\">\r\n      @if (tab.icon) {\r\n      <img [src]=\"tab.icon\" alt=\"{{ tab.name }} Icon\" class=\"pr-2\" style=\"height: 1.7rem; margin-bottom: 0.2rem\" />\r\n      }\r\n      {{ tab.name }}\r\n      @if (tab.count && tab.count > 0) {\r\n      <span class=\"menu-navegacion__numero flex align-items-center justify-content-center ml-2 border-round\">{{\r\n        tab.count }}</span>\r\n      }\r\n      <!-- Ini - Menu Dropdown -->\r\n      @if (tipoMenu === TipoMenuNavegacion.Dropdown) {\r\n      @if (menuNavegacionSeleccionadoId===tab.code) {\r\n      <i class=\"pi pi-sort-up-fill absolute bottom-0 left-50 hidden lg:block\" style=\"opacity: 0.6\"></i>\r\n      } @if (tab.options && tab.options.length > 0) {\r\n      <i class=\"pl-2 pi\" style=\"margin-left: auto\" [class.pi-chevron-down]=\"!tab.extended\"\r\n        [class.pi-chevron-up]=\"tab.extended\"></i>\r\n      @if (tab.extended===true) {\r\n      <ul class=\"absolute left-0 p-0 m-0 bg-white w-full lg:w-18rem lg:border-round-lg menu-navegacion__submenu\">\r\n        @for (item of tab.options; track $index) {\r\n        <li class=\"p-0 m-0\">\r\n          <a routerLink=\"{{ item.url }}\" (click)=\"eventoSubmenuNavegacion($event, tab)\" class=\"block\">{{ item.name\r\n            }}</a>\r\n        </li>\r\n        }\r\n      </ul>\r\n      }\r\n      }\r\n      }\r\n      <!-- Fin - Menu Dropdown -->\r\n    </a>\r\n    }\r\n\r\n    <!--Ini - Menu Botones -->\r\n    @if (tipoMenu === TipoMenuNavegacion.Dropdown && menuNavegacionBotones.length > 0) {\r\n    <div style=\"margin-left: auto\" class=\"flex\">\r\n      @for (item of menuNavegacionBotones; track $index) {\r\n      <button class=\"relative w-full lg:w-auto justify-content-start mx-2 {{item.styleClass ? item.styleClass : ''}}\"\r\n        (click)=\"eventoSubmenuDropdown($event, item)\" [attr.disabled]=\"item.disabled === true ? true : null\">\r\n        @if(item.icon && item.icon!==''){\r\n        <img [src]=\"item.icon\" alt=\"Icono {{ item.name }}\" class=\"cursor-pointer pr-1\" style=\"height: 1.5rem\" />\r\n        }\r\n        {{ item.name }}\r\n        @if (item.options && item.options.length > 0) {\r\n        <i class=\"pl-2 pi\" style=\"margin-left: auto\" [class.pi-chevron-down]=\"!item.extended\"\r\n          [class.pi-chevron-up]=\"item.extended\"></i>\r\n\r\n        @if (item.extended===true) {\r\n        <ul\r\n          class=\"absolute right-0 p-0 m-0 bg-white w-full lg:w-15rem lg:border-round-lg text-left menu-navegacion__submenu\">\r\n          @for (item of item.options; track $index) {\r\n          <li class=\"p-0 m-0\">\r\n            <a routerLink=\"{{ item.url }}\" (click)=\"item.extended = false\" class=\"block\">{{ item.name }}</a>\r\n          </li>\r\n          }\r\n        </ul>\r\n        }\r\n        }\r\n      </button>\r\n      }\r\n    </div>\r\n    }\r\n    <!--Fin - Menu Botones -->\r\n  </div>\r\n\r\n  @if (tipoMenu === TipoMenuNavegacion.Sidebar) {\r\n  <div class=\"hidden lg:block menu-navegacion__version\">\r\n    Versi\u00F3n {{ version }}\r\n  </div>\r\n  }\r\n</div>\r\n<!--Fin-Menu Opciones-->\r\n}\r\n\r\n<!--Ini - M\u00E1s Opciones Modal -->\r\n@if (mostrarMasOpciones===true) {\r\n<div class=\"absolute bg-white border-round-xl aplicaciones z-5\">\r\n  <img [src]=\"baseAssetsUrl + '/icons/close.svg'\" class=\"absolute cursor-pointer aplicaciones__cerrar\"\r\n    (click)=\"mostrarMasOpciones = false\" alt=\"img\" />\r\n  <div class=\"text-2xl text-primary px-3 py-3\">Carpeta Fiscal Electr\u00F3nico</div>\r\n  <div class=\"grid grid-nogutter aplicaciones__opciones\">\r\n    @for (aplicacion of aplicaciones; track $index) {\r\n    <div class=\"col-12 sm:col-6 aplicaciones__opcion\">\r\n      <a href=\"{{ aplicacion.url }}\" class=\"block w-full aplicaciones__vinculo\">{{ aplicacion.sistema | titlecase }}</a>\r\n    </div>\r\n    }\r\n  </div>\r\n</div>\r\n}\r\n<!--Fin - M\u00E1s Opciones Modal -->", styles: [".linea-superior{background-color:var(--mpfn-background-opaque)}.titulo{border-left:4px solid var(--primary-color)}.linea-inferior{background-color:var(--primary-color);height:.5rem}.btn-mas-opciones{border:1px solid var(--mpfn-gray2);padding:.3rem;width:2rem;height:2rem}.aplicaciones{top:2.2rem;left:0;width:100%;box-shadow:10px 10px 86px -22px var(--mpfn-black);-webkit-box-shadow:10px 10px 86px -22px var(--mpfn-black);-moz-box-shadow:10px 10px 86px -22px var(--mpfn-black);font-family:var(--mpfn-font-regular);overflow:hidden}.aplicaciones__opciones{border-top:1px solid var(--mpfn-gray3)}.aplicaciones__opcion{border-bottom:1px solid var(--mpfn-gray3);border-right:1px solid var(--mpfn-gray3)}.aplicaciones__vinculo{padding:.7rem .9rem}.aplicaciones__vinculo:hover{background-color:var(--mpfn-background)}.aplicaciones__cerrar{right:.7rem;top:.5rem;width:1.2rem}.usuario{padding-right:.5rem}.usuario__foto{background-color:#d8d8d8;width:2.6rem;height:2.6rem}@media (min-width: 768px){.aplicaciones{width:39rem;left:1.6rem}}.menu-navegacion{background-color:var(--primary-color);color:var(--mpfn-white)}.menu-navegacion__toggle i{transition:all .5s ease;color:var(--mpfn-white);font-size:22px}.menu-navegacion__contenido{transition:all .5s}.menu-navegacion__contenido--ancho-version{width:calc(100% - var(--version-width))}.menu-navegacion__opcion{font-family:var(--mpfn-font-light);text-decoration:none;color:var(--mpfn-white)}.menu-navegacion__opcion:hover,.menu-navegacion__opcion--activo{background-color:var(--mpfn-blue-hover)}.menu-navegacion__numero{font-family:var(--mpfn-font-semi-bold);color:var(--mpfn-white);background-color:var(--mpfn-secondary);font-size:.9rem;width:1.375rem;height:1.375rem}.menu-navegacion__version{width:var(--version-width);font-size:1em;font-family:var(--mpfn-font-regular);color:var(--mpfn-gray4)}.alerta__btn{background-color:transparent;position:relative}.alerta__btn:hover{opacity:.8}.alerta__numero{border-radius:50%;background-color:#f19700;color:#fff;width:1.2rem;height:1.3rem;font-size:.7rem;font-weight:700;text-align:center;position:absolute;top:-5px;left:26px;line-height:1.3rem}.menu-navegacion__submenu{top:calc(100% + .3rem);border:1px solid var(--mpfn-gray7);z-index:10;overflow:hidden}.menu-navegacion__submenu li{list-style:none}.menu-navegacion__submenu li a{font-size:1rem;padding:.6rem 1rem;border-bottom:1px solid var(--mpfn-gray7)}.menu-navegacion__submenu li a:hover{background-color:var(--mpfn-gray8)}.menu-navegacion__submenu li:last-child a{border-bottom:none}@media (max-width: 992px){.menu-navegacion__contenido--ancho-version{width:100%}}@media (max-width: 576px){.logo{display:none}}\n"] }]
        }], propDecorators: { baseAssetsUrl: [{
                type: Input,
                args: [{ required: true }]
            }], aplicaciones: [{
                type: Input
            }], alertas: [{
                type: Input
            }], usuario: [{
                type: Input
            }], titulos: [{
                type: Input
            }], menuNavegacion: [{
                type: Input
            }], tipoMenu: [{
                type: Input
            }], menuNavegacionBotones: [{
                type: Input
            }], prefijoURL: [{
                type: Input
            }], menuNavegacionSeleccionado: [{
                type: Output
            }] } });

/*
 * Public API Surface of header
 */

/**
 * Generated bundle index. Do not edit.
 */

export { HeaderService, NgxCfngCoreLayoutHeaderComponent, TipoMenuNavegacion };
//# sourceMappingURL=ngx-cfng-core-layout-header.mjs.map
