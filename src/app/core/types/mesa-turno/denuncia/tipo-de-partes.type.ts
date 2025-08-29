import { DireccionPartes } from "@core/types/persona/reniec.type";
import { ListItemResponse } from "../response/Response";

export const NOMBRE_MESAS = {
    MESA_TURNO: 'MESA DE TURNO'
}

export const TIPOS_PARTES = {
    AGRAVIADO: 1,
    DENUNCIADO: 2,
    DENUNCIANTE: 3,
    IMPUTADO: 4,
    INVESTIGADO: 13,
    ACUSADO: 6,
} ;

export const TIPOS_PARTES_PERSONA = {
    PERSONA_NATURAL:1, 
    PERSONA_JURIDICA: 2,
    ESTADO: 4, 
    SOCIEDAD: 7
};

export const LISTA_CONDICION_AGRAVIADO: ListItemResponse[] = [
    { id: 17, nombre: 'No fallecido' },
    { id: 19, nombre: 'Fallecido identificado' },
    { id: 18, nombre: 'Fallecido no identificado' }
];

export const CONDICION_AGRAVIADO = {
    NO_FALLECIDO: 17,
    FALLECIDO: 47,
};

export const PROFESION = {
    OTROS: 68
}



export const CONDICION_DENUNCIADO = {
    HABIDO: 20,
    NO_HABIDO: 11,
};

export const LISTA_CONDICION_DENUNCIADO: ListItemResponse[] = [
    { id: 20, nombre: 'Habido' },
    { id: 11, nombre: 'No habido' }
]

export const CONDICION_IMPUTADO = {
    DETENIDO: 3,
    NO_DETENIDO: 46,
}

export type PartesInvolucradasFormType = {
    index?: number,
    tipoParte: number,
    tipoParteLabel?: string,
    tipoPartePersona: number,
    tipoPartePersonaLabel?: string,
    denuncianteComoAgraviado?: boolean,
    condicionSujeto?: number,
    condicionSujetoLabel?: string,
    direcciones?: DireccionPartes[];
    /** ~ backward compatibility */
    noEliminar?: boolean
    noEditar?: boolean
}

export type EstadoFormType = PartesInvolucradasFormType;
export type SociedadFormType = PartesInvolucradasFormType;

export type PersonaJuridicaFormType = {
    numeroRuc: string,
    razonSocial: string,
    correoPrincipal: string,
    numeroContactoPrincipal: string,
    registrarDatosManualRUC: boolean;
    registraDatosManualRepresentante: boolean;
    tipoDocumentoDeclarante: number;
    numeroDocumentoDeclarante: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;


} & PartesInvolucradasFormType;



export type DatosGeneralesPersonaNatural = {
    numeroDocumentoIdentidad?: string,
    nombres?: string,
    apellidoPaterno?: string,
    apellidoMaterno?: string,
    edad?: number,
    registrarDatosManual?: boolean,
    fechaNacimiento?: Date,
    fotoPersona?: string,
    //selectables
    personaOrigen?: string,
    personaOrigenLabel?: string,
    nacionalidad?: number,
    nacionalidadLabel?: string,
    tipoDocumentoIdentidad?: number,
    tipoDocumentoIdentidadLabel?: string,
    sexo?: number | null,
    sexoLabel?: string,
    estadoCivil?: string ,
    estadoCivilLabel?: string,
    gradoInstruccion?: string ,
    gradoInstruccionLabel?: string,
    profesion?: number,
    profesionLabel?: string,
    oficioTexto?: string,

    //info detallada
    correoPrincipal?: string,
    correoSecundario?: string,
    numeroContactoPrincipal?: string,
    numeroContactoSecundario?: string,
    puebloIndigena?: string,
    puebloIndigenaLabel?: string,
    lenguaMaterna?: string ,
    lenguaMaternaLabel?: string,
    traductor?: number,
    poblacionAfroperuana?: number,
    personaDiscapacidad?: number,
    personaVIH?: number,
    trabajadoraHogar?: number,
    personaLgtbiq?: number,
    defensorDerechosHumanos?: number,
    personaMigrante?: number,
    victimaViolencia19802000?: number,
    funcionarioPublico?: number,
    personaPrivadaDeSuLibertad?: number,

    nombreMadre?:               string,
    apellidoPaternoMadre?:      string,
    apellidoMaternoMadre?:      string,
    nombrePadre?:               string,
    apellidoPaternoPadre?:      string,
    apellidoMaternoPadre?:      string,

} & PartesInvolucradasFormType;




