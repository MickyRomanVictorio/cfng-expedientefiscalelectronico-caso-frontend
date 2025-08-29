import { AnexoDigitalizadoInterface } from "./anexo-digitalizado.interface";
import { DenunciaPendienteInterface } from "./denunica-pendiente.interface";

export interface DigitalizadoInterface {
    repositorio: string[],
    denuncia? : DenunciaPendienteInterface,
    anexos? : AnexoDigitalizadoInterface[],
}
  