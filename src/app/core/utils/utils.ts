import { BandejaTramite } from '@core/interfaces/provincial/bandeja-tramites/BandejaTramite';
import { etapaInfo } from '@constants/menu';
import { Expediente } from '@utils/expediente'
import { ETAPA_TRAMITE } from 'dist/ngx-cfng-core-lib';
import { Tab } from '@core/interfaces/comunes/tab';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


export const cleanEmptyFields = (object: Object) => {
  const request = Object.fromEntries(
    Object.entries(object).filter(
      ([_, valor]) => valor !== null && valor !== undefined && valor !== ''
    )
  );
  return request;
};

export const obtenerCasoHtml = (numeroCaso: string): string => {
  const caso = numeroCaso?.split('-');
  return `<span class="cfe-caso" style="white-space: nowrap">${caso[0]}-<span>${caso[1]}-${caso[2]}</span>-${caso[3]}</span>`;
};

export const obtenerRutaParaEtapa = (etapa: string): string => {
  return etapaInfo(etapa).path;
};
export const urlEditarTramite = (tramite: BandejaTramite) => {
  return `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(tramite.idEtapa)}/caso/${tramite.idCaso}/actoprocesal/${tramite.idActoTramiteCaso}`;
};

export function urlBase(idClasificadorExpediente: string, idEtapa: string, idCaso: string, flgConcluido: string): string {
  let urlEtapa;

  if (idClasificadorExpediente === '2') {
    urlEtapa = urlConsultaCuaderno(
      'incidental',
      {
        idEtapa: idEtapa,
        idCaso: idCaso,
        flgConcluido: flgConcluido,
      });
    /**} else if(idClasificadorExpediente === '3'){
     urlEtapa = urlConsultaCuadernoEjecucion({
     idEtapa: item.idEtapaInicial,
     idCaso: item.idCasoCuaderno,
     flgConcluido: item.flConcluido,
     });**/
  } else if (idClasificadorExpediente === '4') {
    urlEtapa = urlConsultaCuaderno(
      'extremo',
      {
        idEtapa: idEtapa,
        idCaso: idCaso,
        flgConcluido: flgConcluido,
      });
  } else if (idClasificadorExpediente === '5') {
    urlEtapa = urlConsultaPestanaApelacion('', idCaso);
  } else {
    urlEtapa = urlConsultaCasoFiscal({
      idEtapa: idEtapa,
      idCaso: idCaso,
      flgConcluido: flgConcluido
    });
  }
  return urlEtapa;
}
export function getEtiquetaConfig(caso: any) {
  const etiquetas: Record<string, { etiqueta: string; etiquetaColorNro: number }> = {
    '726': { etiqueta: 'C. Incidental N° ' + caso.nuCuaderno, etiquetaColorNro: 8 },
    '1493': { etiqueta: 'C. Extremos N° ' + caso.nuCuaderno, etiquetaColorNro: 6 },
    '1027': { etiqueta: '', etiquetaColorNro: 0 },
    '727': { etiqueta: '', etiquetaColorNro: 0 },
  };
  const config = etiquetas[caso.idTipoElevacion] || { etiqueta: '', etiquetaColorNro: 0 };
  return {
    etiquetaColorNro: config.etiqueta ? config.etiquetaColorNro : undefined,
    etiqueta: config.etiqueta || undefined,
    etiquetaColorNro2: 1,
    etiqueta2: 'Apelación N° ' + caso.nuApelacion,
  };
}
export function urlConsultaCasoFiscal(caso: { idEtapa: string, idCaso: string, flgConcluido?: string }): string {
  const { idEtapa, idCaso, flgConcluido = '0' } = caso;
  let urlEtapa = '';
  if (flgConcluido === '1') {
    urlEtapa = 'concluidos';
  } else {
    urlEtapa = etapaInfo(idEtapa).path;
  }
  return `/app/administracion-casos/consultar-casos-fiscales/${urlEtapa}/caso/${idCaso}`;
}

export function urlConsultaCuaderno(
  tipo: 'extremo' | 'incidental',
  caso: { idEtapa: string, idCaso: string, flgConcluido?: string }
): string {
  const { idEtapa, idCaso, flgConcluido = '0' } = caso;
  const urlEtapa = flgConcluido === '1' ? 'concluidos' : etapaInfo(idEtapa).path;
  return `/app/administracion-casos/consultar-casos-fiscales/${urlEtapa}/cuaderno-${tipo}/${idCaso}`;
}

export function urlConsultaPestanaApelacion(idTipoClasificadorExpediente: string, idCaso: string): string {
  const tipoApelacion = idTipoClasificadorExpediente === '021' ? 'apelacion-sentencia' : 'apelacion-auto';
  return `/app/administracion-casossuperior/consultar-casos-fiscales-elevados/${tipoApelacion}/cuaderno-incidental/${idCaso}`;
}

