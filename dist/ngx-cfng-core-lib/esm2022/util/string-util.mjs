import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/platform-browser";
export class StringUtil {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
    }
    // TODO: Ref cfng-core-lib - formatearCodigoCaso
    //  - Se debera llamar a la librería de estilo(cfng-core-cdn), para referenciar el color del texto sobre el código de caso.
    formatearCodigoCaso(codigoCaso) {
        codigoCaso = `${codigoCaso}-0`;
        const partes = codigoCaso.split('-');
        if (partes.length > 3) {
            return this.sanitizer.bypassSecurityTrustHtml(`${partes[0]}-<span style="color:orange" >${partes[1]}-${partes[2]}</span>-${partes[3]}`);
        }
        return codigoCaso;
    }
    // TODO: Ref cfng-core-lib - obtenerNumeroCaso
    obtenerNumeroCaso(numeroCaso) {
        const caso = numeroCaso.split('-');
        return `<div class="cfe-caso">${caso[0]}-<span>${caso[1]}-${caso[2]}</span>-${caso[3]}</div>`;
    }
    // TODO: Ref cfng-core-lib - obtenerClaseDeOrigen
    obtenerPlazo(plazo) {
        let semaforo = 'dentro-del-plazo';
        if (plazo == "2") {
            semaforo = 'plazo-por-vencer';
        }
        else if (plazo == "3") {
            semaforo = 'plazo-vencido';
        }
        return semaforo;
    }
    obtenerPlazoItem(plazo) {
        let semaforo = 'dentro-del-plazo';
        if (plazo == "2") {
            semaforo = 'plazo-por-vencer';
        }
        else if (plazo == "3") {
            semaforo = 'plazo-vencido';
        }
        return `<span class="plazo-item ${semaforo}"></span>`;
    }
    formatearNombre(nombre) {
        if (nombre !== undefined && nombre !== null) {
            return nombre
                .toLowerCase()
                .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
        }
        else {
            return '-';
        }
    }
    mostrarDelitosFromArray(delitoArray) {
        if (delitoArray && delitoArray.length > 0) {
            return delitoArray
                .map((item) => item.nombre.toLowerCase())
                .join(' / ');
        }
        else {
            return '-';
        }
    }
    getColor(indSemaforo) {
        switch (indSemaforo) {
            case 1:
                return 'greenbar';
            case 2:
                return 'yellowbar';
            case 3:
                return 'redbar';
            default:
                return 'yellowbar';
        }
    }
    capitalizedFirstWord(texto = '') {
        if (typeof texto !== 'string' || texto.length === 0) {
            return texto;
        }
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StringUtil, deps: [{ token: i1.DomSanitizer }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StringUtil, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StringUtil, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.DomSanitizer }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLXV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtY2ZuZy1jb3JlLWxpYi91dGlsL3N0cmluZy11dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7OztBQU96QyxNQUFNLE9BQU8sVUFBVTtJQUVyQixZQUNVLFNBQXVCO1FBQXZCLGNBQVMsR0FBVCxTQUFTLENBQWM7SUFDOUIsQ0FBQztJQUlKLGdEQUFnRDtJQUNoRCwySEFBMkg7SUFDcEgsbUJBQW1CLENBQUMsVUFBa0I7UUFDM0MsVUFBVSxHQUFHLEdBQUcsVUFBVSxJQUFJLENBQUE7UUFDOUIsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDdEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3pJLENBQUM7UUFDRCxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0lBRUQsOENBQThDO0lBQ3ZDLGlCQUFpQixDQUFDLFVBQWtCO1FBQ3pDLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbEMsT0FBTyx5QkFBeUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUE7SUFDL0YsQ0FBQztJQUVELGlEQUFpRDtJQUMxQyxZQUFZLENBQUMsS0FBYTtRQUMvQixJQUFJLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQztRQUNsQyxJQUFJLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNqQixRQUFRLEdBQUcsa0JBQWtCLENBQUM7UUFDaEMsQ0FBQzthQUFNLElBQUksS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLFFBQVEsR0FBRyxlQUFlLENBQUM7UUFDN0IsQ0FBQztRQUNELE9BQU8sUUFBUSxDQUFBO0lBQ2pCLENBQUM7SUFFTSxnQkFBZ0IsQ0FBQyxLQUFhO1FBQ25DLElBQUksUUFBUSxHQUFHLGtCQUFrQixDQUFDO1FBQ2xDLElBQUksS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQztRQUNoQyxDQUFDO2FBQU0sSUFBSSxLQUFLLElBQUksR0FBRyxFQUFFLENBQUM7WUFDeEIsUUFBUSxHQUFHLGVBQWUsQ0FBQztRQUM3QixDQUFDO1FBQ0QsT0FBTywyQkFBMkIsUUFBUSxXQUFXLENBQUE7SUFDdkQsQ0FBQztJQUVNLGVBQWUsQ0FBQyxNQUFjO1FBQ25DLElBQUksTUFBTSxLQUFLLFNBQVMsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDNUMsT0FBTyxNQUFNO2lCQUNWLFdBQVcsRUFBRTtpQkFDYixPQUFPLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUMxRCxDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQztJQUNILENBQUM7SUFFTSx1QkFBdUIsQ0FBQyxXQUFxQjtRQUNsRCxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzFDLE9BQU8sV0FBVztpQkFDZixHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7aUJBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQixDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQztJQUNILENBQUM7SUFFTSxRQUFRLENBQUMsV0FBbUI7UUFDakMsUUFBUSxXQUFXLEVBQUUsQ0FBQztZQUNwQixLQUFLLENBQUM7Z0JBQ0osT0FBTyxVQUFVLENBQUM7WUFDcEIsS0FBSyxDQUFDO2dCQUNKLE9BQU8sV0FBVyxDQUFDO1lBQ3JCLEtBQUssQ0FBQztnQkFDSixPQUFPLFFBQVEsQ0FBQztZQUNsQjtnQkFDRSxPQUFPLFdBQVcsQ0FBQztRQUN2QixDQUFDO0lBQ0gsQ0FBQztJQUVNLG9CQUFvQixDQUFDLFFBQWEsRUFBRTtRQUN6QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3BELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RFLENBQUM7OEdBcEZVLFVBQVU7a0hBQVYsVUFBVSxjQUZULE1BQU07OzJGQUVQLFVBQVU7a0JBSHRCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RG9tU2FuaXRpemVyfSBmcm9tIFwiQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3NlclwiO1xuaW1wb3J0IHtEZWxpdG99IGZyb20gXCIuLi9pbnRlcmZhY2VzL2NvbXVuZXMvY2Fzb3NGaXNjYWxlcy1pbnRlcmZhY2VcIjtcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgU3RyaW5nVXRpbCB7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBzYW5pdGl6ZXI6IERvbVNhbml0aXplclxuICApIHt9XG5cbiAgcHVibGljIGRlbGl0b3NBcnJheSE6IERlbGl0b1tdO1xuXG4gIC8vIFRPRE86IFJlZiBjZm5nLWNvcmUtbGliIC0gZm9ybWF0ZWFyQ29kaWdvQ2Fzb1xuICAvLyAgLSBTZSBkZWJlcmEgbGxhbWFyIGEgbGEgbGlicmVyw61hIGRlIGVzdGlsbyhjZm5nLWNvcmUtY2RuKSwgcGFyYSByZWZlcmVuY2lhciBlbCBjb2xvciBkZWwgdGV4dG8gc29icmUgZWwgY8OzZGlnbyBkZSBjYXNvLlxuICBwdWJsaWMgZm9ybWF0ZWFyQ29kaWdvQ2Fzbyhjb2RpZ29DYXNvOiBzdHJpbmcpIHtcbiAgICBjb2RpZ29DYXNvID0gYCR7Y29kaWdvQ2Fzb30tMGBcbiAgICBjb25zdCBwYXJ0ZXMgPSBjb2RpZ29DYXNvLnNwbGl0KCctJyk7XG4gICAgaWYgKHBhcnRlcy5sZW5ndGggPiAzKSB7XG4gICAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdEh0bWwoYCR7cGFydGVzWzBdfS08c3BhbiBzdHlsZT1cImNvbG9yOm9yYW5nZVwiID4ke3BhcnRlc1sxXX0tJHtwYXJ0ZXNbMl19PC9zcGFuPi0ke3BhcnRlc1szXX1gKVxuICAgIH1cbiAgICByZXR1cm4gY29kaWdvQ2FzbztcbiAgfVxuXG4gIC8vIFRPRE86IFJlZiBjZm5nLWNvcmUtbGliIC0gb2J0ZW5lck51bWVyb0Nhc29cbiAgcHVibGljIG9idGVuZXJOdW1lcm9DYXNvKG51bWVyb0Nhc286IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgY2FzbyA9IG51bWVyb0Nhc28uc3BsaXQoJy0nKVxuICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImNmZS1jYXNvXCI+JHtjYXNvWzBdfS08c3Bhbj4ke2Nhc29bMV19LSR7Y2Fzb1syXX08L3NwYW4+LSR7Y2Fzb1szXX08L2Rpdj5gXG4gIH1cblxuICAvLyBUT0RPOiBSZWYgY2ZuZy1jb3JlLWxpYiAtIG9idGVuZXJDbGFzZURlT3JpZ2VuXG4gIHB1YmxpYyBvYnRlbmVyUGxhem8ocGxhem86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IHNlbWFmb3JvID0gJ2RlbnRyby1kZWwtcGxhem8nO1xuICAgIGlmIChwbGF6byA9PSBcIjJcIikge1xuICAgICAgc2VtYWZvcm8gPSAncGxhem8tcG9yLXZlbmNlcic7XG4gICAgfSBlbHNlIGlmIChwbGF6byA9PSBcIjNcIikge1xuICAgICAgc2VtYWZvcm8gPSAncGxhem8tdmVuY2lkbyc7XG4gICAgfVxuICAgIHJldHVybiBzZW1hZm9yb1xuICB9XG5cbiAgcHVibGljIG9idGVuZXJQbGF6b0l0ZW0ocGxhem86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IHNlbWFmb3JvID0gJ2RlbnRyby1kZWwtcGxhem8nO1xuICAgIGlmIChwbGF6byA9PSBcIjJcIikge1xuICAgICAgc2VtYWZvcm8gPSAncGxhem8tcG9yLXZlbmNlcic7XG4gICAgfSBlbHNlIGlmIChwbGF6byA9PSBcIjNcIikge1xuICAgICAgc2VtYWZvcm8gPSAncGxhem8tdmVuY2lkbyc7XG4gICAgfVxuICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCJwbGF6by1pdGVtICR7c2VtYWZvcm99XCI+PC9zcGFuPmBcbiAgfVxuXG4gIHB1YmxpYyBmb3JtYXRlYXJOb21icmUobm9tYnJlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChub21icmUgIT09IHVuZGVmaW5lZCAmJiBub21icmUgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBub21icmVcbiAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgLnJlcGxhY2UoLyg/Ol58XFxzKVxcUy9nLCAoY2hhcikgPT4gY2hhci50b1VwcGVyQ2FzZSgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICctJztcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgbW9zdHJhckRlbGl0b3NGcm9tQXJyYXkoZGVsaXRvQXJyYXk6IERlbGl0b1tdKTogc3RyaW5nIHtcbiAgICBpZiAoZGVsaXRvQXJyYXkgJiYgZGVsaXRvQXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIGRlbGl0b0FycmF5XG4gICAgICAgIC5tYXAoKGl0ZW0pID0+IGl0ZW0ubm9tYnJlIS50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAuam9pbignIC8gJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnLSc7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldENvbG9yKGluZFNlbWFmb3JvOiBudW1iZXIpIHtcbiAgICBzd2l0Y2ggKGluZFNlbWFmb3JvKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJldHVybiAnZ3JlZW5iYXInO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gJ3llbGxvd2Jhcic7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHJldHVybiAncmVkYmFyJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAneWVsbG93YmFyJztcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgY2FwaXRhbGl6ZWRGaXJzdFdvcmQodGV4dG86IGFueSA9ICcnICkge1xuICAgIGlmICh0eXBlb2YgdGV4dG8gIT09ICdzdHJpbmcnIHx8IHRleHRvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRleHRvO1xuICAgIH1cbiAgICByZXR1cm4gdGV4dG8uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0ZXh0by5zbGljZSgxKS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbn1cblxuIl19