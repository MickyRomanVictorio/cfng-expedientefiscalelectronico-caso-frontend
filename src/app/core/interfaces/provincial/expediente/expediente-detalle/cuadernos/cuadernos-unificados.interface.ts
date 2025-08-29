import { ListaSujetosProcesales } from "./cuadernos-extremos.interface";
import { ListaDelitosSujetos } from "./sujeto-procesal.interface";

export interface CuadernoUnificadosTemporal {
    idActoProcesal?:string;
    idTramite?:string;
    sujetoSeleccionado?: ListaSujetosProcesales | null;
    sujetoDelitoSeleccionado?: ListaDelitosSujetos[];
    sujetosProcesalesSeleccionados?: ListaSujetosProcesales[];
}
