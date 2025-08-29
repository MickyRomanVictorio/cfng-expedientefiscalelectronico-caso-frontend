import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numeroExpediente',
  standalone: true
})
export class NumeroExpedientePipe implements PipeTransform {

  transform(value: string): string {
    if (!value || value.length < 20) return value;
    return `${value.substring(0, 5)}-${value.substring(5, 9)}-${value.substring(9, 10)}-${value.substring(10, 14)}-${value.substring(14, 16)}-${value.substring(16, 18)}-${value.substring(18, 20)}`;
  }

}
