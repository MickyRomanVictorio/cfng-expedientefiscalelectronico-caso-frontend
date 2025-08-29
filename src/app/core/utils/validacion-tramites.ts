import { AlertaFormulario } from '@core/interfaces/comunes/alerta-formulario.interface';

export const obtenerAlertasDeArchivo = (
  resultados: PromiseSettledResult<any>[]
): AlertaFormulario[] => {
  let alertaTramite: AlertaFormulario[] = [];
  resultados.forEach((resultado) => {
    if (resultado.status === 'rejected') {
      if (resultado.reason.url.includes('sujetosprocesales')) {
        alertaTramite.push({
          texto:
            'Este caso no cuenta con los sujetos procesales debidamente registrados.',
          urlRedireccion: `/app/administracion-casos/consultar-casos-fiscales/[ETAPA]/caso/[CASO]/sujeto`,
          descripcionUrlRedireccion: 'Ir a sujetos procesales',
        });
      }
      /**if (resultado.reason.url.includes('escritossinatender')) {
        const data = JSON.parse(resultado.reason.error);
        const escritosSinAtender: number = Number(data.message.split('::')[1]);
        const texto: string =
          escritosSinAtender === 1
            ? 'Se encontró <<1 escrito>> relacionado a este caso sin atender, por favor revíselo para poder realizar el trámite.'
            : `Se encontró <<${escritosSinAtender} escritos>> relacionados a este caso sin atender, por favor revísalos para poder realizar el trámite.`;
        alertaTramite.push({
          texto,
          //urlRedireccion: '/app/bandeja-tramites',
          urlRedireccion: '/app/documentos-ingresados', 
          descripcionUrlRedireccion: 'Revisar bandeja',
        });
      }**/
      if (resultado.reason.url.includes('delitostipificados')) {
        alertaTramite.push({
          texto:
            'Falta tipificar el <<delito>>, por favor revíselo para poder realizar el trámite.',
          urlRedireccion: `/app/administracion-casos/consultar-casos-fiscales/[ETAPA]/caso/[CASO]/sujeto`,
          descripcionUrlRedireccion: 'Ir a sujetos procesales',
        });
      }
      if (resultado.reason.url.includes('cargosnotificacionpendientes')) {
        alertaTramite.push({
          texto: 'Existen cargos de notificación pendientes de registrar',
          urlRedireccion: '/app/notificaciones',
          descripcionUrlRedireccion: 'Ir a generador',
        });
      }
      /**if (resultado.reason.url.includes('solicitudacumulacionporrevisar')) {
        alertaTramite.push({
          texto:
            'El caso actual tiene una solicitud de acumulación, resuelva esta solicitud',
          urlRedireccion:
            '/app/administracion-casos/derivaciones/recibidos/acumulado-por-revisar',
          descripcionUrlRedireccion:
            'Ir a bandeja de casos de acumulación por revisar',
        });
      }**/
    }
  });
  return alertaTramite;
};
