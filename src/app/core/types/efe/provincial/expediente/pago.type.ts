import { FiltroListaPago } from "@core/interfaces/reusables/pagos/FiltroListaPago";


export const PAGOS = {
  MAXIMO_PESO_COMPROBANTE_MB:5,
  MAXIMO_TAMANHO_NOMBRE_COMPROBANTE:100
}  as const

export const CUOTAS = {
  PAGADO: 1,
  PENDIENTE:2,
  ATRASADO: 3,
}  as const

export const FILTRO_LISTA_PAGOS: FiltroListaPago[] = [
  { codigo:0,
    descripcion:'Todos',
    color: '',
    seleccionado: false
  },
  {
    codigo: 1,
    descripcion: 'Pagado',
    color: '#06A77D',
    seleccionado: false,
  },
  {
    codigo:3,
    descripcion: 'Vencido',
    color: '#C1292E',
    seleccionado: false,
  },
  {
    codigo:2,
    descripcion: 'Por pagar',
    color: '#666666',
    seleccionado: false,
  }
];
