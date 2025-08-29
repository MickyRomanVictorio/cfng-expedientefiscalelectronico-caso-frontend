import { EnviarACedula } from "@core/types/enviar-a-cedula.type";

export interface EnviarCedula{
    idNotificaCedula: string,
    idSujeto: string,
    idDireccion: string,
    enviarA: EnviarACedula,
}