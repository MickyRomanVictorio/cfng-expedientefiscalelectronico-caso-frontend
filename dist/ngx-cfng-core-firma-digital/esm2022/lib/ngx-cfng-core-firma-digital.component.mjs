import { Component } from '@angular/core';
import { enviroment } from './enviroments/environment';
import * as i0 from "@angular/core";
import * as i1 from "./ngx-cfng-core-firma-digital.service";
export class NgxCfngCoreFirmaDigitalComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: NgxCfngCoreFirmaDigitalComponent, deps: [{ token: i1.NgxCfngCoreFirmaDigitalService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.4", type: NgxCfngCoreFirmaDigitalComponent, isStandalone: true, selector: "cfe-core-firma-digital", ngImport: i0, template: ``, isInline: true, styles: [""] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: NgxCfngCoreFirmaDigitalComponent, decorators: [{
            type: Component,
            args: [{ selector: 'cfe-core-firma-digital', standalone: true, imports: [], template: `` }]
        }], ctorParameters: () => [{ type: i1.NgxCfngCoreFirmaDigitalService }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWNmbmctY29yZS1maXJtYS1kaWdpdGFsLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jZm5nLWNvcmUtZmlybWEtZGlnaXRhbC9zcmMvbGliL25neC1jZm5nLWNvcmUtZmlybWEtZGlnaXRhbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDJCQUEyQixDQUFDOzs7QUFVdkQsTUFBTSxPQUFPLGdDQUFnQztJQUV2QjtJQUFwQixZQUFvQiwwQkFBMEQ7UUFBMUQsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUFnQztJQUMzRSxDQUFDO0lBRUosZUFBZTtRQUNiLElBQUksQ0FBQywwQkFBMEI7YUFDNUIsdUJBQXVCLENBQUM7WUFDdkIsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRTtZQUM3QyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFO1lBQ3RELEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUU7U0FDdEQsQ0FBQzthQUNELElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUU7WUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckUsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO3VHQWxCVSxnQ0FBZ0M7MkZBQWhDLGdDQUFnQyxrRkFIakMsRUFBRTs7MkZBR0QsZ0NBQWdDO2tCQVA1QyxTQUFTOytCQUNFLHdCQUF3QixjQUN0QixJQUFJLFdBQ1AsRUFBRSxZQUNELEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTmd4Q2ZuZ0NvcmVGaXJtYURpZ2l0YWxTZXJ2aWNlIH0gZnJvbSAnLi9uZ3gtY2ZuZy1jb3JlLWZpcm1hLWRpZ2l0YWwuc2VydmljZSc7XHJcbmltcG9ydCB7IGVudmlyb21lbnQgfSBmcm9tICcuL2Vudmlyb21lbnRzL2Vudmlyb25tZW50JztcclxuXHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2NmZS1jb3JlLWZpcm1hLWRpZ2l0YWwnLFxyXG4gIHN0YW5kYWxvbmU6IHRydWUsXHJcbiAgaW1wb3J0czogW10sXHJcbiAgdGVtcGxhdGU6IGBgLFxyXG4gIHN0eWxlczogYGAsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hDZm5nQ29yZUZpcm1hRGlnaXRhbENvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5neENvcmVGaXJtYURpZ2l0YWxTZXJ2aWNlOiBOZ3hDZm5nQ29yZUZpcm1hRGlnaXRhbFNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcclxuICAgIHRoaXMubmd4Q29yZUZpcm1hRGlnaXRhbFNlcnZpY2VcclxuICAgICAgLmxvYWRTY3JpcHRzU2VxdWVudGlhbGx5KFtcclxuICAgICAgICB7IG5hbWU6ICdqcXVlcnknLCBzcmM6IGVudmlyb21lbnQuY2RuLmpxdWV5IH0sXHJcbiAgICAgICAgeyBuYW1lOiAnaW50ZWdyYWRvcicsIHNyYzogZW52aXJvbWVudC5jZG4uaW50ZWdyYWRvciB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2Zpcm1hcGVydScsIHNyYzogZW52aXJvbWVudC5jZG4uZmlybWFfcGVydSB9LFxyXG4gICAgICBdKVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NGRSBDb3JlIEZpcm1hIERpZ2l0YWwgaW5pY2lhZG8nKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgQ0ZFIEludGVncmFkb3IgRmlybWEgRGlnaXRhbDogJywgZXJyb3IuZXJyb3IpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG59XHJcbiJdfQ==