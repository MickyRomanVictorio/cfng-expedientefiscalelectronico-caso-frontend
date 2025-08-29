import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { NgxCfngCoreModalDialogComponent } from "../components/ngx-cfng-core-modal-dialog.component";
import * as i0 from "@angular/core";
import * as i1 from "primeng/dynamicdialog";
export class NgxCfngCoreModalDialogService {
    dialogService;
    dialogRef = null; // Guarda la referencia del diálogo actual
    constructor(dialogService) {
        this.dialogService = dialogService;
    }
    success(titulo, descripcion, textoBotonConfirmar) {
        const config = {
            tipoIcono: 'success',
            titulo: titulo,
            descripcion: descripcion,
            textoBotonConfirmar: textoBotonConfirmar,
        };
        return this.general(config);
    }
    info(titulo, descripcion, textoBotonConfirmar) {
        const config = {
            tipoIcono: 'info',
            titulo: titulo,
            descripcion: descripcion,
            textoBotonConfirmar: textoBotonConfirmar,
        };
        return this.general(config);
    }
    error(titulo, descripcion, textoBotonConfirmar) {
        const config = {
            tipoIcono: 'error',
            titulo: titulo,
            descripcion: descripcion,
            textoBotonConfirmar: textoBotonConfirmar,
        };
        return this.general(config);
    }
    warning(titulo, descripcion, textoBotonConfirmar, tieneBotonCancelar, textoBotonCancelar) {
        const config = {
            tipoIcono: 'warning',
            titulo: titulo,
            descripcion: descripcion,
            textoBotonConfirmar: textoBotonConfirmar,
            tieneBotonCancelar: tieneBotonCancelar,
            textoBotonCancelar: textoBotonCancelar,
        };
        return this.general(config);
    }
    warningRed(titulo, descripcion, textoBotonConfirmar, tieneBotonCancelar, textoBotonCancelar) {
        const config = {
            tipoIcono: 'warningred',
            titulo: titulo,
            descripcion: descripcion,
            textoBotonConfirmar: textoBotonConfirmar,
            tieneBotonCancelar: tieneBotonCancelar,
            textoBotonCancelar: textoBotonCancelar,
        };
        return this.general(config);
    }
    question(titulo, descripcion, textoBotonConfirmar, textoBotonCancelar) {
        const config = {
            tipoIcono: 'quest',
            titulo: titulo,
            descripcion: descripcion,
            textoBotonConfirmar: textoBotonConfirmar,
            tieneBotonCancelar: true,
            textoBotonCancelar: textoBotonCancelar,
        };
        return this.general(config);
    }
    general(config) {
        this.dialogRef = this.dialogService.open(NgxCfngCoreModalDialogComponent, {
            width: config.tamanioDialog ? config.tamanioDialog : '600px',
            showHeader: false,
            data: {
                tipoIcono: config.tipoIcono,
                titulo: config.titulo,
                descripcion: config.descripcion,
                tieneBotonCancelar: config.tieneBotonCancelar,
                textoBotonConfirmar: config.textoBotonConfirmar,
                textoBotonCancelar: config.textoBotonCancelar,
            }
        });
        // Retorna el observable para que el componente pueda subscribirse
        return new Observable(observer => {
            this.dialogRef.onClose.subscribe({
                next: (resp) => {
                    //
                    this.dialogRef.destroy();
                    this.dialogRef = null;
                    //
                    observer.next(resp);
                    observer.complete();
                },
                error: (err) => observer.error(err)
            });
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogService, deps: [{ token: i1.DialogService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.DialogService }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWNmbmctY29yZS1tb2RhbC1kaWFsb2cuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jZm5nLWNvcmUtbW9kYWwvZGlhbG9nL3NyYy9saWIvc2VydmljZXMvbmd4LWNmbmctY29yZS1tb2RhbC1kaWFsb2cuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpDLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFFaEMsT0FBTyxFQUFDLCtCQUErQixFQUFDLE1BQU0sb0RBQW9ELENBQUM7OztBQUtuRyxNQUFNLE9BQU8sNkJBQTZCO0lBS3JCO0lBSFgsU0FBUyxHQUE0QixJQUFJLENBQUMsQ0FBQywwQ0FBMEM7SUFFN0YsWUFDbUIsYUFBNEI7UUFBNUIsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFFL0MsQ0FBQztJQUVNLE9BQU8sQ0FBQyxNQUFjLEVBQUUsV0FBbUIsRUFBRSxtQkFBNEI7UUFDOUUsTUFBTSxNQUFNLEdBQW9CO1lBQzlCLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLE1BQU0sRUFBRSxNQUFNO1lBQ2QsV0FBVyxFQUFFLFdBQVc7WUFDeEIsbUJBQW1CLEVBQUUsbUJBQW1CO1NBQ3pDLENBQUM7UUFDRixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVNLElBQUksQ0FBQyxNQUFjLEVBQUUsV0FBbUIsRUFBRSxtQkFBNEI7UUFDM0UsTUFBTSxNQUFNLEdBQW9CO1lBQzlCLFNBQVMsRUFBRSxNQUFNO1lBQ2pCLE1BQU0sRUFBRSxNQUFNO1lBQ2QsV0FBVyxFQUFFLFdBQVc7WUFDeEIsbUJBQW1CLEVBQUUsbUJBQW1CO1NBQ3pDLENBQUM7UUFDRixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7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LENBQUM7b0JBQ3BCLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDdEIsQ0FBQztnQkFDRCxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO2FBQ3BDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzt1R0F2R1UsNkJBQTZCOzJHQUE3Qiw2QkFBNkIsY0FGNUIsTUFBTTs7MkZBRVAsNkJBQTZCO2tCQUh6QyxVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7RGlhbG9nU2VydmljZSwgRHluYW1pY0RpYWxvZ0NvbmZpZywgRHluYW1pY0RpYWxvZ1JlZn0gZnJvbSBcInByaW1lbmcvZHluYW1pY2RpYWxvZ1wiO1xyXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gXCJyeGpzXCI7XHJcbmltcG9ydCB7Q2ZlRGlhbG9nQ29uZmlnfSBmcm9tIFwiLi4vbW9kZWxzL2NmZS1kaWFsb2ctY29uZmlnXCI7XHJcbmltcG9ydCB7Tmd4Q2ZuZ0NvcmVNb2RhbERpYWxvZ0NvbXBvbmVudH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvbmd4LWNmbmctY29yZS1tb2RhbC1kaWFsb2cuY29tcG9uZW50XCI7XHJcblxyXG5ASW5qZWN0YWJsZSh7XHJcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hDZm5nQ29yZU1vZGFsRGlhbG9nU2VydmljZSB7XHJcblxyXG4gIHByaXZhdGUgZGlhbG9nUmVmOiBEeW5hbWljRGlhbG9nUmVmIHwgbnVsbCA9IG51bGw7IC8vIEd1YXJkYSBsYSByZWZlcmVuY2lhIGRlbCBkacOhbG9nbyBhY3R1YWxcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRpYWxvZ1NlcnZpY2U6IERpYWxvZ1NlcnZpY2UsXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3VjY2Vzcyh0aXR1bG86IHN0cmluZywgZGVzY3JpcGNpb246IHN0cmluZywgdGV4dG9Cb3RvbkNvbmZpcm1hcj86IHN0cmluZyk6IE9ic2VydmFibGU8YW55PiB7XHJcbiAgICBjb25zdCBjb25maWc6IENmZURpYWxvZ0NvbmZpZyA9IHtcclxuICAgICAgdGlwb0ljb25vOiAnc3VjY2VzcycsXHJcbiAgICAgIHRpdHVsbzogdGl0dWxvLFxyXG4gICAgICBkZXNjcmlwY2lvbjogZGVzY3JpcGNpb24sXHJcbiAgICAgIHRleHRvQm90b25Db25maXJtYXI6IHRleHRvQm90b25Db25maXJtYXIsXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHRoaXMuZ2VuZXJhbChjb25maWcpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGluZm8odGl0dWxvOiBzdHJpbmcsIGRlc2NyaXBjaW9uOiBzdHJpbmcsIHRleHRvQm90b25Db25maXJtYXI/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPGFueT4ge1xyXG4gICAgY29uc3QgY29uZmlnOiBDZmVEaWFsb2dDb25maWcgPSB7XHJcbiAgICAgIHRpcG9JY29ubzogJ2luZm8nLFxyXG4gICAgICB0aXR1bG86IHRpdHVsbyxcclxuICAgICAgZGVzY3JpcGNpb246IGRlc2NyaXBjaW9uLFxyXG4gICAgICB0ZXh0b0JvdG9uQ29uZmlybWFyOiB0ZXh0b0JvdG9uQ29uZmlybWFyLFxyXG4gICAgfTtcclxuICAgIHJldHVybiB0aGlzLmdlbmVyYWwoY29uZmlnKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBlcnJvcih0aXR1bG86IHN0cmluZywgZGVzY3JpcGNpb246IHN0cmluZywgdGV4dG9Cb3RvbkNvbmZpcm1hcj86IHN0cmluZyk6IE9ic2VydmFibGU8YW55PiB7XHJcbiAgICBjb25zdCBjb25maWc6IENmZURpYWxvZ0NvbmZpZyA9IHtcclxuICAgICAgdGlwb0ljb25vOiAnZXJyb3InLFxyXG4gICAgICB0aXR1bG86IHRpdHVsbyxcclxuICAgICAgZGVzY3JpcGNpb246IGRlc2NyaXBjaW9uLFxyXG4gICAgICB0ZXh0b0JvdG9uQ29uZmlybWFyOiB0ZXh0b0JvdG9uQ29uZmlybWFyLFxyXG4gICAgfTtcclxuICAgIHJldHVybiB0aGlzLmdlbmVyYWwoY29uZmlnKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB3YXJuaW5nKHRpdHVsbzogc3RyaW5nLCBkZXNjcmlwY2lvbjogc3RyaW5nLCB0ZXh0b0JvdG9uQ29uZmlybWFyPzogc3RyaW5nLCB0aWVuZUJvdG9uQ2FuY2VsYXI/OiBib29sZWFuLCB0ZXh0b0JvdG9uQ2FuY2VsYXI/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPGFueT4ge1xyXG4gICAgY29uc3QgY29uZmlnOiBDZmVEaWFsb2dDb25maWcgPSB7XHJcbiAgICAgIHRpcG9JY29ubzogJ3dhcm5pbmcnLFxyXG4gICAgICB0aXR1bG86IHRpdHVsbyxcclxuICAgICAgZGVzY3JpcGNpb246IGRlc2NyaXBjaW9uLFxyXG4gICAgICB0ZXh0b0JvdG9uQ29uZmlybWFyOiB0ZXh0b0JvdG9uQ29uZmlybWFyLFxyXG4gICAgICB0aWVuZUJvdG9uQ2FuY2VsYXI6IHRpZW5lQm90b25DYW5jZWxhcixcclxuICAgICAgdGV4dG9Cb3RvbkNhbmNlbGFyOiB0ZXh0b0JvdG9uQ2FuY2VsYXIsXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHRoaXMuZ2VuZXJhbChjb25maWcpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHdhcm5pbmdSZWQodGl0dWxvOiBzdHJpbmcsIGRlc2NyaXBjaW9uOiBzdHJpbmcsIHRleHRvQm90b25Db25maXJtYXI/OiBzdHJpbmcsIHRpZW5lQm90b25DYW5jZWxhcj86IGJvb2xlYW4sIHRleHRvQm90b25DYW5jZWxhcj86IHN0cmluZyk6IE9ic2VydmFibGU8YW55PiB7XHJcbiAgICBjb25zdCBjb25maWc6IENmZURpYWxvZ0NvbmZpZyA9IHtcclxuICAgICAgdGlwb0ljb25vOiAnd2FybmluZ3JlZCcsXHJcbiAgICAgIHRpdHVsbzogdGl0dWxvLFxyXG4gICAgICBkZXNjcmlwY2lvbjogZGVzY3JpcGNpb24sXHJcbiAgICAgIHRleHRvQm90b25Db25maXJtYXI6IHRleHRvQm90b25Db25maXJtYXIsXHJcbiAgICAgIHRpZW5lQm90b25DYW5jZWxhcjogdGllbmVCb3RvbkNhbmNlbGFyLFxyXG4gICAgICB0ZXh0b0JvdG9uQ2FuY2VsYXI6IHRleHRvQm90b25DYW5jZWxhcixcclxuICAgIH07XHJcbiAgICByZXR1cm4gdGhpcy5nZW5lcmFsKGNvbmZpZyk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcXVlc3Rpb24odGl0dWxvOiBzdHJpbmcsIGRlc2NyaXBjaW9uOiBzdHJpbmcsIHRleHRvQm90b25Db25maXJtYXI/OiBzdHJpbmcsIHRleHRvQm90b25DYW5jZWxhcj86IHN0cmluZyk6IE9ic2VydmFibGU8YW55PiB7XHJcbiAgICBjb25zdCBjb25maWc6IENmZURpYWxvZ0NvbmZpZyA9IHtcclxuICAgICAgdGlwb0ljb25vOiAncXVlc3QnLFxyXG4gICAgICB0aXR1bG86IHRpdHVsbyxcclxuICAgICAgZGVzY3JpcGNpb246IGRlc2NyaXBjaW9uLFxyXG4gICAgICB0ZXh0b0JvdG9uQ29uZmlybWFyOiB0ZXh0b0JvdG9uQ29uZmlybWFyLFxyXG4gICAgICB0aWVuZUJvdG9uQ2FuY2VsYXI6IHRydWUsXHJcbiAgICAgIHRleHRvQm90b25DYW5jZWxhcjogdGV4dG9Cb3RvbkNhbmNlbGFyLFxyXG4gICAgfTtcclxuICAgIHJldHVybiB0aGlzLmdlbmVyYWwoY29uZmlnKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZW5lcmFsKGNvbmZpZzogQ2ZlRGlhbG9nQ29uZmlnKTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuICAgIHRoaXMuZGlhbG9nUmVmID0gdGhpcy5kaWFsb2dTZXJ2aWNlLm9wZW4oTmd4Q2ZuZ0NvcmVNb2RhbERpYWxvZ0NvbXBvbmVudCwge1xyXG4gICAgICB3aWR0aDogY29uZmlnLnRhbWFuaW9EaWFsb2cgPyBjb25maWcudGFtYW5pb0RpYWxvZyA6ICc2MDBweCcsXHJcbiAgICAgIHNob3dIZWFkZXI6IGZhbHNlLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgdGlwb0ljb25vOiBjb25maWcudGlwb0ljb25vLFxyXG4gICAgICAgIHRpdHVsbzogY29uZmlnLnRpdHVsbyxcclxuICAgICAgICBkZXNjcmlwY2lvbjogY29uZmlnLmRlc2NyaXBjaW9uLFxyXG4gICAgICAgIHRpZW5lQm90b25DYW5jZWxhcjogY29uZmlnLnRpZW5lQm90b25DYW5jZWxhcixcclxuICAgICAgICB0ZXh0b0JvdG9uQ29uZmlybWFyOiBjb25maWcudGV4dG9Cb3RvbkNvbmZpcm1hcixcclxuICAgICAgICB0ZXh0b0JvdG9uQ2FuY2VsYXI6IGNvbmZpZy50ZXh0b0JvdG9uQ2FuY2VsYXIsXHJcbiAgICAgIH1cclxuICAgIH0gYXMgRHluYW1pY0RpYWxvZ0NvbmZpZzxDZmVEaWFsb2dDb25maWc+KTtcclxuXHJcbiAgICAvLyBSZXRvcm5hIGVsIG9ic2VydmFibGUgcGFyYSBxdWUgZWwgY29tcG9uZW50ZSBwdWVkYSBzdWJzY3JpYmlyc2VcclxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XHJcbiAgICAgIHRoaXMuZGlhbG9nUmVmIS5vbkNsb3NlLnN1YnNjcmliZSh7XHJcbiAgICAgICAgbmV4dDogKHJlc3ApID0+IHtcclxuICAgICAgICAgIC8vXHJcbiAgICAgICAgICB0aGlzLmRpYWxvZ1JlZiEuZGVzdHJveSgpO1xyXG4gICAgICAgICAgdGhpcy5kaWFsb2dSZWYgPSBudWxsO1xyXG4gICAgICAgICAgLy9cclxuICAgICAgICAgIG9ic2VydmVyLm5leHQocmVzcCk7XHJcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXJyb3I6IChlcnIpID0+IG9ic2VydmVyLmVycm9yKGVycilcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIl19