import { Pipe, PipeTransform } from '@angular/core';

const CAN_CEROS = 3;

@Pipe({
  name: 'numrow',
  standalone: true,
})
export class NumRowPipe implements PipeTransform {
  transform(
    row: number,
    param?: { page: number; perPage: number }
  ): string | null {
    if (!param) {
      return String(row).padStart(CAN_CEROS, '0');
    } else if (param) {
      if (param.page == 1) {
        return String(row).padStart(CAN_CEROS, '0');
      } else if (param?.page > 1) {
        const num = (param.page - 1) * param.perPage + row;
        return String(num).padStart(CAN_CEROS, '0');
      } else {
        return String(1).padStart(CAN_CEROS, '0');
      }
    }

    return null;
  }
}
