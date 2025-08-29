import { ContactoSujeto } from "./ContactoSujeto";

export interface OpcionesSujetoProcesalRequest {
  idTipoPueblo: number | null;
  idTipoLengua: number | null;

  correoPrincipal: string | null;
  correoSecundario: string | null;
  telefonoPrincipal: string | null;
  telefonoSecundario: string | null;

  flPoblacionAfroperuana: string | null;
  flPersonaConDiscapacidad: string | null;
  flPersonaPrivadaLibertad: string | null;
  flDefensorDdHh: string | null;
  flPersonaMigrante: string | null;
  flPersonaVictima8020: string | null;
  flFuncionarioPublico: string | null;
  flTraductor: string | null;
  flPersonaVihTbc: string | null;
  flTrabajadorHogar: string | null;
  flPersonaLgtbiq: string | null;
  observaciones: string | null;

  // contactosSujeto ?: ContactoSujeto[] | null;
}
