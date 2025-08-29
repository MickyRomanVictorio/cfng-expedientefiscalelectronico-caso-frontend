import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'nombrePropio'
})
export class NombrePropioPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const minusculaExceptions = ['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'o', 'u'];
    const words = value.toLowerCase().split(' ');

    return words.map((word, index) => {
      if (index === 0 || !minusculaExceptions.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    }).join(' ');
  }
}
