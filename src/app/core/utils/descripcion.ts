import {MODALIDAD_CITACION} from 'ngx-cfng-core-lib';
import {obtenerFechaLetras, obtenerHoraAMPM} from './date';
import {Orden} from '@core/interfaces/notificaciones/crear-orden/crear-orden.interface';
import {EditarCedula} from '@core/interfaces/notificaciones/editar-cedula/editar-cedula.interface';
import {Finalidad} from '@core/interfaces/notificaciones/editar-cedula/finalidad.interface';
import {CamaraGesell} from '@core/interfaces/notificaciones/editar-cedula/camaras-gesell.interface';
import {SujetoProcesal} from '@core/interfaces/notificaciones/editar-cedula/sujeto-procesal.interface';

export const obtenerDescripcionNotificacion = (
  finalidad: Finalidad,
  informacionOrden: Orden
): string => {
  const descripcionCedula = finalidad.detalle
    .replaceAll(
      '[TIPO DE DOCUMENTO]',
      informacionOrden.descripcionTipoDocumentoOrden.toUpperCase()
    )
    .replaceAll(
      '[NRO. DE DOCUMENTO]',
      `N° ${informacionOrden.numeroDocumentoOrden}`
    )
    .replaceAll(
      '[FECHA EMISIÓN DOCUMENTO]',
      informacionOrden.fechaEmisionDocumentoOrden
    )
    .replaceAll(
      '[NOMBRES Y APELLIDOS DEL EMISOR]',
      informacionOrden.nombreFiscalOrden.toUpperCase()
    )
    .replaceAll(
      '[DESPACHO FISCAL + FISCALÍA]',
      `${informacionOrden.despachoFiscalOrden.toUpperCase()} - ${informacionOrden.fiscaliaOrden.toUpperCase()}`
    )
    .replaceAll('[FINALIDAD]', finalidad.nombre.toUpperCase());
  return descripcionCedula;
};

export const obtenerDescripcionModalidadPresencialVirtual = (
  descripcionPlantilla: string,
  cedula: EditarCedula,
  informacionOrden: Orden
): string => {
  let descripcionCedula: string = descripcionPlantilla;

  if (cedula.modalidadCitacion === MODALIDAD_CITACION.PRESENCIAL) {
    const direccionCitacion = cedula.direccionCitacion
      ? cedula.direccionCitacion?.toUpperCase()
      : '';
    const referenciaCitacion = cedula.referenciaCitacion
      ? `, referencia ${cedula.referenciaCitacion?.toUpperCase()}`
      : '';
    descripcionCedula = descripcionCedula
      .replace(/\{V\}([^{}]+)\{V\}/g, '')
      .replaceAll('{P}', '')
      .replace(
        '[NOMBRE DEL DESPACHO FISCAL + NOMBRE DE LA FISCALÍA]',
        `${informacionOrden.despachoFiscalOrden.toUpperCase()} - ${informacionOrden.fiscaliaOrden.toUpperCase()}`
      )
      .replace(
        '[DIRECCIÓN DE LA CITACIÓN + REFERENCIA]',
        `${direccionCitacion}${referenciaCitacion}` ||
          '[DIRECCIÓN DE LA CITACIÓN + REFERENCIA]'
      );
  }

  if (cedula.modalidadCitacion === MODALIDAD_CITACION.VIRTUAL) {
    descripcionCedula = descripcionCedula
      .replace(/\{P\}([^{}]+)\{P\}/g, '')
      .replaceAll('{V}', '')
      .replace(
        '[DIRECCIÓN URL]',
        cedula.direccionUrlCitacion?.toLocaleLowerCase() || '[DIRECCIÓN URL]'
      );
  }

  return descripcionCedula;
};

