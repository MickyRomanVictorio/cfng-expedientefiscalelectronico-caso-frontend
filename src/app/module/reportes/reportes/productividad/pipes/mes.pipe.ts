import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mes',
  standalone: true,

})
export class MesPipe implements PipeTransform {
  private meses: string[] = [
    'Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.',
    'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'
  ];

  transform(fecha: string): string {
    const date = new Date(fecha);
    const mesIndex = date.getMonth(); // Obtiene el índice del mes (0-11)
    return this.meses[mesIndex]; // Devuelve el nombre del mes
  }
}
