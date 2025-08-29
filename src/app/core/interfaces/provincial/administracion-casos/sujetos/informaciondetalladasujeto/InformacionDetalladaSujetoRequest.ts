import { ContactosParentesco } from './ContactosParentesco';
import { OpcionesSujetoProcesalRequest } from './OpcionesSujetoProcesalRequest';
import { SeudonimosSujeto } from './SeudonimosSujeto';

export interface InformacionDetalladaSujetoRequest {
  idSujetoCaso: string;
  opcionesSujetoProcesal: OpcionesSujetoProcesalRequest;
  listaSeudonimos: SeudonimosSujeto[];
  contactosParentesco: ContactosParentesco[];
}




