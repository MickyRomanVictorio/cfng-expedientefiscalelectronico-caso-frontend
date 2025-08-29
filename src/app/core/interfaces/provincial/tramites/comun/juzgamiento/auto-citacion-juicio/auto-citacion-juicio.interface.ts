import { AgendaNotificacionInterface } from "@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface";

export interface AutoCitacionJuicio {
  idActoTramiteCaso: string,
  fechaNotificacion: string,
  codigoCuadernoPrueba: string,
  incorporaCuadernoPrueba: boolean,
  observacion: string,
  agendasMultiples: AgendaNotificacionInterface[]
}
