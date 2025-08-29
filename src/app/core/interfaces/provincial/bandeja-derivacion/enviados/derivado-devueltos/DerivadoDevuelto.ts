export interface DerivadoDevuelto {
  orden?: number;
  coCaso?: string;
  idCaso?: string;
  idBandejaDerivacion?: string;
  tipoDerivacion?: string;
  destino?: string;
  origen?: string;
  remitenteDenuncia?: string;
  tipoSujeto?: string;
  fechaDenuncia?: string;
  horaDenuncia?: string;
  fechaDerivacion?: string;
  horaDerivacion?: string;
  fechaDevolucion?: string;
  horaDevolucion?: string;
  fechaReversion?: string;//-
  horaReversion?: string;//-
  motivoReversion?: string;//-
  idEtapaInicial?: string;//
  flConcluido?: string;//
  idActoTramiteCaso?: string;//
  nomEtapa?: string;
  casoAcumulado?: string;
}
