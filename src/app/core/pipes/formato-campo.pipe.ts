import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoCampo',
  standalone: true,
})
export class formatoCampoPipe implements PipeTransform {
  transform(value: string): string {
    let texto = value;
    if (texto == '-') {
      return '';
    } else {
      return texto;
    }
  }
}
