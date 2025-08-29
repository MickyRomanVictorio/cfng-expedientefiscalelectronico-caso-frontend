export interface MensajeFirma {
  idTipoAccion?: string,
  icono?: string,
  titulo: string,
  descripcion: string,
  textoBotonConfirmar?: string,
  textoBotonSegundoConfirmar?: string,
  textoBotonCancelar?: string,
  mostrarBotonCancelar?: string,
  mostrarBotonSegundoConfirmar?: string,
  accion?: string,
  accionSegundoConfirmar?: string,
}
