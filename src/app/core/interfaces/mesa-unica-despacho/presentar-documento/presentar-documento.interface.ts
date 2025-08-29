import { DocumentoEscritoInterface } from "./documento-escrito.interface";
import { MovimientoInterface } from "./movimiento.interface";
import { RemitenteInterface } from "./remitente.interface";
import { ReporteInterface } from "./reporte.interface";

export interface PresentarDocumentoInterface {
    codigoUsuario?: string,
    idTipoOrigen?: number,
    remitente? : RemitenteInterface,
    movimiento? : MovimientoInterface,
    documentoEscrito? : DocumentoEscritoInterface,
    reporte? : ReporteInterface,
}
  