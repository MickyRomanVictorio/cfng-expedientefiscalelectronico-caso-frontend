export interface CasoPorAsignar {
  id: number,
  plazo: string,
  numeroCaso: string,
  origen: string,
  tipoRemitente: string,
  remitente: string,
  telefono: string,
  correo: string,
  fechaIngreso: string,
  horaIngreso: string,
  cantidadPartes: number,
  leido: boolean,
  semaforoNro: number,
  semaforoColor: string,
  semaforoTiempo: string,
}

export interface FiscalPorAsignados {
  idFiscal: string,
  nombreCompleto: string,
  casosAsignados: string,
  codDespacho: string,
  codEntidad: string
}