export const urlEtapa = (caso: { idEtapa: string, flgConcluido?: string }): string => {
  const { idEtapa, flgConcluido = '0' } = caso
  let urlEtapa = ''
  if (flgConcluido === '1') {
    urlEtapa = 'concluidos'
  } else {
    urlEtapa = etapaInfo(idEtapa).path
  }
  return urlEtapa
}

export function limmpiarTildes(str: string): string {
  return str.normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '');
}

export const noQuotes = (event: any): boolean => {
  const charCode = event.charCode || event.keyCode || 0;
  const key = String.fromCharCode(charCode);

  if (key === "'" || key === '"') {
    return false;
  }
  return true;
};

export const validOnlyNumbers = (event: any): boolean => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;
};

export const obtenerCodigoCasoHtml = (numeroCaso: string): string => {
  const caso = numeroCaso?.split('-');
  return `<div class="cfe-caso">${caso[0]}-${caso[1]}-<span>${caso[2]}-${caso[3]}</span></div>`;
};

export const formatDate = (date: Date): string => {
  return date
    ? date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '';
};

export const formatDatetime = (date: Date): string => {
  return date
    ? date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : '';
};

export const formatStringDatetime = (date: Date, hour: Date): string => {
  const dateFormatted = date
    ? date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '';
  const hourFormatted = hour
    ? `${hour.getHours().toString().padStart(2, '0')}:${hour
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
    : '';
  const format = `${dateFormatted} ${hourFormatted}`;
  return format;
};

export const formatTime = (hour: Date): string => {
  const hourFormatted = hour
    ? `${hour.getHours().toString().padStart(2, '0')}:${hour
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${hour.getSeconds().toString().padStart(2, '0')}`
    : '';
  return hourFormatted;
};
export const formatTimeHHMM = (hour: Date): string => {
  const hourFormatted = hour
    ? `${hour.getHours().toString().padStart(2, '0')}:${hour
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
    : '';

  return hourFormatted;
};
export const getValidString = (value: string | null): string | null => {
  return value !== null && value !== undefined
    ? String(value).trim() !== ''
      ? String(value).trim().toUpperCase()
      : null
    : null;
};

export const validText = (
  event: any,
  customPattern: any = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/
) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode == 8) {
    return true;
  }
  const pattern = customPattern;
  const character = String.fromCharCode(charCode);
  return pattern.test(character);
};

export const validOnlyNumberOnPaste = (event: any) => {
  const clipboardData = event.clipboardData || (window as any)['clipboardData'];
  const pastedText = clipboardData.getData('text');
  const numericText = pastedText.match(/\d+/g)?.join('');
  const newPastedText = numericText ? numericText : '';
  if (!/^[0-9]+$/.test(pastedText)) {
    event.preventDefault();
    const element = event.target as HTMLInputElement;
    if (element.isContentEditable) {
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(newPastedText));
      }
    } else {
      element.value = newPastedText;
      element.dispatchEvent(new Event('input'));
    }
  }
};

export const validOnlyTextOnPaste = (event: any) => {
  const clipboardData = event.clipboardData || (window as any)['clipboardData'];
  const pastedText = clipboardData.getData('text');
  const validText = pastedText.match(/[A-Za-zÁÉÍÓÚáéíóúñÑ ]+/g)?.join('');
  const newPastedText = validText ? validText : '';
  if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(pastedText)) {
    event.preventDefault();
    const element = event.target as HTMLInputElement;
    if (element.isContentEditable) {
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(newPastedText));
      }
    } else {
      element.value = newPastedText;
      element.dispatchEvent(new Event('input'));
    }
  }
};

export const formatDateText = (value: string): string => {
  const [date, time] = value.split(' ');
  const [hour, minute] = time.split(':');

  let formattedHour = Number(hour);
  let meridiem = 'AM';

  if (formattedHour >= 12) {
    formattedHour = formattedHour % 12;
    meridiem = 'PM';
  }

  if (formattedHour === 0) {
    formattedHour = 12;
  }

  return `${date} a las ${formattedHour
    .toString()
    .padStart(2, '0')}:${minute} ${meridiem}`;
};

export const getDateFromString = (value: string): Date | null => {
  if (value === null) return null;

  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  return date;
};

export const formatDateString = (value: String): string => {
  const [year, month, day] = value.split('-');
  const date = day + '/' + month + '/' + year;
  return date;
};

