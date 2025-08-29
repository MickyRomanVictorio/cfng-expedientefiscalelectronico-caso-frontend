export interface Plantilla {
  idPlantillaPersonalizada: number;
  nombrePlantillaPersonalizada: string;
  pesoArchivo?: number;
  idNode: string;
  codigoDespacho?: string;
  idActoTramiteEstado?: string;
  pathPlantilla?: string | undefined;
}

export interface PlantillaPersonalizada {
  idNode: string;
  nombrePlantillaPersonalizada: string;
  idPlantillaPersonalizada: number;
  pesoArchivo: number; // Usando `number` ya que en Java Double es un número
  idTipoDocumento: number;
  hashcode: string;
  idTipoExtensionArchivo: number;
  idActoTramiteEstado: string;
  directorioRuta: string;
  pathPlantilla: string;
  extensionArchivo: string;
  filenameTemp: string;
  oaId: number;
  codigoDespacho: string;
  idTipoEntidad: number;
  codigoEntidad: string;
}
