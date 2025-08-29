import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class tiempoSegundos {
    transform(value) {
        let tiempo = Number(value);
        if (tiempo >= 5 && tiempo <= 59) {
            return 'hace 5 segundos';
        }
        if (tiempo >= 60 && tiempo <= 3559) {
            return 'hace 1 minuto';
        }
        if (tiempo >= 3600 && tiempo <= 86359) {
            return 'hace 1 hora';
        }
        if (tiempo >= 86400 && tiempo <= 518359) {
            return 'hace 1 día';
        }
        if (tiempo >= 518400 && tiempo <= 604799) {
            return 'hace 6 días';
        }
        if (tiempo >= 604800 && tiempo <= 86400 * 30 - 1) {
            return 'hace 1 semana';
        }
        if (tiempo >= 86400 * 30) {
            return 'hace 1 mes';
        }
        else {
            return 'hace más de un mes';
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: tiempoSegundos, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: tiempoSegundos, isStandalone: true, name: "tiempoSegundos" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: tiempoSegundos, decorators: [{
            type: Pipe,
            args: [{
                    name: 'tiempoSegundos',
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGllbXBvLXBpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtY2ZuZy1jb3JlLWxpYi9waXBlcy90aWVtcG8tcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFpQixNQUFNLGVBQWUsQ0FBQzs7QUFNcEQsTUFBTSxPQUFPLGNBQWM7SUFDekIsU0FBUyxDQUFDLEtBQWE7UUFDckIsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNCLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxNQUFNLElBQUksRUFBRSxFQUFFLENBQUM7WUFDaEMsT0FBTyxpQkFBaUIsQ0FBQztRQUMzQixDQUFDO1FBQ0QsSUFBSSxNQUFNLElBQUksRUFBRSxJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNuQyxPQUFPLGVBQWUsQ0FBQztRQUN6QixDQUFDO1FBQ0QsSUFBSSxNQUFNLElBQUksSUFBSSxJQUFJLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUN0QyxPQUFPLGFBQWEsQ0FBQztRQUN2QixDQUFDO1FBQ0QsSUFBSSxNQUFNLElBQUksS0FBSyxJQUFJLE1BQU0sSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUN4QyxPQUFPLFlBQVksQ0FBQztRQUN0QixDQUFDO1FBQ0QsSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUN6QyxPQUFPLGFBQWEsQ0FBQztRQUN2QixDQUFDO1FBQ0QsSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ2pELE9BQU8sZUFBZSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxJQUFJLE1BQU0sSUFBSSxLQUFLLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDekIsT0FBTyxZQUFZLENBQUM7UUFDdEIsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLG9CQUFvQixDQUFDO1FBQzlCLENBQUM7SUFDSCxDQUFDOzhHQTFCVSxjQUFjOzRHQUFkLGNBQWM7OzJGQUFkLGNBQWM7a0JBSjFCLElBQUk7bUJBQUM7b0JBQ0osSUFBSSxFQUFFLGdCQUFnQjtvQkFDdEIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5AUGlwZSh7XG4gIG5hbWU6ICd0aWVtcG9TZWd1bmRvcycsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIHRpZW1wb1NlZ3VuZG9zIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgdGllbXBvID0gTnVtYmVyKHZhbHVlKTtcbiAgICBpZiAodGllbXBvID49IDUgJiYgdGllbXBvIDw9IDU5KSB7XG4gICAgICByZXR1cm4gJ2hhY2UgNSBzZWd1bmRvcyc7XG4gICAgfVxuICAgIGlmICh0aWVtcG8gPj0gNjAgJiYgdGllbXBvIDw9IDM1NTkpIHtcbiAgICAgIHJldHVybiAnaGFjZSAxIG1pbnV0byc7XG4gICAgfVxuICAgIGlmICh0aWVtcG8gPj0gMzYwMCAmJiB0aWVtcG8gPD0gODYzNTkpIHtcbiAgICAgIHJldHVybiAnaGFjZSAxIGhvcmEnO1xuICAgIH1cbiAgICBpZiAodGllbXBvID49IDg2NDAwICYmIHRpZW1wbyA8PSA1MTgzNTkpIHtcbiAgICAgIHJldHVybiAnaGFjZSAxIGTDrWEnO1xuICAgIH1cbiAgICBpZiAodGllbXBvID49IDUxODQwMCAmJiB0aWVtcG8gPD0gNjA0Nzk5KSB7XG4gICAgICByZXR1cm4gJ2hhY2UgNiBkw61hcyc7XG4gICAgfVxuICAgIGlmICh0aWVtcG8gPj0gNjA0ODAwICYmIHRpZW1wbyA8PSA4NjQwMCAqIDMwIC0gMSkge1xuICAgICAgcmV0dXJuICdoYWNlIDEgc2VtYW5hJztcbiAgICB9XG4gICAgaWYgKHRpZW1wbyA+PSA4NjQwMCAqIDMwKSB7XG4gICAgICByZXR1cm4gJ2hhY2UgMSBtZXMnO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ2hhY2UgbcOhcyBkZSB1biBtZXMnO1xuICAgIH1cbiAgfVxufVxuIl19