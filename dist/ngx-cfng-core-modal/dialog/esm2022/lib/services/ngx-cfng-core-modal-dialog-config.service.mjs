import { Injectable } from "@angular/core";
import * as i0 from "@angular/core";
export class NgxCfngCoreModalDialogConfigService {
    iconBaseUrl = '';
    constructor() {
    }
    setIconBaseUrl(url) {
        this.iconBaseUrl = url;
    }
    getIconUrl(iconName) {
        return `${this.iconBaseUrl}/${iconName}`;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogConfigService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogConfigService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0", ngImport: i0, type: NgxCfngCoreModalDialogConfigService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWNmbmctY29yZS1tb2RhbC1kaWFsb2ctY29uZmlnLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtY2ZuZy1jb3JlLW1vZGFsL2RpYWxvZy9zcmMvbGliL3NlcnZpY2VzL25neC1jZm5nLWNvcmUtbW9kYWwtZGlhbG9nLWNvbmZpZy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBS3pDLE1BQU0sT0FBTyxtQ0FBbUM7SUFFdEMsV0FBVyxHQUFXLEVBQUUsQ0FBQztJQUVqQztJQUNBLENBQUM7SUFFTSxjQUFjLENBQUMsR0FBVztRQUMvQixJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztJQUN6QixDQUFDO0lBRU0sVUFBVSxDQUFDLFFBQWdCO1FBQ2hDLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLFFBQVEsRUFBRSxDQUFDO0lBQzNDLENBQUM7dUdBYlUsbUNBQW1DOzJHQUFuQyxtQ0FBbUMsY0FGbEMsTUFBTTs7MkZBRVAsbUNBQW1DO2tCQUgvQyxVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICBwcm92aWRlZEluOiAncm9vdCdcclxufSlcclxuZXhwb3J0IGNsYXNzIE5neENmbmdDb3JlTW9kYWxEaWFsb2dDb25maWdTZXJ2aWNlIHtcclxuXHJcbiAgcHJpdmF0ZSBpY29uQmFzZVVybDogc3RyaW5nID0gJyc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldEljb25CYXNlVXJsKHVybDogc3RyaW5nKSB7XHJcbiAgICB0aGlzLmljb25CYXNlVXJsID0gdXJsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEljb25VcmwoaWNvbk5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYCR7dGhpcy5pY29uQmFzZVVybH0vJHtpY29uTmFtZX1gO1xyXG4gIH1cclxufVxyXG4iXX0=