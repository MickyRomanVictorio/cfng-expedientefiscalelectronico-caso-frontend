export type DatosGeneralesRequest = {
    tipoDocumentoIdentidad: number,
    numeroDocumentoIdentidad: string,
    registrarDatosManual: boolean,
    nombres: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    correo: string,
    nroContacto: string,
    idDependenciaPolicial: string;
    fechaLlamada: Date,
    tipoDenuncia: number,
    idDenuncia?: string,
    sexo?: number
};


export type DatosGeneralesResponse = {
    idDenuncia: number;
    idCaso: string;
    numeroCaso: string;
    idDistritoFiscal: number;
    nombreDistritoFiscal: string;
    idEspecialidad: number;
    nombreEspecialidad: string;
    idFiscalia: number;
    nombreFiscalia: string;
    idDespacho: number;
    nombreDespacho: string;
    fechaRegistroCaso: string,
}


