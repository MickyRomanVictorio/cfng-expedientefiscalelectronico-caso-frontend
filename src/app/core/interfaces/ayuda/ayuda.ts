export interface CategoriaDetalle {
  idCategoria: string,
  idCategoriaPadre: string,
  noCategoria: string, // titulo
  noCategoriaPadre: string,
  contenido: string;
  url: string;
  posicion: number;
  leido: string;
  valoracion: number;
  idTipoCategoria: number;
  tags: Tag[];
}

export interface CategoriaSimple {
  idCatergoria: string;
  noCategoria: string;
  idCategoriaPadre: string;
  idTipoCategoria: number;
}

export interface Tag {
  idTag: number;
  noTag: string;
}

export interface BusquedaRequest {
  busqueda: string;
  idTag: string;
  idCategoria: string;
  pagina: number;
}

export interface BusquedaResponse {
  idCategoria: string;
  idCategoriaPadre: string;
  noCategoria: string;
  noCategoriaPadre: string;
  idTipoCategoria: string;
  resumen: string;
  tags: Tag[];
}

