import { DialogService } from "primeng/dynamicdialog";
import { Observable } from "rxjs";
import { CfeDialogConfig } from "../models/cfe-dialog-config";
import * as i0 from "@angular/core";
export declare class NgxCfngCoreModalDialogService {
    private readonly dialogService;
    private dialogRef;
    constructor(dialogService: DialogService);
    success(titulo: string, descripcion: string, textoBotonConfirmar?: string): Observable<any>;
    info(titulo: string, descripcion: string, textoBotonConfirmar?: string): Observable<any>;
    error(titulo: string, descripcion: string, textoBotonConfirmar?: string): Observable<any>;
    warning(titulo: string, descripcion: string, textoBotonConfirmar?: string, tieneBotonCancelar?: boolean, textoBotonCancelar?: string): Observable<any>;
    warningRed(titulo: string, descripcion: string, textoBotonConfirmar?: string, tieneBotonCancelar?: boolean, textoBotonCancelar?: string): Observable<any>;
    question(titulo: string, descripcion: string, textoBotonConfirmar?: string, textoBotonCancelar?: string): Observable<any>;
    general(config: CfeDialogConfig): Observable<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxCfngCoreModalDialogService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NgxCfngCoreModalDialogService>;
}
