import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class InputUtil {
    constructor() { }
    // TODO: Ref cfng-core-lib - validarSoloNumeros
    validarSoloNumeros(event) {
        const input = event.target;
        const valorActual = input.value;
        input.value = valorActual.replace(/[^0-9]/g, '');
    }
    // TODO: Ref cfng-core-lib - validarSoloLetras
    validarSoloLetras(event) {
        const input = event.target;
        const valorActual = input.value;
        input.value = valorActual.replace(/[^a-zA-Z]/g, '');
    }
    // TODO: Ref cfng-core-lib - validarSoloLetrasNumeros
    validarSoloLetrasNumeros(event) {
        const input = event.target;
        const valorActual = input.value;
        input.value = valorActual.replace(/[^a-zA-Z0-9]/g, '');
    }
    // TODO: Ref cfng-core-lib - contarTotalPalabras
    contarTotalPalabras(inputText, maxLength) {
        const words = inputText.value ?? '';
        let wordCount = words.length;
        if (wordCount >= maxLength) {
            const newValue = words.substring(0, maxLength);
            inputText.setValue(newValue);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: InputUtil, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: InputUtil, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: InputUtil, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtdXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jZm5nLWNvcmUtbGliL3V0aWwvaW5wdXQtdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUt6QyxNQUFNLE9BQU8sU0FBUztJQUVwQixnQkFDRyxDQUFDO0lBRUosK0NBQStDO0lBQ3hDLGtCQUFrQixDQUFDLEtBQVk7UUFDcEMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQTBCLENBQUM7UUFDL0MsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUNoQyxLQUFLLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCw4Q0FBOEM7SUFDdkMsaUJBQWlCLENBQUMsS0FBWTtRQUNuQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBMEIsQ0FBQztRQUMvQyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUdELHFEQUFxRDtJQUM5Qyx3QkFBd0IsQ0FBQyxLQUFZO1FBQzFDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUEwQixDQUFDO1FBQy9DLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDaEMsS0FBSyxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsZ0RBQWdEO0lBQ3pDLG1CQUFtQixDQUFDLFNBQWMsRUFBRSxTQUFpQjtRQUMxRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUNwQyxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQzdCLElBQUksU0FBUyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQzNCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQy9DLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsQ0FBQztJQUNILENBQUM7OEdBbkNVLFNBQVM7a0hBQVQsU0FBUyxjQUZSLE1BQU07OzJGQUVQLFNBQVM7a0JBSHJCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgSW5wdXRVdGlsIHtcblxuICBjb25zdHJ1Y3RvcihcbiAgKSB7fVxuXG4gIC8vIFRPRE86IFJlZiBjZm5nLWNvcmUtbGliIC0gdmFsaWRhclNvbG9OdW1lcm9zXG4gIHB1YmxpYyB2YWxpZGFyU29sb051bWVyb3MoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgaW5wdXQgPSBldmVudC50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCB2YWxvckFjdHVhbCA9IGlucHV0LnZhbHVlO1xuICAgIGlucHV0LnZhbHVlID0gdmFsb3JBY3R1YWwucmVwbGFjZSgvW14wLTldL2csICcnKTtcbiAgfVxuXG4gIC8vIFRPRE86IFJlZiBjZm5nLWNvcmUtbGliIC0gdmFsaWRhclNvbG9MZXRyYXNcbiAgcHVibGljIHZhbGlkYXJTb2xvTGV0cmFzKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGlucHV0ID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY29uc3QgdmFsb3JBY3R1YWwgPSBpbnB1dC52YWx1ZTtcbiAgICBpbnB1dC52YWx1ZSA9IHZhbG9yQWN0dWFsLnJlcGxhY2UoL1teYS16QS1aXS9nLCAnJyk7XG4gIH1cblxuXG4gIC8vIFRPRE86IFJlZiBjZm5nLWNvcmUtbGliIC0gdmFsaWRhclNvbG9MZXRyYXNOdW1lcm9zXG4gIHB1YmxpYyB2YWxpZGFyU29sb0xldHJhc051bWVyb3MoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgaW5wdXQgPSBldmVudC50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCB2YWxvckFjdHVhbCA9IGlucHV0LnZhbHVlO1xuICAgIGlucHV0LnZhbHVlID0gdmFsb3JBY3R1YWwucmVwbGFjZSgvW15hLXpBLVowLTldL2csICcnKTtcbiAgfVxuXG4gIC8vIFRPRE86IFJlZiBjZm5nLWNvcmUtbGliIC0gY29udGFyVG90YWxQYWxhYnJhc1xuICBwdWJsaWMgY29udGFyVG90YWxQYWxhYnJhcyhpbnB1dFRleHQ6IGFueSwgbWF4TGVuZ3RoOiBudW1iZXIpIHtcbiAgICBjb25zdCB3b3JkcyA9IGlucHV0VGV4dC52YWx1ZSA/PyAnJztcbiAgICBsZXQgd29yZENvdW50ID0gd29yZHMubGVuZ3RoO1xuICAgIGlmICh3b3JkQ291bnQgPj0gbWF4TGVuZ3RoKSB7XG4gICAgICBjb25zdCBuZXdWYWx1ZSA9IHdvcmRzLnN1YnN0cmluZygwLCBtYXhMZW5ndGgpO1xuICAgICAgaW5wdXRUZXh0LnNldFZhbHVlKG5ld1ZhbHVlKTtcbiAgICB9XG4gIH1cblxufVxuIl19