export const validateDateTime = (dateTimeString: string): boolean => {
  const [dateComponents, timeComponents] = dateTimeString.split(' ');
  const [day, month, year] = dateComponents.split('/');
  const [hours, minutes, seconds] = timeComponents.split(':');
  const selectedDateTime = new Date(
    +year,
    +month - 1,
    +day,
    +hours,
    +minutes,
    +seconds
  );
  const currentDateTime = new Date();
  return selectedDateTime <= currentDateTime;
};

function getCapitalized(text = '') {
  if (typeof text !== 'string') {
    return '';
  }
  const word = text.toLowerCase().split(' ');
  for (var i = 0; i < word.length; i++) {
    word[i] = word[i].charAt(0).toUpperCase() + word[i].slice(1);
  }
  return word.join(' ');
}

export function actualizarContadorInputTextArea(
  maximo: number,
  texto: string
): number {
  return 1000 - texto.length;
}


export function limpiarFormcontrol(control: any, array_validator: any) {
  control.clearValidators();
  control.setValidators(array_validator);
  control.updateValueAndValidity();
}

export function agruparPorLlave(data: any, key: string): string[] {
  return data[key] || ["-"];
}


export default {
  getCapitalized,
};

export const esStringNull = (value: string | null | undefined): boolean => {
  return value === undefined || value === null || value === '';
};

export const validOnlyNumberDrop = (event: DragEvent): void => {
  const data = event.dataTransfer?.getData('text');
  if (!/^\d+$/.test(data || '')) {
    event.preventDefault();
  }
}
export function validarEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}
export const validOnlyAlphanumeric = (event: KeyboardEvent): boolean => {
  const charCode = event.which ? event.which : event.keyCode;
  if (
    (charCode >= 48 && charCode <= 57) ||
    (charCode >= 65 && charCode <= 90) ||
    (charCode >= 97 && charCode <= 122) ||
    charCode === 8
  ) {
    return true;
  }

  return false;
};

export const validOnlyAlphanumericOnPaste = (event: ClipboardEvent) => {
  const clipboardData = event.clipboardData || (window as any)['clipboardData'];
  const pastedText = clipboardData.getData('text');

  const alphanumericText = pastedText.replace(/[^a-zA-Z0-9]/g, '');

  if (pastedText !== alphanumericText) {
    event.preventDefault();
    const element = event.target as HTMLInputElement;

    if (element.isContentEditable) {
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(alphanumericText));
      }
    } else {
      element.value = alphanumericText;
      element.dispatchEvent(new Event('input'));
    }
  }
};

export const validOnlyAlphanumericDrop = (event: DragEvent): void => {
  const data = event.dataTransfer?.getData('text');
  if (!/^[a-zA-Z0-9]+$/.test(data || '')) {
    event.preventDefault();
  }
};

export function formatearNumeroAmericano(value: number | string): string {
  let num = typeof value === 'string' ? convertirStringAmericanoANumero(value) : value;
  if (isNaN(num)) {
    throw new Error('El valor proporcionado no es un número válido.');
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function convertirStringAmericanoANumero(value: string): number {
  if (!value || value.trim() === '') {
    return NaN;
  }
  return parseFloat(value.replace(/,/g, ''));
}

export function evaluarTabPagos(tabs: Tab[], caso: Expediente) {
  const tabPagos = tabs.find((tab: Tab) => tab.titulo === 'Pagos')
  tabPagos!.oculto = !(
    (
      caso.flgPagos === '1'
    )
    &&
    (
      caso.idEtapa === ETAPA_TRAMITE.ETAPA_CALIFICACION ||
      caso.idEtapa === ETAPA_TRAMITE.ETAPA_PRELIMINAR ||
      caso.idEtapa === ETAPA_TRAMITE.ETAPA_PREPARATORIA ||
      caso.idEtapa === ETAPA_TRAMITE.ETAPA_INTERMEDIA ||
      caso.idEtapa === ETAPA_TRAMITE.ETAPA_JUZGAMIENTO ||
      caso.idEtapa === ETAPA_TRAMITE.ETAPA_EJECUCION_SENTENCIA ||
      caso.idEtapa === ETAPA_TRAMITE.ETAPA_INCOACION_PROCESO_INMEDIATO
    )
  )
}

export function esStringValido(valor: string | null | undefined): boolean {
  return valor !== undefined && valor !== null && valor.trim() !== '';
}

export function obtenerFiltroUltimoMeses(tipoFiltro: string): string {
  return tipoFiltro === '0' ? '1' : '0'
}

export function convertirFechaStringToDate(fecha: string): Date {
  const [dia, mes, anio] = fecha.split('/')
  return new Date(+anio, +mes - 1, +dia)
}

export function validarRangoMontoAmericano(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value !== null) {
      const monto = convertirStringAmericanoANumero(value);
      if (isNaN(monto) || monto <= min || monto > max) {
        return { validarRangoNumero: true };
      }
    }
    return null;
  };
}
