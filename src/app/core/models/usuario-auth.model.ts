export interface UsuarioAuth {
  estado: string;
  ip: string;
  usuario: string;
  info: InfoUsuario;
  codDependencia: string;
  dependencia: string;
  codDespacho: string;
  sede: string;
  despacho: string;
  codCargo: string;
  codSede: string;
  cargo: string;
  codDistritoFiscal: string;
  distritoFiscal: string;
  dniFiscal: string;
  direccion: string;
  fiscal: string;
  correoFiscal: string | null;
  codJerarquia: string;
  codCategoria: string;
  codEspecialidad: string;
  ubigeo: string;
  distrito: string;
  correo: string | null;
  telefono: string;
  sistemas: Sistema[];
}

export interface InfoUsuario {
  apellidoPaterno: string;
  esPrimerLogin: boolean;
  codigoTipoDocumento: string;
  tipoDocumento: string;
  dni: string;
  nombres: string;
  apellidoMaterno: string;
}

export interface Sistema {
  codigo: string;
  opciones: string[];
  perfiles: (string | null)[];
}

export enum PerfilJerarquia {
  Provincial = '1',
  Superior = '2',
  Presidencia = '4',
}