export const obtenerDescripcionGesell = (
  descripcionPlantilla: string,
  cedula: EditarCedula,
  agraviados: SujetoProcesal[],
  camarasGesell: CamaraGesell[]
): string => {
  let descripcionCedula: string = descripcionPlantilla;
  let inicialesAgraviado: string = '[INICIALES DEL AGRAVIADO]';
  let camaraGesellNombre: string = '[CÁMARA GESELL]';
  let camaraGesellDireccion: string = '[DIRECCIÓN DE LA CÁMARA GESELL]';

  if (cedula.agraviadoCitacion !== null) {
    let agraviadoSeleccionado = agraviados.find(
      (agraviado) => agraviado.idSujetoCaso === cedula.agraviadoCitacion
    );
    if (agraviadoSeleccionado !== undefined) {
      inicialesAgraviado = obtenerIniciales(agraviadoSeleccionado.nombreSujeto);
    }
  }

  if (cedula.camaraGesellCitacion !== null) {
    let camaraGesellSeleccionada = camarasGesell.find(
      (camara) => camara.id === cedula.camaraGesellCitacion
    );
    if (camaraGesellSeleccionada !== undefined) {
      camaraGesellNombre = camaraGesellSeleccionada.nombre?.toUpperCase();
      camaraGesellDireccion = camaraGesellSeleccionada.direccion?.toUpperCase();
    }
  }

  descripcionCedula = descripcionCedula
    .replace('[INICIALES DEL AGRAVIADO]', inicialesAgraviado)
    .replace('[CÁMARA GESELL]', camaraGesellNombre)
    .replace('[DIRECCIÓN DE LA CÁMARA GESELL]', camaraGesellDireccion);

  return descripcionCedula;
};

export const obtenerDescripcionAudienciaConciliacion = (
  descripcionPlantilla: string,
  cedula: EditarCedula,
  informacionOrden: Orden
): string => {
  let descripcionCedula = obtenerDescripcionModalidadPresencialVirtual(
    descripcionPlantilla,
    cedula,
    informacionOrden
  ).replace(
    '[MOTIVO DE CONCILIACIÓN]',
    cedula.motivoConciliacionCitacion?.toUpperCase() ||
      '[MOTIVO DE CONCILIACIÓN]'
  );
  return descripcionCedula;
};

export const obtenerDescripcionCitacionPreexistencia = (
  descripcionPlantilla: string,
  cedula: EditarCedula,
  informacionOrden: Orden
): string => {
  let descripcionCedula = descripcionPlantilla
    .replace(
      '[DOCUMENTO A RECIBIR]',
      cedula.documentoARecibir?.toUpperCase() || '[DOCUMENTO A RECIBIR]'
    )
    .replace(
      '[DÍAS HÁBILES]',
      cedula.diasHabiles?.toUpperCase() || '[DÍAS HÁBILES]'
    )
    .replace(
      '[NOMBRE DEL DESPACHO FISCAL + NOMBRE DE LA FISCALÍA]',
      `${informacionOrden.despachoFiscalOrden.toUpperCase()} - ${informacionOrden.fiscaliaOrden.toUpperCase()}`
    )
    .replace(
      '[DIRECCIÓN DEL DESPACHO FISCAL]',
      `${informacionOrden.direccionDespachoOrden.toUpperCase()}`
    );
  return descripcionCedula;
};

export const obtenerDescripcionCitacion = (
  finalidad: Finalidad,
  descripcionPlantilla: string,
  cedula: EditarCedula,
  informacionOrden: Orden
): string => {
  let descripcionCedula: string = descripcionPlantilla
    .replace(
      '[FECHA DE CITACIÓN]',
      cedula.fechaCitacion
        ? obtenerFechaLetras(cedula.fechaCitacion)
        : '[FECHA DE CITACIÓN]'
    )
    .replace(
      '[HORA DE CITACIÓN]',
      cedula.horaCitacion
        ? obtenerHoraAMPM(cedula.horaCitacion)
        : '[HORA DE CITACIÓN]'
    )
    .replace('[FINALIDAD]', finalidad.nombre.toUpperCase())
    .replace(
      '[TELÉFONO DEL DESPACHO FISCAL]',
      informacionOrden.telefonoDespachoOrden
    )
    .replace(
      '[ANEXO DEL DESPACHO FISCAL]',
      informacionOrden.anexoDespachoOrden
    );
  return descripcionCedula;
};

const obtenerIniciales = (nombreCompleto: string): string => {
  const palabras = nombreCompleto.split(' ');
  const iniciales = palabras
    .map((palabra) => palabra[0].toUpperCase())
    .join('.');
  return iniciales;
};
