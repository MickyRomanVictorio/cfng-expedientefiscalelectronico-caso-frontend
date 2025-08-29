import { AlertaFormulario } from "@core/interfaces/comunes/alerta-formulario.interface";
import { CasillaSeleccionable } from "@core/interfaces/comunes/casillas-seleccionables.interface";

export interface FormulariosElementos {
    alertas?: AlertaFormulario[],
    casillasSeleccionables?: CasillaSeleccionable[],
    casillasSeleccionadas?: CasillaSeleccionable[],
    esReservado?: boolean,
    botonTexto?: string,
    modalACargar?: any,
    desagregar?: Object, // Colocar Interfaz de Marco para Devolver Response de Desagregar
}
