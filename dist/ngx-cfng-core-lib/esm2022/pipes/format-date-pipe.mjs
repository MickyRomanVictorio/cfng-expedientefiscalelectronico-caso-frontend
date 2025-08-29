import { Pipe } from '@angular/core';
import { convertTo12HourFormat, formatDateToAbbreviated, convertTo24HourFormat, } from '../util/date-util';
import * as i0 from "@angular/core";
export class DateFormatPipe {
    transform(value, type = 'date') {
        let date = '';
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DateFormatPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: DateFormatPipe, isStandalone: true, name: "dateformat" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DateFormatPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'dateformat',
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LWRhdGUtcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jZm5nLWNvcmUtbGliL3BpcGVzL2Zvcm1hdC1kYXRlLXBpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFDcEQsT0FBTyxFQUNMLHFCQUFxQixFQUNyQix1QkFBdUIsRUFDdkIscUJBQXFCLEdBQ3RCLE1BQU0sbUJBQW1CLENBQUM7O0FBUTNCLE1BQU0sT0FBTyxjQUFjO0lBQ3pCLFNBQVMsQ0FBQyxLQUFhLEVBQUUsT0FBbUIsTUFBTTtRQUNoRCxJQUFJLElBQUksR0FBVyxFQUFFLENBQUM7UUFDdEIsUUFBUSxJQUFJLEVBQUUsQ0FBQztZQUNiLEtBQUssTUFBTTtnQkFDVCxJQUFJLEdBQUcsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU07WUFDUixLQUFLLE1BQU07Z0JBQ1QsSUFBSSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwQyxNQUFNO1lBQ1IsS0FBSyxRQUFRO2dCQUNYLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEMsTUFBTTtZQUNSO2dCQUNFLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7OEdBakJVLGNBQWM7NEdBQWQsY0FBYzs7MkZBQWQsY0FBYztrQkFKMUIsSUFBSTttQkFBQztvQkFDSixJQUFJLEVBQUUsWUFBWTtvQkFDbEIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgY29udmVydFRvMTJIb3VyRm9ybWF0LFxuICBmb3JtYXREYXRlVG9BYmJyZXZpYXRlZCxcbiAgY29udmVydFRvMjRIb3VyRm9ybWF0LFxufSBmcm9tICcuLi91dGlsL2RhdGUtdXRpbCc7XG5cbmV4cG9ydCB0eXBlIEZvcm1hdFR5cGUgPSAnZGF0ZScgfCAnaG91cicgfCAnaG91cjI0JztcblxuQFBpcGUoe1xuICBuYW1lOiAnZGF0ZWZvcm1hdCcsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIERhdGVGb3JtYXRQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogc3RyaW5nLCB0eXBlOiBGb3JtYXRUeXBlID0gJ2RhdGUnKTogc3RyaW5nIHtcbiAgICBsZXQgZGF0ZTogc3RyaW5nID0gJyc7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgZGF0ZSA9IGZvcm1hdERhdGVUb0FiYnJldmlhdGVkKHZhbHVlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdob3VyJzpcbiAgICAgICAgZGF0ZSA9IGNvbnZlcnRUbzEySG91ckZvcm1hdCh2YWx1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaG91cjI0JzpcbiAgICAgICAgZGF0ZSA9IGNvbnZlcnRUbzI0SG91ckZvcm1hdCh2YWx1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZTtcbiAgfVxufVxuIl19