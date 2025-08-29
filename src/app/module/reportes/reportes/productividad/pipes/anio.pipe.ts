import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'anio',
  standalone: true,
})
export class AnioPipe implements PipeTransform {
  transform(fecha: string): string {
    const date = new Date(fecha);
    return date.getFullYear().toString(); // Devuelve el año como string
  }
}
