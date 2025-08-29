import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoFecha',
  standalone: true,
})
export class FormatoFechaPipe implements PipeTransform {
  private meses: string[] = [
    'Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.',
    'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'
  ];

  transform(fecha: string): string {
    const date = new Date(fecha);

    // Obtiene día, mes, año, hora y minutos
    const dia = date.getDate();
    const mes = this.meses[date.getMonth()];
    const anio = date.getFullYear();
    let horas = date.getHours();
    const minutos = date.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'p.m.' : 'a.m.';

    // Convierte a formato 12 horas
    horas = horas % 12 || 12;

    // Formatea la fecha
    return `${dia} ${mes} ${anio}, ${horas}:${minutos} ${ampm}`;
  }
}
