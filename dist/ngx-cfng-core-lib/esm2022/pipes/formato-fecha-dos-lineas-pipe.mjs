import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class formatoFechaPartesPipe {
    transform(value, args) {
        var arg1 = args[0];
        console.log('arg');
        console.log(value);
        if (value === null) {
            return '-';
        }
        else {
            let texto = value.split(' ');
            if (texto.length > 4 && arg1 === 'f') {
                return `${texto[0]} ${texto[1]} ${texto[2]} `;
            }
            if (texto.length > 4 && arg1 === 'h') {
                return ` ${texto[3]} ${texto[4]} `;
            }
            else {
                return value;
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: formatoFechaPartesPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: formatoFechaPartesPipe, isStandalone: true, name: "formatoFechaPartesPipe" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: formatoFechaPartesPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'formatoFechaPartesPipe',
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0by1mZWNoYS1kb3MtbGluZWFzLXBpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtY2ZuZy1jb3JlLWxpYi9waXBlcy9mb3JtYXRvLWZlY2hhLWRvcy1saW5lYXMtcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFpQixNQUFNLGVBQWUsQ0FBQzs7QUFNcEQsTUFBTSxPQUFPLHNCQUFzQjtJQUNqQyxTQUFTLENBQUMsS0FBYSxFQUFFLElBQVc7UUFDbEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRW5CLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQixJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNuQixPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3QixJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDckMsT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDaEQsQ0FBQztZQUNELElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNyQyxPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ3JDLENBQUM7aUJBQU0sQ0FBQztnQkFDTixPQUFPLEtBQUssQ0FBQztZQUNmLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQzs4R0FuQlUsc0JBQXNCOzRHQUF0QixzQkFBc0I7OzJGQUF0QixzQkFBc0I7a0JBSmxDLElBQUk7bUJBQUM7b0JBQ0osSUFBSSxFQUFFLHdCQUF3QjtvQkFDOUIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5AUGlwZSh7XG4gIG5hbWU6ICdmb3JtYXRvRmVjaGFQYXJ0ZXNQaXBlJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgZm9ybWF0b0ZlY2hhUGFydGVzUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZywgYXJnczogYW55W10pOiBzdHJpbmcge1xuICAgIHZhciBhcmcxID0gYXJnc1swXTtcblxuICAgIGNvbnNvbGUubG9nKCdhcmcnKTtcbiAgICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gJy0nO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgdGV4dG8gPSB2YWx1ZS5zcGxpdCgnICcpO1xuICAgICAgaWYgKHRleHRvLmxlbmd0aCA+IDQgJiYgYXJnMSA9PT0gJ2YnKSB7XG4gICAgICAgIHJldHVybiBgJHt0ZXh0b1swXX0gJHt0ZXh0b1sxXX0gJHt0ZXh0b1syXX0gYDtcbiAgICAgIH1cbiAgICAgIGlmICh0ZXh0by5sZW5ndGggPiA0ICYmIGFyZzEgPT09ICdoJykge1xuICAgICAgICByZXR1cm4gYCAke3RleHRvWzNdfSAke3RleHRvWzRdfSBgO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19