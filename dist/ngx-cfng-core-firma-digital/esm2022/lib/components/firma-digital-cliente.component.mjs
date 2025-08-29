import { Component } from '@angular/core';
import { fromEvent } from 'rxjs';
import { sendParamOne } from '../utils/param-firma';
import { NgxCfngCoreFirmaDigitalComponent } from '../ngx-cfng-core-firma-digital.component';
import * as i0 from "@angular/core";
import * as i1 from "../services/firma-digital-cliente.service";
export class FirmaDigitalClienteComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: FirmaDigitalClienteComponent, deps: [{ token: i1.FirmaDigitalClienteService }], target: i0.ɵɵFactoryTarget.Component });
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
        }], ctorParameters: () => [{ type: i1.FirmaDigitalClienteService }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlybWEtZGlnaXRhbC1jbGllbnRlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jZm5nLWNvcmUtZmlybWEtZGlnaXRhbC9zcmMvbGliL2NvbXBvbmVudHMvZmlybWEtZGlnaXRhbC1jbGllbnRlLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUU3RCxPQUFPLEVBQUUsU0FBUyxFQUFnQixNQUFNLE1BQU0sQ0FBQztBQUUvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0sMENBQTBDLENBQUM7OztBQVk1RixNQUFNLE9BQU8sNEJBQTRCO0lBSW5CO0lBRlosWUFBWSxHQUFtQixFQUFFLENBQUM7SUFFMUMsWUFBb0IsMEJBQXNEO1FBQXRELCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNEI7SUFDdkUsQ0FBQztJQUVKLFFBQVE7UUFDTixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FDcEIsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFvQixFQUFFLEVBQUU7WUFDOUUsSUFBSSxDQUFDLGtCQUFrQixDQUFFLElBQUksQ0FBRSxDQUFBO1FBQ2pDLENBQUMsQ0FBQyxDQUNILENBQUM7UUFFRixTQUFTLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDekMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztRQUVILFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUMxQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlELENBQUMsQ0FBQyxDQUFDO0lBRUwsQ0FBQztJQUVPLGtCQUFrQixDQUFFLFNBQXlCO1FBQ25ELElBQ0UsU0FBUyxDQUFDLEVBQUUsS0FBSyxJQUFJO1lBQ3JCLFNBQVMsQ0FBQyxFQUFFLEtBQUssU0FBUztZQUMxQixTQUFTLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFDbkIsQ0FBQztZQUNELEtBQUssQ0FBRSwwRUFBMEUsQ0FBQyxDQUFDO1lBQ25GLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBRSxTQUFTLENBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRU8sZUFBZSxDQUFFLFNBQXlCO1FBRWhELElBQUksU0FBUyxHQUF3QjtZQUNuQyxTQUFTLEVBQUUsU0FBUyxDQUFDLFNBQVM7WUFDOUIsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO1lBQ3RDLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxTQUFTO1NBQ3hDLENBQUM7UUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELFdBQVc7UUFDUCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQzt1R0FsRFUsNEJBQTRCOzJGQUE1Qiw0QkFBNEIseUZBTjdCOzs7S0FHUCwwRUFKTyxnQ0FBZ0M7OzJGQU8vQiw0QkFBNEI7a0JBVnhDLFNBQVM7K0JBQ0UsK0JBQStCLGNBQzdCLElBQUksV0FDUCxDQUFDLGdDQUFnQyxDQUFDLFlBQ2pDOzs7S0FHUCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgRmlybWFEaWdpdGFsQ2xpZW50ZVNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9maXJtYS1kaWdpdGFsLWNsaWVudGUuc2VydmljZSc7XHJcbmltcG9ydCB7IGZyb21FdmVudCwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IEZpcm1hSW50ZXJmYWNlLCBGaXJtYVBhcmFtSW50ZXJmYWNlIH0gZnJvbSAnLi4vbW9kZWxzL2Zpcm1hLWRpZ2l0YWwuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgc2VuZFBhcmFtT25lIH0gZnJvbSAnLi4vdXRpbHMvcGFyYW0tZmlybWEnO1xyXG5pbXBvcnQgeyBOZ3hDZm5nQ29yZUZpcm1hRGlnaXRhbENvbXBvbmVudCB9IGZyb20gJy4uL25neC1jZm5nLWNvcmUtZmlybWEtZGlnaXRhbC5jb21wb25lbnQnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdjZmUtbGliLWZpcm1hLWRpZ2l0YWwtY2xpZW50ZScsXHJcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcclxuICBpbXBvcnRzOiBbTmd4Q2ZuZ0NvcmVGaXJtYURpZ2l0YWxDb21wb25lbnRdLFxyXG4gIHRlbXBsYXRlOiBgXHJcbiAgICA8ZGl2IGlkPVwiYWRkQ29tcG9uZW50XCI+PC9kaXY+XHJcbiAgICA8Y2ZlLWNvcmUtZmlybWEtZGlnaXRhbD48L2NmZS1jb3JlLWZpcm1hLWRpZ2l0YWw+XHJcbiAgICBgLFxyXG4gIHN0eWxlczogYGAsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBGaXJtYURpZ2l0YWxDbGllbnRlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG5cclxuICBwcml2YXRlIHN1c2NyaXB0aW9uczogU3Vic2NyaXB0aW9uW10gPSBbXTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBmaXJtYURpZ2l0YWxDbGllbnRlU2VydmljZTogRmlybWFEaWdpdGFsQ2xpZW50ZVNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgdGhpcy5zdXNjcmlwdGlvbnMucHVzaChcclxuICAgICAgdGhpcy5maXJtYURpZ2l0YWxDbGllbnRlU2VydmljZS5zZW5kRGF0YVNpZ24uc3Vic2NyaWJlKChkYXRhOiBGaXJtYUludGVyZmFjZSkgPT4ge1xyXG4gICAgICAgIHRoaXMudmVyaWZpY2FyRGF0YUZpcm1hKCBkYXRhIClcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgZnJvbUV2ZW50KHdpbmRvdywgJ3NpZ25PSycpLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgIHRoaXMuZmlybWFEaWdpdGFsQ2xpZW50ZVNlcnZpY2UucHJvY2Vzc1NpZ25DbGllbnQuZW1pdCgnMCcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZnJvbUV2ZW50KHdpbmRvdywgJ3NpZ25CQUQnKS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICB0aGlzLmZpcm1hRGlnaXRhbENsaWVudGVTZXJ2aWNlLnByb2Nlc3NTaWduQ2xpZW50LmVtaXQoJzEnKTtcclxuICAgIH0pO1xyXG5cclxuICB9XHJcblxyXG4gIHByaXZhdGUgdmVyaWZpY2FyRGF0YUZpcm1hKCBkYXRhRmlybWE6IEZpcm1hSW50ZXJmYWNlICk6IHZvaWQge1xyXG4gICAgaWYgKFxyXG4gICAgICBkYXRhRmlybWEuaWQgPT09IG51bGwgfHxcclxuICAgICAgZGF0YUZpcm1hLmlkID09PSB1bmRlZmluZWQgfHxcclxuICAgICAgZGF0YUZpcm1hLmlkID09PSAnJ1xyXG4gICAgKSB7XHJcbiAgICAgIGFsZXJ0KCAnRXMgcmVxdWVyaWRvIHVuIGlkZW50aWZpY2Fkb3IgZGUgZG9jdW1lbnRvIHBhcmEgY29udGludWFyIGNvbiBlbCBwcm9jZXNvJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVudmlhckRhdGFGaXJtYSggZGF0YUZpcm1hICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGVudmlhckRhdGFGaXJtYSggZGF0YUZpcm1hOiBGaXJtYUludGVyZmFjZSApOiB2b2lkIHtcclxuXHJcbiAgICBsZXQgcGFyYW1fcGRmOiBGaXJtYVBhcmFtSW50ZXJmYWNlID0ge1xyXG4gICAgICBwYXJhbV91cmw6IGRhdGFGaXJtYS5wYXJhbV91cmwsXHJcbiAgICAgIHBhcmFtX3Rva2VuOiBKU09OLnN0cmluZ2lmeShkYXRhRmlybWEpLFxyXG4gICAgICBkb2N1bWVudF9leHRlbnNpb246IGRhdGFGaXJtYS5leHRlbnNpb24sXHJcbiAgICB9O1xyXG5cclxuICAgIHNlbmRQYXJhbU9uZShwYXJhbV9wZGYpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuc3VzY3JpcHRpb25zLmZvckVhY2goKHN1c2NyaXBjaW9uKSA9PiBzdXNjcmlwY2lvbi51bnN1YnNjcmliZSgpKTtcclxuICB9XHJcblxyXG59XHJcbiJdfQ==