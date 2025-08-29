import { DatosGenericosInput } from "../generico/datos-genericos-input";

export interface DatosReparacionCivilInput extends DatosGenericosInput {
    nuCaso?: string | null
}
