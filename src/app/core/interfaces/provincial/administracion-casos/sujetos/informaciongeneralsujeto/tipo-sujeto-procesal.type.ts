import { ListItemResponse } from "@core/types/mesa-turno/response/Response";

export const PERSONA_NATURAL =  "1";
export const PERSONA_JURIDICA =  "2";
export const NACIONAL =  '0';
export const EXTRANJERO =  '1';

export const PERSONA_NATURAL_DESCRIPCION =  "PERSONA NATURAL";


export const TIPO_DIRECCION_RENIEC =  5;
export const DIRECCION_RENIEC = 'RENIEC';
export const PAIS_PERU = 102;
export const FLG_PERUANO = '0';
export const FLG_EXTRANJERO = '1';

export const TIPO_DIRECCION_SUNAT =  6;


export const EFE_TIPO_PARTE_SUJETO_AGRAVIADO = 1;
export const EFE_TIPO_PARTE_SUJETO_DENUNCIADO = 2;
export const EFE_TIPO_PARTE_SUJETO_IMPUTADO = 4;
export const LISTA_CONDICION_EFE: ListItemResponse[] = [
    { id: 47, idEquivalente: 47, nombre: 'Fallecido' },
    { id: 20, idEquivalente: 20, nombre: 'No habido' },
    { id: 46, idEquivalente: 46, nombre: 'Detenido' }
];

export const TURNO_TIPO_PARTE_SUJETO_AGRAVIADO = 1;
export const TURNO_TIPO_PARTE_SUJETO_DENUNCIADO = 2;
export const TURNO_TIPO_PARTE_SUJETO_IMPUTADO = 4;
export const LISTA_CONDICION_TURNO: ListItemResponse[] = [
    { id: 47, idEquivalente: TURNO_TIPO_PARTE_SUJETO_AGRAVIADO, nombre: 'Fallecido' },
    { id: 17, idEquivalente: TURNO_TIPO_PARTE_SUJETO_AGRAVIADO, nombre: 'No Fallecido' },
    { id: 20, idEquivalente: TURNO_TIPO_PARTE_SUJETO_DENUNCIADO, nombre: 'No Habido' },
    { id: 11, idEquivalente: TURNO_TIPO_PARTE_SUJETO_DENUNCIADO, nombre: 'Habido' },
    { id: 46, idEquivalente: TURNO_TIPO_PARTE_SUJETO_IMPUTADO, nombre: 'Detenido' },
    { id: 3, idEquivalente: TURNO_TIPO_PARTE_SUJETO_IMPUTADO, nombre: 'No Detenido' }
];


export const REGISTRO_MANUAL_NO_VERIFICADO = '0';
export const REGISTRO_AUTOMATICO_VERIFICADO = '1';

export const OTRAS_PROFESIONES = 68;

export const TIPO_DOCUMENTO_DNI = 1;

export const TIPO_DOCUMENTO_MENOR_EDAD = 8;

/*const DENUNCIANTE = 3;
const OBLIGATORIO = 1;
const OPCIONAL = 2;
const INHABILITADO = 3;
const NO_VISIBLE = 4;

export const MATRIZ_VALIDACION = {
    denunciante_peruano_reniec: {
        nacionalidad: OBLIGATORIO,
        tipoDocumento: OBLIGATORIO,
    },
    denunciante_peruano_manual: {
        nacionalidad: OBLIGATORIO,
        tipoDocumento: OBLIGATORIO,
        },
    denunciante_extranjero: {
        nacionalidad: OBLIGATORIO,
        tipoDocumento: OBLIGATORIO,
        }
};*/
