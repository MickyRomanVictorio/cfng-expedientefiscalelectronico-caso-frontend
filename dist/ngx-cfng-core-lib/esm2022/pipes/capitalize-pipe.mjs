import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class CapitalizePipe {
    transform(value) {
        if (!value)
            return '';
        const palabras = value.split(' ');
        const palabrasCapitalizadas = palabras.map((palabra) => {
            if (!palabra) {
                return '';
            }
            return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
        });
        return palabrasCapitalizadas.join(' ');
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: CapitalizePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: CapitalizePipe, isStandalone: true, name: "capitalizar" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: CapitalizePipe, decorators: [{
            type: Pipe,
            args: [{
                    standalone: true,
                    name: 'capitalizar',
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwaXRhbGl6ZS1waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWNmbmctY29yZS1saWIvcGlwZXMvY2FwaXRhbGl6ZS1waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDOztBQU1wRCxNQUFNLE9BQU8sY0FBYztJQUN6QixTQUFTLENBQUMsS0FBYTtRQUNyQixJQUFJLENBQUMsS0FBSztZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRXRCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEMsTUFBTSxxQkFBcUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDckQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNiLE9BQU8sRUFBRSxDQUFDO1lBQ1osQ0FBQztZQUNELE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzFFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekMsQ0FBQzs4R0FaVSxjQUFjOzRHQUFkLGNBQWM7OzJGQUFkLGNBQWM7a0JBSjFCLElBQUk7bUJBQUM7b0JBQ0osVUFBVSxFQUFFLElBQUk7b0JBQ2hCLElBQUksRUFBRSxhQUFhO2lCQUNwQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQFBpcGUoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBuYW1lOiAnY2FwaXRhbGl6YXInLFxufSlcbmV4cG9ydCBjbGFzcyBDYXBpdGFsaXplUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnO1xuXG4gICAgY29uc3QgcGFsYWJyYXMgPSB2YWx1ZS5zcGxpdCgnICcpO1xuICAgIGNvbnN0IHBhbGFicmFzQ2FwaXRhbGl6YWRhcyA9IHBhbGFicmFzLm1hcCgocGFsYWJyYSkgPT4ge1xuICAgICAgaWYgKCFwYWxhYnJhKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYWxhYnJhLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGFsYWJyYS5zbGljZSgxKS50b0xvd2VyQ2FzZSgpO1xuICAgIH0pO1xuICAgIHJldHVybiBwYWxhYnJhc0NhcGl0YWxpemFkYXMuam9pbignICcpO1xuICB9XG59XG4iXX0=