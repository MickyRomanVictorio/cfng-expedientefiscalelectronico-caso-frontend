import { TipoAlerta } from "@core/types/efe/provincial/expediente/tipo-alerta.type";
import { Cuaderno } from "./cuaderno.interface";

export interface AlertaFecha {
  cuadernoIncidental: Cuaderno;
  tipoAlerta: TipoAlerta;
}
