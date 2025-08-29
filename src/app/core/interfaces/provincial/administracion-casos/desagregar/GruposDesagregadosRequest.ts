import { Delitos } from "./DelitosPartes";

export interface GruposDesagregadosRequest {
  numeroGrupo: number,
  nombreGrupo: string,
  numeroDocumento: string,
  numeroCaso: string,
  idCaso: string | null,
  idSujetoCaso: string,
  idActoTramiteCaso:string,
  delitos: Delitos[]
}
