import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoSegundos',
  standalone: true,
})
export class tiempoSegundos implements PipeTransform {
  transform(value: string): string {
    let tiempo: number;
    let fecha: Date;
    try {
      fecha = new Date(value.replace(/\[.*\]/g, ''));
    } catch (error) {
      console.error('Error al parsear la fecha:', error);
      return 'mas de un mes';
    }

    tiempo = Math.floor((Date.now() - fecha.getTime()) / 1000);

    if (tiempo < 5) {
      return 'pocos segundos';
    } else if (tiempo < 60) {
      return `${tiempo} segundos`;
    } else if (tiempo < 3600) {
      const minutos = Math.floor(tiempo / 60);
      return `${minutos} minuto${minutos > 1 ? 's' : ''}`;
    } else if (tiempo < 86400) {
      const horas = Math.floor(tiempo / 3600);
      return `${horas} hora${horas > 1 ? 's' : ''}`;
    } else if (tiempo < 604800) {
      const dias = Math.floor(tiempo / 86400);
      return `${dias} día${dias > 1 ? 's' : ''}`;
    } else if (tiempo < 2592000) {
      const semanas = Math.floor(tiempo / 604800);
      return `${semanas} semana${semanas > 1 ? 's' : ''}`;
    } else {
      const meses = Math.floor(tiempo / 2592000);
      return `${meses} mes${meses > 1 ? 'es' : ''}`;
    }
  }
}


@Pipe({
  name: 'textoTiempoSegundos',
  standalone: true,
})
export class textoTiempoSegundos implements PipeTransform {
  transform(text: string, fechaString: string): string {
    if (!text) return '';

    let tiempo: number;
    let fecha: Date;
    let tiempoTexto: string;

    try {
      fecha = new Date(fechaString.replace(/\[.*\]/g, ''));
    } catch (error) {
      console.error('Error al parsear la fecha:', error);
      return text.replace(/{tiempo}/g, 'mas de un mes');
    }

    tiempo = Math.floor((Date.now() - fecha.getTime()) / 1000);

    if (tiempo < 5) {
      tiempoTexto = 'pocos segundos';
    } else if (tiempo < 60) {
      tiempoTexto = `${tiempo} segundos`;
    } else if (tiempo < 3600) {
      const minutos = Math.floor(tiempo / 60);
      tiempoTexto = `${minutos} minuto${minutos > 1 ? 's' : ''}`;
    } else if (tiempo < 86400) {
      const horas = Math.floor(tiempo / 3600);
      tiempoTexto = `${horas} hora${horas > 1 ? 's' : ''}`;
    } else if (tiempo < 604800) {
      const dias = Math.floor(tiempo / 86400);
      tiempoTexto = `${dias} día${dias > 1 ? 's' : ''}`;
    } else if (tiempo < 2592000) {
      const semanas = Math.floor(tiempo / 604800);
      tiempoTexto = `${semanas} semana${semanas > 1 ? 's' : ''}`;
    } else {
      const meses = Math.floor(tiempo / 2592000);
      tiempoTexto = `${meses} mes${meses > 1 ? 'es' : ''}`;
    }
    return text.replace(/{tiempo}/g, tiempoTexto);
  }
}

