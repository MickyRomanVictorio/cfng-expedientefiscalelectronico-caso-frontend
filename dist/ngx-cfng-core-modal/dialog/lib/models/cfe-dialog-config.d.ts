import { CfeDialogTipoIcono } from "./cfe-dialog-tipo-icono";
export interface CfeDialogConfig {
    tamanioDialog?: string;
    containerClass?: string;
    tipoIcono?: CfeDialogTipoIcono;
    titulo: string;
    descripcion?: string;
    textoBotonConfirmar?: string;
    tieneBotonCancelar?: boolean;
    textoBotonCancelar?: string;
    ocultarBotones?: boolean;
    ocultarCierre?: boolean;
}
export declare enum CfeDialogRespuesta {
    Confirmado = "confirmado",
    Cancelado = "cancelado",
    Cerrado = "cerrado"
}
