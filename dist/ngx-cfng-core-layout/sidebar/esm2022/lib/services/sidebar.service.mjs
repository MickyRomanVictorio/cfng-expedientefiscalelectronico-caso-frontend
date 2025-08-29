import { Injectable } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/router";
export class SidebarService {
    router;
    urlActual = '';
    actualizarSidebarSubject = new BehaviorSubject(false);
    actualizarSidebar$ = this.actualizarSidebarSubject.asObservable();
    constructor(router) {
        this.router = router;
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event) => {
            this.urlActual = event.urlAfterRedirects;
        });
    }
    setActualizarSidebar(valor) {
        this.actualizarSidebarSubject.next(valor);
    }
    getUrlActual(prefijoURL) {
        return this.urlActual.replace(prefijoURL, '').split('?')[0];
    }
    transformarUrl(url) {
        const rutasTransformar = [
            'bandeja-tramites/nuevos',
            'bandeja-tramites/enviados-para-revisar',
            'bandeja-tramites/enviados-para-visar',
            'bandeja-tramites/pendientes-para-revisar',
            'bandeja-tramites/firmados'
        ];
        return rutasTransformar.includes(url) ? 'bandeja-tramites/bandeja-de-tramites' : url;
    }
    getMenuIndexActual(menu, prefijoURL) {
        const url = this.transformarUrl(this.getUrlActual(prefijoURL));
        return menu.findIndex((item) => url === item.url || url.startsWith(item.url + '/'));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: SidebarService, deps: [{ token: i1.Router }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: SidebarService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: SidebarService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: () => [{ type: i1.Router }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWNmbmctY29yZS1sYXlvdXQvc2lkZWJhci9zcmMvbGliL3NlcnZpY2VzL3NpZGViYXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFBO0FBQzFDLE9BQU8sRUFBRSxhQUFhLEVBQWlCLE1BQU0saUJBQWlCLENBQUE7QUFFOUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUE7OztBQUs5QyxNQUFNLE9BQU8sY0FBYztJQU1JO0lBSnRCLFNBQVMsR0FBVyxFQUFFLENBQUE7SUFDWix3QkFBd0IsR0FBRyxJQUFJLGVBQWUsQ0FBVSxLQUFLLENBQUMsQ0FBQTtJQUMvRSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsWUFBWSxFQUFFLENBQUE7SUFFakUsWUFBNkIsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO2FBQ2YsSUFBSSxDQUNILE1BQU0sQ0FDSixDQUFDLEtBQVksRUFBMEIsRUFBRSxDQUN2QyxLQUFLLFlBQVksYUFBYSxDQUNqQyxDQUNGO2FBQ0EsU0FBUyxDQUFDLENBQUMsS0FBb0IsRUFBRSxFQUFFO1lBQ2xDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFBO1FBQzFDLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVNLG9CQUFvQixDQUFDLEtBQWM7UUFDeEMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUMzQyxDQUFDO0lBRU0sWUFBWSxDQUFDLFVBQWtCO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3RCxDQUFDO0lBRU8sY0FBYyxDQUFDLEdBQVc7UUFDaEMsTUFBTSxnQkFBZ0IsR0FBRztZQUN2Qix5QkFBeUI7WUFDekIsd0NBQXdDO1lBQ3hDLHNDQUFzQztZQUN0QywwQ0FBMEM7WUFDMUMsMkJBQTJCO1NBQzVCLENBQUE7UUFDRCxPQUFPLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtJQUN0RixDQUFDO0lBRU0sa0JBQWtCLENBQ3ZCLElBQXNCLEVBQ3RCLFVBQWtCO1FBRWxCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO1FBQzlELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FDbkIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDN0QsQ0FBQTtJQUNILENBQUM7dUdBOUNVLGNBQWM7MkdBQWQsY0FBYyxjQUZiLE1BQU07OzJGQUVQLGNBQWM7a0JBSDFCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnXHJcbmltcG9ydCB7IE5hdmlnYXRpb25FbmQsIFJvdXRlciwgRXZlbnQgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInXHJcbmltcG9ydCB7IE1lbnVOYXZlZ2FjaW9uIH0gZnJvbSAnLi4vbW9kZWxzL2NvbmZpZ3VyYWNpb24ubW9kZWwnXHJcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgZmlsdGVyIH0gZnJvbSAncnhqcydcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICBwcm92aWRlZEluOiAncm9vdCcsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBTaWRlYmFyU2VydmljZSB7XHJcblxyXG4gIHB1YmxpYyB1cmxBY3R1YWw6IHN0cmluZyA9ICcnXHJcbiAgcHJpdmF0ZSByZWFkb25seSBhY3R1YWxpemFyU2lkZWJhclN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+KGZhbHNlKVxyXG4gIGFjdHVhbGl6YXJTaWRlYmFyJCA9IHRoaXMuYWN0dWFsaXphclNpZGViYXJTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpXHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgcm91dGVyOiBSb3V0ZXIpIHtcclxuICAgIHRoaXMucm91dGVyLmV2ZW50c1xyXG4gICAgICAucGlwZShcclxuICAgICAgICBmaWx0ZXIoXHJcbiAgICAgICAgICAoZXZlbnQ6IEV2ZW50KTogZXZlbnQgaXMgTmF2aWdhdGlvbkVuZCA9PlxyXG4gICAgICAgICAgICBldmVudCBpbnN0YW5jZW9mIE5hdmlnYXRpb25FbmRcclxuICAgICAgICApXHJcbiAgICAgIClcclxuICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IE5hdmlnYXRpb25FbmQpID0+IHtcclxuICAgICAgICB0aGlzLnVybEFjdHVhbCA9IGV2ZW50LnVybEFmdGVyUmVkaXJlY3RzXHJcbiAgICAgIH0pXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0QWN0dWFsaXphclNpZGViYXIodmFsb3I6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMuYWN0dWFsaXphclNpZGViYXJTdWJqZWN0Lm5leHQodmFsb3IpXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0VXJsQWN0dWFsKHByZWZpam9VUkw6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy51cmxBY3R1YWwucmVwbGFjZShwcmVmaWpvVVJMLCAnJykuc3BsaXQoJz8nKVswXVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0cmFuc2Zvcm1hclVybCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBydXRhc1RyYW5zZm9ybWFyID0gW1xyXG4gICAgICAnYmFuZGVqYS10cmFtaXRlcy9udWV2b3MnLFxyXG4gICAgICAnYmFuZGVqYS10cmFtaXRlcy9lbnZpYWRvcy1wYXJhLXJldmlzYXInLFxyXG4gICAgICAnYmFuZGVqYS10cmFtaXRlcy9lbnZpYWRvcy1wYXJhLXZpc2FyJyxcclxuICAgICAgJ2JhbmRlamEtdHJhbWl0ZXMvcGVuZGllbnRlcy1wYXJhLXJldmlzYXInLFxyXG4gICAgICAnYmFuZGVqYS10cmFtaXRlcy9maXJtYWRvcydcclxuICAgIF1cclxuICAgIHJldHVybiBydXRhc1RyYW5zZm9ybWFyLmluY2x1ZGVzKHVybCkgPyAnYmFuZGVqYS10cmFtaXRlcy9iYW5kZWphLWRlLXRyYW1pdGVzJyA6IHVybFxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldE1lbnVJbmRleEFjdHVhbChcclxuICAgIG1lbnU6IE1lbnVOYXZlZ2FjaW9uW10sXHJcbiAgICBwcmVmaWpvVVJMOiBzdHJpbmdcclxuICApOiBudW1iZXIge1xyXG4gICAgY29uc3QgdXJsID0gdGhpcy50cmFuc2Zvcm1hclVybCh0aGlzLmdldFVybEFjdHVhbChwcmVmaWpvVVJMKSlcclxuICAgIHJldHVybiBtZW51LmZpbmRJbmRleChcclxuICAgICAgKGl0ZW0pID0+IHVybCA9PT0gaXRlbS51cmwgfHwgdXJsLnN0YXJ0c1dpdGgoaXRlbS51cmwgKyAnLycpXHJcbiAgICApXHJcbiAgfVxyXG5cclxufVxyXG4iXX0=