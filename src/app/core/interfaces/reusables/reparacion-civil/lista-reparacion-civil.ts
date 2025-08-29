export interface ListaReparacionCivil {
 idReparacionCivil:string;
 tipoReparacionCivil:string;
 codigoReparacionCivil:string;
 secuencia:number;
 idAcuerdosActa:string | null;
 pendienteRegistrar:boolean;
 lista:ListaReparacionCivilSujetos[];
}

export interface ListaReparacionCivilSujetos {
   nombreSujeto:string;
   tipoParticipante:string;
   salidaAlterna:string | null;
}
