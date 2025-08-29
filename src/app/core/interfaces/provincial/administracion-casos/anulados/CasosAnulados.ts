export interface CasosAnulados {
  nroCaso: string,
  idCaso: string,
  idOrigen: number,
  origen: string,
  idTipoRemitente: number,
  tipoRemitente: string,
  nombreRemitente: string,
  telefono: string,
  correo: string,
  fechaIngreso: string,
  horaIngreso: string,
  fechaAnulacion: string,
  horaAnulacion: string,
  cantidadDelitosPartes: number,
  flagAnulado: number,
  motivoAnulado: string,
  leido: boolean,
}

export function sortCasosAnuladosByFeAnulacion(ca1: CasosAnulados, ca2: CasosAnulados) {
  //Parsear las fechas
  const fecha1 = new Date(ca1.fechaAnulacion);
  const fecha2 = new Date(ca2.fechaAnulacion)

  //Ordenamos de la fecha de anulacion mas reciente a la más antigua
  if (fecha1 > fecha2) {
    return -1;
  } else if (fecha1 < fecha2) {
    return 1;
  } else {
    return 0;
  }
}
