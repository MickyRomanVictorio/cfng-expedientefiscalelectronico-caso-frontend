export interface TokenSession {
  ip: string;
  usuario: UsuarioToken;
}
export interface UsuarioToken {
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
  correoFiscal: string;
  codJerarquia: string;
  codCategoria: string;
  codEspecialidad: string;
  ubigeo: string;
  distrito: string;
  correo: string;
  telefono: string;
  sistemas: SistemaUsuario[];
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

export interface SistemaUsuario {
  codigo: string;
  opciones: string[];
  perfiles: string[];
}
