import { EventEmitter, Injectable, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class FirmaDigitalClienteService {
    processSignClient = new EventEmitter();
    sendDataSign = new EventEmitter();
    constructor() { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: FirmaDigitalClienteService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: FirmaDigitalClienteService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: FirmaDigitalClienteService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [], propDecorators: { processSignClient: [{
                type: Output
            }], sendDataSign: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlybWEtZGlnaXRhbC1jbGllbnRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtY2ZuZy1jb3JlLWZpcm1hLWRpZ2l0YWwvc3JjL2xpYi9zZXJ2aWNlcy9maXJtYS1kaWdpdGFsLWNsaWVudGUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBTWpFLE1BQU0sT0FBTywwQkFBMEI7SUFFM0IsaUJBQWlCLEdBQXlCLElBQUksWUFBWSxFQUFVLENBQUM7SUFDckUsWUFBWSxHQUFpQyxJQUFJLFlBQVksRUFBa0IsQ0FBQztJQUUxRixnQkFBZ0IsQ0FBQzt1R0FMTiwwQkFBMEI7MkdBQTFCLDBCQUEwQixjQUZ6QixNQUFNOzsyRkFFUCwwQkFBMEI7a0JBSHRDLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CO3dEQUdXLGlCQUFpQjtzQkFBMUIsTUFBTTtnQkFDRyxZQUFZO3NCQUFyQixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyLCBJbmplY3RhYmxlLCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgRmlybWFJbnRlcmZhY2UgfSBmcm9tICcuLi9tb2RlbHMvZmlybWEtZGlnaXRhbC5pbnRlcmZhY2UnO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gIHByb3ZpZGVkSW46ICdyb290J1xyXG59KVxyXG5leHBvcnQgY2xhc3MgRmlybWFEaWdpdGFsQ2xpZW50ZVNlcnZpY2Uge1xyXG5cclxuICBAT3V0cHV0KCkgcHJvY2Vzc1NpZ25DbGllbnQ6IEV2ZW50RW1pdHRlcjxzdHJpbmc+ID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XHJcbiAgQE91dHB1dCgpIHNlbmREYXRhU2lnbjogRXZlbnRFbWl0dGVyPEZpcm1hSW50ZXJmYWNlPiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlybWFJbnRlcmZhY2U+KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkgeyB9XHJcbn1cclxuIl19