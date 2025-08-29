import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class NgxCfngCoreFirmaDigitalService {
    scripts = {};
    load(scriptName, src) {
        return new Promise((resolve, reject) => {
            if (this.scripts[scriptName]) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
                this.scripts[scriptName] = true;
                resolve();
            };
            script.onerror = (error) => reject(error);
            document.head.appendChild(script);
        });
    }
    loadScriptsSequentially(scripts) {
        return scripts.reduce(async (promiseChain, script) => {
            return promiseChain.then(() => this.load(script.name, script.src));
        }, Promise.resolve());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: NgxCfngCoreFirmaDigitalService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: NgxCfngCoreFirmaDigitalService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: NgxCfngCoreFirmaDigitalService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWNmbmctY29yZS1maXJtYS1kaWdpdGFsLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtY2ZuZy1jb3JlLWZpcm1hLWRpZ2l0YWwvc3JjL2xpYi9uZ3gtY2ZuZy1jb3JlLWZpcm1hLWRpZ2l0YWwuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOztBQUszQyxNQUFNLE9BQU8sOEJBQThCO0lBRWpDLE9BQU8sR0FBUSxFQUFFLENBQUM7SUFFMUIsSUFBSSxDQUFDLFVBQWtCLEVBQUUsR0FBVztRQUNsQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO2dCQUM3QixPQUFPLEVBQUUsQ0FBQztnQkFDVixPQUFPO1lBQ1QsQ0FBQztZQUVELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDakIsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDcEIsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDO2dCQUNoQyxPQUFPLEVBQUUsQ0FBQztZQUNaLENBQUMsQ0FBQztZQUNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxPQUF3QztRQUM5RCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuRCxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN4QixDQUFDO3VHQTNCVSw4QkFBOEI7MkdBQTlCLDhCQUE4QixjQUY3QixNQUFNOzsyRkFFUCw4QkFBOEI7a0JBSDFDLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gIHByb3ZpZGVkSW46ICdyb290J1xyXG59KVxyXG5leHBvcnQgY2xhc3MgTmd4Q2ZuZ0NvcmVGaXJtYURpZ2l0YWxTZXJ2aWNlIHtcclxuXHJcbiAgcHJpdmF0ZSBzY3JpcHRzOiBhbnkgPSB7fTtcclxuXHJcbiAgbG9hZChzY3JpcHROYW1lOiBzdHJpbmcsIHNyYzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5zY3JpcHRzW3NjcmlwdE5hbWVdKSB7XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgIHNjcmlwdC5zcmMgPSBzcmM7XHJcbiAgICAgIHNjcmlwdC5hc3luYyA9IHRydWU7XHJcbiAgICAgIHNjcmlwdC5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zY3JpcHRzW3NjcmlwdE5hbWVdID0gdHJ1ZTtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH07XHJcbiAgICAgIHNjcmlwdC5vbmVycm9yID0gKGVycm9yOiBhbnkpID0+IHJlamVjdChlcnJvcik7XHJcbiAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgbG9hZFNjcmlwdHNTZXF1ZW50aWFsbHkoc2NyaXB0czogeyBuYW1lOiBzdHJpbmcsIHNyYzogc3RyaW5nIH1bXSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIHNjcmlwdHMucmVkdWNlKGFzeW5jIChwcm9taXNlQ2hhaW4sIHNjcmlwdCkgPT4ge1xyXG4gICAgICByZXR1cm4gcHJvbWlzZUNoYWluLnRoZW4oKCkgPT4gdGhpcy5sb2FkKHNjcmlwdC5uYW1lLCBzY3JpcHQuc3JjKSk7XHJcbiAgICB9LCBQcm9taXNlLnJlc29sdmUoKSk7XHJcbiAgfVxyXG5cclxufVxyXG4iXX0=