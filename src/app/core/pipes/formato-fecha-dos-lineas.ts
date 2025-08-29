import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoFechaPartesPipe',
  standalone: true,
})
export class formatoFechaPartesPipe implements PipeTransform {
  transform(value: string, args: any[]): string {
    var arg1 = args[0];

    console.log('arg');
    console.log(value);
    if (value === null) {
      return '-';
    } else {
      let texto = value.split(' ');
      if (texto.length > 4 && arg1 === 'f') {
        return `${texto[0]} ${texto[1]} ${texto[2]} `;
      }
      if (texto.length > 4 && arg1 === 'h') {
        return ` ${texto[3]} ${texto[4]} `;
      } else {
        return value;
      }
    }
  }
}
