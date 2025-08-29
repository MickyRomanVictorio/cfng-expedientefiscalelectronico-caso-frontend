export const FILTRO_TIEMPO = {
  ULTIMOS_MESES: '1',
  TODO: '0'
};

export const MENSAJE = {
  SELECT_FISCAL_ASIGNADO: 'Debe seleccionar un fiscal asignado para realizar la reasignación',
  SELECT_TIPO_REASIGNACION: 'Debe seleccionar el tipo de reasignación para realizar la reasignación',
  SELECT_MINIMO_UN_CASO: 'Debe seleccionar al menos un caso para realizar la reasignación',
  SELECT_FISCAL_REASIGNAR: 'Debe seleccionar un fiscal a reasignar para realizar la reasignación',
  SELECT_MOTIVO_REASIGNACION: 'Debe ingresar el motivo para realizar la reasignación',
  SELECT_FECHA_INICIO: 'Debe seleccionar una fecha de inicio para la reasignación temporal',
  SELECT_FECHA_FIN: 'Debe seleccionar una fecha de fin para la reasignación temporal',
  ERROR_FECHA_INI_FIN: 'La fecha de inicio no puede ser mayor a la fecha de fin',
}

export const MENSAJE_CONFIRM_RESASIGNACION = `Por favor confirme la acción de reasignación de casos. Recuerde que el Fiscal inicial ya no tendrá acceso a los casos que serán reasignados; el sistema le enviará una alerta informando la acción.`;
export const SE_ASIGNO_CASO = 'Se asignó el caso correctamente';
export const SE_ASIGNO_CASOS = 'Se asignaron los casos correctamente';

export const HEADER_REASIGNACION = ['Número de caso', 'Etapa', 'Acto Procesal', 'Trámite', 'Fiscal Asignado', 'Fecha Ingreso', 'Fecha Asignación']
export const NOMBRE_ARCHIVO = 'Casos para reasignar'
export const TAMANIO_ARCHIVO = 1024;
export const LAPSO_TIEMPO = 4000;

export const OPCIONES_MENU = [
  { ID: 1, LABEL: 'Visor documental', ICONO: 'file-search-icon' },
  { ID: 2, LABEL: 'Detalles del caso', ICONO: 'file-search-icon' }
];

