import { Injectable } from '@angular/core';
import { CDN } from "../environments/environment";
import * as i0 from "@angular/core";
export class ImageAsset {
    obtenerRutaImageWithExtension(name) {
        return `${CDN.CDN_IMAGES}/${name}`;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ImageAsset, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ImageAsset, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ImageAsset, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UtYXNzZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtY2ZuZy1jb3JlLWxpYi9hc3NldHMvaW1hZ2UtYXNzZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7O0FBR2xELE1BQU0sT0FBTyxVQUFVO0lBQ2QsNkJBQTZCLENBQUMsSUFBWTtRQUMvQyxPQUFPLEdBQUcsR0FBRyxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNyQyxDQUFDOzhHQUhVLFVBQVU7a0hBQVYsVUFBVSxjQURHLE1BQU07OzJGQUNuQixVQUFVO2tCQUR0QixVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENETiB9IGZyb20gXCIuLi9lbnZpcm9ubWVudHMvZW52aXJvbm1lbnRcIjtcblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBJbWFnZUFzc2V0IHtcbiAgcHVibGljIG9idGVuZXJSdXRhSW1hZ2VXaXRoRXh0ZW5zaW9uKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke0NETi5DRE5fSU1BR0VTfS8ke25hbWV9YDtcbiAgfVxufVxuIl19