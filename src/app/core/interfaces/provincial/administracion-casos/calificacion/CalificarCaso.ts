import { Plazo } from "@core/interfaces/comunes/casosFiscales";

export interface CalificarCaso {
     numeroCaso?: string;
     coCaso: string;
     idCaso?: string;
     numExpediente?: string;
     fechaInicio?: Date;
     fechaFin?: Date;
     fechaActual?: Date;
     idActoTramiteCasoUltimo?: string;
     idEtapa?: string;
     noEtapa?: string;
     noActoProcesal?: string;
     noTramite?: string;
     nombreFiscal?: string;
     delitos?: string;

     idJerarquia?: string;

     idEspecialidad?: string;

     idTipoEspecialidad?: string;

     idTipoProceso?: string;
     idTipoProcesoEtapa?: string;

     flgCuaderno?: string;

     idTipoCuaderno?: number;

     flgCarpeta?: string;

     idActoTramiteUltimo?: string;

     idEstadoRegistro?: string;

     estadoRegistro?: string;
     plazos?: Plazo[];
}
