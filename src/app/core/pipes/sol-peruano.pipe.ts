import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'solPeruano',
  standalone: true
})
export class SolPeruanoPipe implements PipeTransform {

  transform(value: number | string): string | null {
    if (value == null || value === '') {
      return null;
    }
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numberValue)) {
      return null;
    }
    return 'S/ ' + numberValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
}
