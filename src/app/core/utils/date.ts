import {FormGroup, ValidationErrors} from '@angular/forms';
import {CONSULTA_CASO_RANGO_FECHA} from 'ngx-cfng-core-lib';
import {format, getHours, getMinutes} from 'date-fns';
import {es} from 'date-fns/locale';
import dayjs from 'dayjs';
import { formatDate } from '@angular/common';

export const formatDateToAbbreviated = (input: string) => {
  if (input === '' || input === undefined) return '';
  const months: { [key: string]: string } = {
    '01': 'Ene.',
    '02': 'Feb.',
    '03': 'Mar.',
    '04': 'Abr.',
    '05': 'May.',
    '06': 'Jun.',
    '07': 'Jul.',
    '08': 'Ago.',
    '09': 'Sep.',
    '10': 'Oct.',
    '11': 'Nov.',
    '12': 'Dic.',
  };
  const [day, month, year] = input.split('/');
  const formattedMonth = months[month];
  return `${parseInt(day)} ${formattedMonth} ${year}`;
};

export const convertTo12HourFormat = (input: string): string => {
  if (input === '' || input === undefined) return '';
  const [hour, minutes] = input.split(':');
  const hourNum = parseInt(hour);
  const ampm = hourNum >= 12 ? 'p.m.' : 'a.m.';
  const hour12 = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
  return `${hour12}:${minutes} ${ampm}`;
};

export const convertTo24HourFormat = (input: string): string => {
  const [hours, minutes] = input.split(':').map(Number);
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
  if (hours === 0 && minutes < 60) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')} ${ampm}`;
  }
  let hours12 = hours % 12;
  hours12 = hours12 ? hours12 : 12;
  return `${hours12.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')} ${ampm}`;
};

export const obtenerFechaLetras = (fecha: Date): string => {
  const nombreDiaSemana = format(fecha, 'EEEE', { locale: es });
  const dia = format(fecha, 'd', { locale: es });
  const mes = format(fecha, 'MMMM', { locale: es });
  const anho = format(fecha, 'y', { locale: es });
  return `${nombreDiaSemana} ${dia} DE ${mes.toUpperCase()} DE ${anho}`?.toUpperCase();
};

export const obtenerHoraAMPM = (fecha: Date): string => {
  const hora = getHours(fecha);
  const minutos = getMinutes(fecha);
  const ampm = hora >= 12 ? 'P.M.' : 'A.M.';
  const hora12 = hora > 12 ? hora - 12 : hora === 0 ? 12 : hora;
  return `${hora12.toString().padStart(2, '0')}:${minutos
    .toString()
    .padStart(2, '0')} ${ampm}`;
};

export const getYYMMDDDashedToDDMMYYSlash = (dateStr: string) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-');
  console.log( " LUIS ", dateStr.split('-'), `${day}/${month}/${year}`, dateStr);
  return `${day}/${month}/${year}`;
};

export const obtenerFechaDDMMYYYY = (fecha: Date): string => {
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anho = fecha.getFullYear();
  return `${dia}/${mes}/${anho}`;
};

export const obtenerFechaTipoDate = (fecha: string): Date => {
  const partes = fecha.split('/');
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const anho = parseInt(partes[2], 10);
  return new Date(anho, mes, dia);
};

export const obtenerHoraHH24MI = (fecha: Date): string => {
  const horas = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
};

export const obtenerHoraTipoDate = (hora: string): Date => {
  const [horas, minutos] = hora
    .split(':')
    .map((partes) => parseInt(partes, 10));
  const today = new Date();
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    horas,
    minutos
  );
};

const getLeadingZero = (number: number) => {
  return `${number < 10 ? '0' : ''}${number}`;
};

export const getDDMMYYSlashToDDMMYYDashed = (date = null) => {
  const today = date ? new Date(date) : new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  return `${getLeadingZero(day)}-${getLeadingZero(month)}-${year}`;
};

