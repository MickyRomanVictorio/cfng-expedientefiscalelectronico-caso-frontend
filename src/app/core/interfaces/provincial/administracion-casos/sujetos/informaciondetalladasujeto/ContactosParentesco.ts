export interface ContactosParentesco {
    idSujetoCaso: string;
    idVinculoSujeto: string;
    idSujeto: string;
    idPersonaVinculo: string;
    idTipoVinculo:number;
    noTipoVinculo:string;
    noCiudadano:string;
    apPaterno:string;
    apMaterno:string;
    tiSexo:string;
    idTipoDocIdentidad:number;
    noTipoDocIdentidad:string;
    nuDocumento:string;
    idPersona:string;
    contactosPersona:string;
}


export interface ContactoParentescoForm {
    idPersona: string;
    registrosManuales: string;
    parentesco: number;
    tipoDocumento: number;
    numeroDocumento: string;
    nombresParentesco: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    rbSexo: string;
    celularPrincipalParentesco: string;
    idCelularPrincipalParentesco: string;
    celularSecundarioParentesco: string;
    idCelularSecundarioParentesco: string;
    celularSecundarioOpParentesco: string;
    idCelularSecundarioOpParentesco: string;
    correoPrincipalParentesco: string;
    idCorreoPrincipalParentesco: string;
    correoSecundarioParentesco: string;
    idCorreoSecundarioParentesco: string;
    telefonoPrincipalParentesco: string;
    idTelefonoPrincipalParentesco: string;
    telefonoSecundarioParentesco:string;
    idTelefonoSecundarioParentesco:string;
    telefonoSecundarioOpParentesco: string;
    idTelefonoSecundarioOpParentesco: string;
    casillaElectronicaPrincipalParentesco: string;
    idCasillaElectronicaPrincipalParentesco: string;
    botonBuscarDni: string;
    valido: boolean;
}