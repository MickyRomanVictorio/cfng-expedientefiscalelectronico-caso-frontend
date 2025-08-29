import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'capitalizar',
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // const palabras = value.split(' ');
    // const palabrasCapitalizadas = palabras.map((palabra) => {
    //   if (!palabra) {
    //     return '';
    //   }
    //   return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
    // });
    // return palabrasCapitalizadas.join(' ');

    //SÓLO LA PRIMERA LETRA DE LA PRIMERA PALABRA CON MAYÚSCULA
    const minuscula = value.toLowerCase();
    return minuscula.charAt(0).toUpperCase() + minuscula.slice(1);
  }
}
