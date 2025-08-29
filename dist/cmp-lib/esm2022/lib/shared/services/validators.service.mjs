import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class ValidatorsService {
    constructor() { }
    isField1EqualFiel2(field1, field2) {
        return (formGroup) => {
            const fieldValue1 = formGroup.get(field1)?.value;
            const fieldValue2 = formGroup.get(field2)?.value;
            if (fieldValue1 !== fieldValue2) {
                formGroup.get(field2)?.setErrors({ notEqual: true });
                return { notEquals: true };
            }
            formGroup.get(field2)?.setErrors(null);
            return null;
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: ValidatorsService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: ValidatorsService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: ValidatorsService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvY21wLWxpYi9zcmMvbGliL3NoYXJlZC9zZXJ2aWNlcy92YWxpZGF0b3JzLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFNM0MsTUFBTSxPQUFPLGlCQUFpQjtJQUU1QixnQkFBZ0IsQ0FBQztJQUVqQixrQkFBa0IsQ0FBQyxNQUFjLEVBQUUsTUFBYztRQUMvQyxPQUFPLENBQUMsU0FBMEIsRUFBMkIsRUFBRTtZQUM3RCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQztZQUNqRCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQztZQUVqRCxJQUFHLFdBQVcsS0FBSyxXQUFXLEVBQUUsQ0FBQztnQkFDL0IsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtnQkFDcEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQTtZQUM1QixDQUFDO1lBRUQsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDLENBQUE7SUFDSCxDQUFDOzhHQWpCVSxpQkFBaUI7a0hBQWpCLGlCQUFpQixjQUZoQixNQUFNOzsyRkFFUCxpQkFBaUI7a0JBSDdCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBBYnN0cmFjdENvbnRyb2wsIFZhbGlkYXRpb25FcnJvcnMgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcblxyXG5ASW5qZWN0YWJsZSh7XHJcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBWYWxpZGF0b3JzU2VydmljZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkgeyB9XHJcblxyXG4gIGlzRmllbGQxRXF1YWxGaWVsMihmaWVsZDE6IHN0cmluZywgZmllbGQyOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiAoZm9ybUdyb3VwOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCA9PiB7XHJcbiAgICAgIGNvbnN0IGZpZWxkVmFsdWUxID0gZm9ybUdyb3VwLmdldChmaWVsZDEpPy52YWx1ZTtcclxuICAgICAgY29uc3QgZmllbGRWYWx1ZTIgPSBmb3JtR3JvdXAuZ2V0KGZpZWxkMik/LnZhbHVlO1xyXG5cclxuICAgICAgaWYoZmllbGRWYWx1ZTEgIT09IGZpZWxkVmFsdWUyKSB7XHJcbiAgICAgICAgZm9ybUdyb3VwLmdldChmaWVsZDIpPy5zZXRFcnJvcnMoeyBub3RFcXVhbDogdHJ1ZSB9KVxyXG4gICAgICAgIHJldHVybiB7IG5vdEVxdWFsczogdHJ1ZSB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvcm1Hcm91cC5nZXQoZmllbGQyKT8uc2V0RXJyb3JzKG51bGwpO1xyXG4gICAgICByZXR1cm4gbnVsbFxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=