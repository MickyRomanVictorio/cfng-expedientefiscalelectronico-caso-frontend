export const CONFIGURACIONES: {
  [key: number]: { min: number; max: number; alfanumerico: boolean };
} = {
  1: { min: 8, max: 8, alfanumerico: false },
  3: { min: 0, max: 0, alfanumerico: true },
  4: { min: 4, max: 12, alfanumerico: true },
  5: { min: 4, max: 12, alfanumerico: true },
  6: { min: 9, max: 9, alfanumerico: false },
  7: { min: 7, max: 7, alfanumerico: false },
  8: { min: 4, max: 15, alfanumerico: true },
  9: { min: 9, max: 9, alfanumerico: false },
  11: { min: 5, max: 12, alfanumerico: true },
  13: { min: 9, max: 9, alfanumerico: false },
  14: { min: 9, max: 9, alfanumerico: false },
};

/**
 * Obtiene la configuración para un ID específico.
 * @param id Identificador de configuración
 * @returns Configuración encontrada o un valor por defecto
 */
export function getConfiguracionTipoDocumento(id: number): {
  min: number;
  max: number;
  alfanumerico: boolean;
} {
  return CONFIGURACIONES[id] || { min: 0, max: 50, alfanumerico: true };
}
