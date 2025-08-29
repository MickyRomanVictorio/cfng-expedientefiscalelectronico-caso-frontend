import { Pipe, PipeTransform } from '@angular/core';
import {
  convertTo12HourFormat,
  formatDateToAbbreviated,
  convertTo24HourFormat,
} from '@core/utils/date';

export type FormatType = 'date' | 'hour' | 'hour24';

@Pipe({
  name: 'dateformat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string, type: FormatType = 'date'): string {
    let date: string = '';
    switch (type) {
      case 'date':
        date = formatDateToAbbreviated(value);
        break;
      case 'hour':
        date = convertTo12HourFormat(value);
        break;
      case 'hour24':
        date = convertTo24HourFormat(value);
        break;
      default:
        return value;
    }
    return date;
  }
}