export const calcularTiempoRestante = (fechaFinDetencion: string): string => {
  const fechaFinTimestamp = new Date(
    fechaFinDetencion?.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')
  ).getTime();
  const ahora = new Date().getTime();
  const tiempoRestanteMillis = fechaFinTimestamp - ahora;

  if (tiempoRestanteMillis <= 0) {
    return 'Completado';
  }

  const dias = Math.floor(tiempoRestanteMillis / (1000 * 60 * 60 * 24));
  const horas = Math.floor(
    (tiempoRestanteMillis % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutos = Math.floor(
    (tiempoRestanteMillis % (1000 * 60 * 60)) / (1000 * 60)
  );
  const segundos = Math.floor((tiempoRestanteMillis % (1000 * 60)) / 1000);

  let tiempoRestante = '';

  if (dias > 0) {
    tiempoRestante += `${dias}d`;
  }

  if (horas > 0 && tiempoRestante?.split(' ').length < 2) {
    tiempoRestante += ` ${horas}h`;
  }

  if (minutos > 0 && tiempoRestante?.trim()?.split(' ').length < 2) {
    tiempoRestante += ` ${minutos}m`;
  }

  if (segundos > 0 && tiempoRestante?.trim()?.split(' ').length < 2) {
    tiempoRestante += ` ${segundos}s`;
  }

  return `${tiempoRestante?.trim() || '0s'} faltantes`;
};

export const string2DateReniec = (fechaReniec: string): Date => {
  const [dia, mes, anio] = fechaReniec.split('/');
  return new Date(+anio, +mes - 1, +dia);
};

export const obtenerFechaHoraDDMMYYYYHHMMA = (fecha: Date): string => {
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anho = fecha.getFullYear();
  const horas = (fecha.getHours() % 12 || 12).toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  const ampm = fecha.getHours() >= 12 ? 'PM' : 'AM';
  return `${dia}/${mes}/${anho} ${horas}:${minutos} ${ampm}`;
};

export function dateTimeValidator(control: FormGroup): ValidationErrors | null {
  const dateControl = control.get('fechaLlamada');
  const timeControl = control.get('horaLlamada');

  if (dateControl && timeControl && dateControl.value && timeControl.value) {
    const date = new Date(dateControl.value);
    const time = new Date(timeControl.value);

    date.setHours(time.getHours());
    date.setMinutes(time.getMinutes());

    // Current datetime for comparison
    const currentDateTime = new Date();

    if (date > currentDateTime) {
      // If the combined datetime is in the future, return an error
      return { invalidDateTime: true };
    }
  }
  return null; // If validation passes

  const inputDate = new Date(control.value);
  const currentDate = new Date();

  console.log(inputDate, currentDate, inputDate > currentDate);

  if (inputDate > currentDate) {
    return { futureDate: true };
  }
  return null;
}

export const obtenerTiempoTranscurrido = (fechaInicial: Date): string => {
  let timeAgo = '';
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - fechaInicial.getTime();
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    timeAgo = `hace ${days} día(s)`;
  } else if (hours > 0) {
    timeAgo = `hace ${hours} hora(s)`;
  } else if (minutes > 0) {
    timeAgo = `hace ${minutes} minuto(s)`;
  } else if (seconds > 0) {
    timeAgo = `hace ${seconds} segundo(s)`;
  }
  return timeAgo;
};

/**
 * Valida el rango de fechas máximo 1 mes. Usado para los formularios reactivos
 *
 * @param group
 * @returns null | object
 */
export const validarRangoFechaForm = (group: FormGroup): null | object => {
  const fechaDesde = group.get('fechaDesde')?.value;
  const fechaHasta = group.get('fechaHasta')?.value;

  if (!fechaDesde || !fechaHasta) {
    return null; // No validar si una de las fechas no está definida
  }

  const inicio = new Date(fechaDesde);
  const fin = new Date(fechaHasta);
  const hoy = new Date();
  if (!(fin <= hoy)) {
    return { rangoFechaInvalidoMax: true };
  }

  // Calcular la diferencia en meses y días
  const diferenciaMeses =
    fin.getMonth() -
    inicio.getMonth() +
    (fin.getFullYear() - inicio.getFullYear()) * 12;
  const diferenciaDias = fin.getDate() - inicio.getDate();

  // Verificar si la diferencia es exactamente un mes o menos
  const rangoValido =
    (diferenciaMeses === 1 && diferenciaDias <= 0) ||
    (diferenciaMeses === 0 && diferenciaDias >= 0);

  return rangoValido ? null : { rangoFechaInvalido: true };
};

/**
 * Valida el rango de fechas máximo 6 meses. Usado para los formularios reactivos
 *
 * @param group
 * @returns null | object
 */
export const validarRangoUltimo6MesesForm = (
  group: FormGroup
): null | object => {
  const fechaDesde = group.get('fechaDesde')?.value;
  const fechaHasta = group.get('fechaHasta')?.value;

  if (!fechaDesde || !fechaHasta) {
    return null; // No validar si una de las fechas no está definida
  }

  const inicio = new Date(fechaDesde);
  const fin = new Date(fechaHasta);
  const hoy = new Date();
  if (!(fin <= hoy)) {
    return { rangoFechaInvalidoMax: true };
  }

  // Calcular la diferencia en meses y días
  let diferenciaMeses =
    fin.getMonth() -
    inicio.getMonth() +
    (fin.getFullYear() - inicio.getFullYear()) * 12;
  let diferenciaDias = fin.getDate() - inicio.getDate();

  // Ajustar la diferencia de días si es negativa
  if (diferenciaDias < 0) {
    diferenciaMeses -= 1;
    diferenciaDias += 30;
  }

  // Verificar si la diferencia es de 6 meses o menos y los días no exceden el rango
  const rangoValido =
    diferenciaMeses < 6 || (diferenciaMeses === 6 && diferenciaDias <= 0);

  return rangoValido ? null : { rangoFechaInvalido: true };
};

export function rangoFechaXDefecto(rangoMeses: number = CONSULTA_CASO_RANGO_FECHA) {
  const meses = rangoMeses;
  const fechaFin = new Date();
  const fechaInicio = new Date(fechaFin);
  const mesInicio = fechaInicio.getMonth();
  fechaInicio.setMonth(fechaFin.getMonth() - meses);

  // Ajuste para casos en los que restar meses cambie el año y cause un problema de desbordamiento
  if (fechaInicio.getMonth() !== (((mesInicio - meses) % 12) + 12) % 12) {
    fechaInicio.setDate(0); // Establece al último día del mes anterior
  }
  return {
    inicio: fechaInicio,
    fin: fechaFin,
  };
}

export function convertDateToDDMMYYYY(dateOriginal: Date | null, formatoFecha:string): String | null {
  if(formatoFecha || formatoFecha !== ''|| dateOriginal) {
    return dateOriginal ? dayjs(dateOriginal).format(formatoFecha) : null;
  }
  return null;
}
export function convertStringToDate(dateString: string | null, formatoFecha?:string): Date | null {
  if(formatoFecha || formatoFecha !== '') {
    return dateString ? dayjs(dateString, formatoFecha).toDate() : null;
  }
  return dateString ? dayjs(dateString).toDate() : null;
}

export function convertirDateHoraString(dateString: string | null): Date | null {
  const partes = dateString!.split(/[/ :]/);
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const anio = parseInt(partes[2], 10);
  const horas = parseInt(partes[3], 10);
  const minutos = parseInt(partes[4], 10);
  return  new Date(anio, mes, dia, horas, minutos);
}

export function formatearFecha_DDMMYYYY_HH24MI(fecha: string): string {
  if (!fecha) return ''
  const dateObj = new Date(fecha)
  const dd = String(dateObj.getDate()).padStart(2, '0')
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
  const yyyy = dateObj.getFullYear()
  const hh = String(dateObj.getHours()).padStart(2, '0')
  const mi = String(dateObj.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
}

/**
 * Devuelve la fecha en formato "dd/MM/yyyy HH:mm".
 * Si ya viene como string en ese formato, la retorna tal cual.
 * Si es un Date, la formatea en localidad "es-PE".
 *
 * @param fecha Fecha tipo string ya formateado o tipo Date
 * @returns Fecha en formato "dd/MM/yyyy HH:mm" o null si no es válida
 */
export function formatearFechaHoraLocal(fecha: string | Date | null): string | null {
  if (!fecha) return null;

  if (typeof fecha === 'string') {
    return fecha;
  }

  return formatDate(fecha, 'dd/MM/yyyy HH:mm', 'es-PE');
}

export function obtenerFechaHoraTipoDate(fechaStr: string | null | undefined): Date | null{
  if(fechaStr && fechaStr !== null && fechaStr !== ''){
      const [dia, mes, anioHora] = fechaStr.split('/');
      const [anio, horaMinuto] = anioHora.split(' ');
      const [hora, minuto] = horaMinuto.split(':');
      return new Date(
      parseInt(anio),
      parseInt(mes) - 1,
      parseInt(dia),
      parseInt(hora),
      parseInt(minuto)
    );
  }else{
    return null;
  }
   
};