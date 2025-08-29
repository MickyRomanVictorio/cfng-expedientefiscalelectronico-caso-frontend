export interface Deposito {
  idDepositoAcuerdoActa: string,
  idCuotasAcuerdoActa: string,
  idDocumento?: string,
  montoDeposito: number,
  numeroDeposito: string,
  fechaDeposito: string | null,
  fechaCreacion?: string,
  observaciones: string,
  archivoComprobante?: string,
}
