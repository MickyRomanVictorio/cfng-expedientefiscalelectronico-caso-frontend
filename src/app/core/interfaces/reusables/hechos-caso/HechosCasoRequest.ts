export interface HechosCasoRequest {

  idHecho: string;
  idHechoHistorial: string|null;
  nombre: string;
  fecha: string;
  hora: string;
  descripcion: string;
  ubigeo: string;
  latitud: string;
  longitud: string;
  direccion: string;
  referenciaDireccion: string;
  usuarioModificacion: string|null;
  idCaso: string|null;

}
