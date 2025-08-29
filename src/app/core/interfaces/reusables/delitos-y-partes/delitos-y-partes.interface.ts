export interface SujetoProcesal {
  item: number,
  id: string,
  tipo: string,
  codigoTipoDocumento: string,
  tipoDocumento: string,
  numeroDocumento: string,
  nombre: string,
  telefono: string,
  correo: string,
  delitos: string,
  tipoRespuesta: string,
  selection: string,
}

export interface Cuadernos {
  nro: number;
  idSujetoCaso: string;
  idCaso: string;
  idCasoPadre: string;
  coCaso: string;
  coCasoPadre: string;
  fechaCreacion: Date;
  tipoCuaderno: string;
  ultimoTramite: string;
  delitos: string;
}
