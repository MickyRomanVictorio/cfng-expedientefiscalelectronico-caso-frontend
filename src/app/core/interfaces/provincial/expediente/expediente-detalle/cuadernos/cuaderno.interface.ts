export interface Cuaderno {
  idCaso: string;
  codigoCaso: string;
  anioCaso: string;
  numeroCaso: string;
  secuencia: string;
  clasificadorExpediente: string;
  idTipoClasificadorExpediente: string;
  tipoClasificadorExpediente: string;
  etapa: string;
  fechaCreacion: string;
  horaCreacion: string;
  idActoTramiteCasoUltimo: string | null;
  ultimoTramite: string | null;
  numeroCuaderno: string;
  flagConcluido: boolean | null;
  flagApelacion: string;
  flagQueja: string;
  entidad: string;
  sujetosProcesales: SujetosProcesales[];
  pestaniaApelacion: PestaniaApelacion[];
  pestaniaApelacionMostrar: boolean;
}

interface SujetosProcesales {
  item: number;
  nombreCompleto: string;
  nombreCorto: string;
}

interface PestaniaApelacion {
  nombre: string;
  cantidad: number;
}
