export type TipoPlazo = 'TODOS'|'DENTRO DEL PLAZO'|'PLAZO POR VENCER'|'PLAZO VENCIDO';
export type TipoCasoRevisar  = 0 | 1;
export interface CasosRecibidos {
  idBandejaDerivacion?: string;
  idCaso:            string;
  codigoCaso:        string;
  tipoPlazo:         TipoPlazo;
  parte:             string;
  tipoDerivacion:    string;
  remitentedenuncia: string;
  origen:            string;
  fechaResultado:    string;
  fechaDevolucion:    string;
  accionResultado:   string;
  idUsuarioDes:      string;
  tipoCasoRevisar:   string;
  fechaDerivacion: string;
  horaDerivacion: string;
  personaRemitente: string;
  codigoCasoAcumulado: string;
  idCasoAcumulado: string;
  horaResultado?: string;
}

