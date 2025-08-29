import {DetalleCuota} from "@interfaces/provincial/administracion-casos/gestionar-pagos/detalle-cuota.interface";

export interface Cuota {
  deudaTotal?: number,
  pagadoTotal?: number,
  pendienteTotal?: number,
  detalles?: DetalleCuota[],
}
