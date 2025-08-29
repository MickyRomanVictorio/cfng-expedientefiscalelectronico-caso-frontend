import { Injectable } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/router";
export class HeaderService {
    router;
    urlActual = '';
    actualizarHeaderSubject = new BehaviorSubject(false);
    actualizarHeader$ = this.actualizarHeaderSubject.asObservable();
    constructor(router) {
        this.router = router;
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
            this.urlActual = event.urlAfterRedirects;
        });
    }
    setActualizarHeader(valor) {
        this.actualizarHeaderSubject.next(valor);
    }
    getUrlActual(prefijoURL) {
        return this.urlActual.replace(prefijoURL, '').split('?')[0];
    }
    getMenuActual(menu, prefijoURL) {
        const url = this.getUrlActual(prefijoURL);
        return menu.find((item) => url === item.url || url.startsWith(item.url + '/'));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: HeaderService, deps: [{ token: i1.Router }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: HeaderService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: HeaderService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: () => [{ type: i1.Router }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtY2ZuZy1jb3JlLWxheW91dC9oZWFkZXIvc3JjL2xpYi9zZXJ2aWNlcy9oZWFkZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxhQUFhLEVBQWdDLE1BQU0saUJBQWlCLENBQUM7QUFDOUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7OztBQU0vQyxNQUFNLE9BQU8sYUFBYTtJQU1LO0lBSnRCLFNBQVMsR0FBVyxFQUFFLENBQUE7SUFDWix1QkFBdUIsR0FBRyxJQUFJLGVBQWUsQ0FBVSxLQUFLLENBQUMsQ0FBQTtJQUM5RSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxFQUFFLENBQUE7SUFFL0QsWUFBNkIsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFFekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO2FBQ2YsSUFBSSxDQUNILE1BQU0sQ0FDSixDQUFDLEtBQWtCLEVBQTBCLEVBQUUsQ0FBQyxLQUFLLFlBQVksYUFBYSxDQUMvRSxDQUNGLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBb0IsRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLG1CQUFtQixDQUFDLEtBQWM7UUFDdkMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUMxQyxDQUFDO0lBRU0sWUFBWSxDQUFDLFVBQWtCO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU0sYUFBYSxDQUNsQixJQUFzQixFQUN0QixVQUFrQjtRQUVsQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFNLENBQUM7SUFDdkYsQ0FBQzt1R0FoQ1UsYUFBYTsyR0FBYixhQUFhLGNBRlosTUFBTTs7MkZBRVAsYUFBYTtrQkFIekIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE5hdmlnYXRpb25FbmQsIFJvdXRlciwgRXZlbnQgYXMgUm91dGVyRXZlbnQgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xyXG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIGZpbHRlciB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBNZW51TmF2ZWdhY2lvbiB9IGZyb20gJy4uL21vZGVscy9jb25maWd1cmFjaW9uLm1vZGVsJztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICBwcm92aWRlZEluOiAncm9vdCcsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBIZWFkZXJTZXJ2aWNlIHtcclxuXHJcbiAgcHVibGljIHVybEFjdHVhbDogc3RyaW5nID0gJydcclxuICBwcml2YXRlIHJlYWRvbmx5IGFjdHVhbGl6YXJIZWFkZXJTdWJqZWN0ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPihmYWxzZSlcclxuICBhY3R1YWxpemFySGVhZGVyJCA9IHRoaXMuYWN0dWFsaXphckhlYWRlclN1YmplY3QuYXNPYnNlcnZhYmxlKClcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSByb3V0ZXI6IFJvdXRlcikge1xyXG5cclxuICAgIHRoaXMucm91dGVyLmV2ZW50c1xyXG4gICAgICAucGlwZShcclxuICAgICAgICBmaWx0ZXIoXHJcbiAgICAgICAgICAoZXZlbnQ6IFJvdXRlckV2ZW50KTogZXZlbnQgaXMgTmF2aWdhdGlvbkVuZCA9PiBldmVudCBpbnN0YW5jZW9mIE5hdmlnYXRpb25FbmRcclxuICAgICAgICApXHJcbiAgICAgICkuc3Vic2NyaWJlKChldmVudDogTmF2aWdhdGlvbkVuZCkgPT4ge1xyXG4gICAgICAgIHRoaXMudXJsQWN0dWFsID0gZXZlbnQudXJsQWZ0ZXJSZWRpcmVjdHM7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldEFjdHVhbGl6YXJIZWFkZXIodmFsb3I6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMuYWN0dWFsaXphckhlYWRlclN1YmplY3QubmV4dCh2YWxvcilcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRVcmxBY3R1YWwocHJlZmlqb1VSTDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLnVybEFjdHVhbC5yZXBsYWNlKHByZWZpam9VUkwsICcnKS5zcGxpdCgnPycpWzBdO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldE1lbnVBY3R1YWwoXHJcbiAgICBtZW51OiBNZW51TmF2ZWdhY2lvbltdLFxyXG4gICAgcHJlZmlqb1VSTDogc3RyaW5nXHJcbiAgKTogTWVudU5hdmVnYWNpb24gfCB1bmRlZmluZWQge1xyXG4gICAgY29uc3QgdXJsID0gdGhpcy5nZXRVcmxBY3R1YWwocHJlZmlqb1VSTCk7XHJcbiAgICByZXR1cm4gbWVudS5maW5kKCAoaXRlbSkgPT4gdXJsID09PSBpdGVtLnVybCB8fCB1cmwuc3RhcnRzV2l0aChpdGVtLnVybCArICcvJykgICAgICk7XHJcbiAgfVxyXG5cclxufVxyXG4iXX0=