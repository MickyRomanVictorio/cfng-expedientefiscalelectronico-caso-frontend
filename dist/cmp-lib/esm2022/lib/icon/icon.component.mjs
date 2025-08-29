import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class IconComponent {
    constructor() {
        this.ico = {
            viewBox: '0 0 512 512',
            path: 'M512 216c0-9.079-7.009-23.88-23.72-23.88c-5.738 0-11.49 2.064-16.09 6.142l-158.5-158.5c4.078-4.593 6.143-10.35 6.143-16.09C319.9 7.028 305.2 0 296 0c-6.141 0-12.48 2.344-17.17 7.031l-127.8 128C146.3 139.7 144 145.9 144 152c0 12.79 10.3 24 24 24c5.689 0 11.27-2.234 15.8-6.258L246.1 232L175 303L169.4 297.4C163.1 291.1 154.9 288 146.7 288S130.4 291.1 124.1 297.4l-114.7 114.7c-6.25 6.248-9.375 14.43-9.375 22.62s3.125 16.37 9.375 22.62l45.25 45.25C60.87 508.9 69.06 512 77.25 512s16.37-3.125 22.62-9.375l114.7-114.7c6.25-6.25 9.376-14.44 9.376-22.62c0-8.185-3.125-16.37-9.374-22.62l-5.656-5.656L280 265.9l62.26 62.26c-4.078 4.593-6.143 10.35-6.143 16.09C336.1 360.1 350.8 368 360 368c6.141 0 12.28-2.344 16.97-7.031l128-127.8C509.7 228.5 512 222.1 512 216zM376 294.1L217.9 136L280 73.94L438.1 232L376 294.1z'
        };
        this.height = '1rem';
        this.color = "currentColor";
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: IconComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: IconComponent, selector: "fn-icon", inputs: { ico: "ico", height: "height", color: "color" }, host: { properties: { "style.width": "'calc('+height+'*1.25)'" } }, ngImport: i0, template: `
    <svg
      version="1.1"
      [attr.viewBox]="ico.viewBox"
      [attr.height]="height"
      [attr.fill]="color"
      >
      <path [attr.d]="ico.path" />
    </svg>
  `, isInline: true, styles: [":host{display:inline-flex;justify-content:center}\n", ":host-context(.p-input-icon-left):first-of-type{left:.75rem;color:#6c757d}\n", ":host-context(.p-input-icon-left){position:absolute;top:50%;margin-top:-.5rem}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: IconComponent, decorators: [{
            type: Component,
            args: [{ selector: 'fn-icon', template: `
    <svg
      version="1.1"
      [attr.viewBox]="ico.viewBox"
      [attr.height]="height"
      [attr.fill]="color"
      >
      <path [attr.d]="ico.path" />
    </svg>
  `, host: {
                        '[style.width]': "'calc('+height+'*1.25)'"
                    }, styles: [":host{display:inline-flex;justify-content:center}\n", ":host-context(.p-input-icon-left):first-of-type{left:.75rem;color:#6c757d}\n", ":host-context(.p-input-icon-left){position:absolute;top:50%;margin-top:-.5rem}\n"] }]
        }], propDecorators: { ico: [{
                type: Input
            }], height: [{
                type: Input
            }], color: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9jbXAtbGliL3NyYy9saWIvaWNvbi9pY29uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUF1QmpELE1BQU0sT0FBTyxhQUFhO0lBckIxQjtRQXNCVyxRQUFHLEdBQVE7WUFDbEIsT0FBTyxFQUFFLGFBQWE7WUFDdEIsSUFBSSxFQUFFLHd5QkFBd3lCO1NBQy95QixDQUFDO1FBQ08sV0FBTSxHQUFXLE1BQU0sQ0FBQztRQUN4QixVQUFLLEdBQVcsY0FBYyxDQUFDO0tBQ3pDOzhHQVBZLGFBQWE7a0dBQWIsYUFBYSw2S0FuQmQ7Ozs7Ozs7OztHQVNUOzsyRkFVVSxhQUFhO2tCQXJCekIsU0FBUzsrQkFDRSxTQUFTLFlBQ1Q7Ozs7Ozs7OztHQVNULFFBQ0s7d0JBQ0osZUFBZSxFQUFDLHlCQUF5QjtxQkFDMUM7OEJBUVEsR0FBRztzQkFBWCxLQUFLO2dCQUlHLE1BQU07c0JBQWQsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2ZuLWljb24nLFxyXG4gIHRlbXBsYXRlOiBgXHJcbiAgICA8c3ZnXHJcbiAgICAgIHZlcnNpb249XCIxLjFcIlxyXG4gICAgICBbYXR0ci52aWV3Qm94XT1cImljby52aWV3Qm94XCJcclxuICAgICAgW2F0dHIuaGVpZ2h0XT1cImhlaWdodFwiXHJcbiAgICAgIFthdHRyLmZpbGxdPVwiY29sb3JcIlxyXG4gICAgICA+XHJcbiAgICAgIDxwYXRoIFthdHRyLmRdPVwiaWNvLnBhdGhcIiAvPlxyXG4gICAgPC9zdmc+XHJcbiAgYCxcclxuICBob3N0OiB7XHJcbiAgICAnW3N0eWxlLndpZHRoXSc6XCInY2FsYygnK2hlaWdodCsnKjEuMjUpJ1wiXHJcbiAgfSxcclxuICBzdHlsZXM6IFtcclxuICAgICc6aG9zdCB7ZGlzcGxheTogaW5saW5lLWZsZXg7IGp1c3RpZnktY29udGVudDogY2VudGVyO30nLFxyXG4gICAgJzpob3N0LWNvbnRleHQoLnAtaW5wdXQtaWNvbi1sZWZ0KTpmaXJzdC1vZi10eXBlIHtsZWZ0OiAwLjc1cmVtOyBjb2xvcjogIzZjNzU3ZDt9JyxcclxuICAgICc6aG9zdC1jb250ZXh0KC5wLWlucHV0LWljb24tbGVmdCkge3Bvc2l0aW9uOmFic29sdXRlOyB0b3A6NTAlOyBtYXJnaW4tdG9wOi0uNXJlbTt9JyxcclxuICBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBJY29uQ29tcG9uZW50IHtcclxuICBASW5wdXQoKSBpY286IGFueSA9IHtcclxuICAgIHZpZXdCb3g6ICcwIDAgNTEyIDUxMicsXHJcbiAgICBwYXRoOiAnTTUxMiAyMTZjMC05LjA3OS03LjAwOS0yMy44OC0yMy43Mi0yMy44OGMtNS43MzggMC0xMS40OSAyLjA2NC0xNi4wOSA2LjE0MmwtMTU4LjUtMTU4LjVjNC4wNzgtNC41OTMgNi4xNDMtMTAuMzUgNi4xNDMtMTYuMDlDMzE5LjkgNy4wMjggMzA1LjIgMCAyOTYgMGMtNi4xNDEgMC0xMi40OCAyLjM0NC0xNy4xNyA3LjAzMWwtMTI3LjggMTI4QzE0Ni4zIDEzOS43IDE0NCAxNDUuOSAxNDQgMTUyYzAgMTIuNzkgMTAuMyAyNCAyNCAyNGM1LjY4OSAwIDExLjI3LTIuMjM0IDE1LjgtNi4yNThMMjQ2LjEgMjMyTDE3NSAzMDNMMTY5LjQgMjk3LjRDMTYzLjEgMjkxLjEgMTU0LjkgMjg4IDE0Ni43IDI4OFMxMzAuNCAyOTEuMSAxMjQuMSAyOTcuNGwtMTE0LjcgMTE0LjdjLTYuMjUgNi4yNDgtOS4zNzUgMTQuNDMtOS4zNzUgMjIuNjJzMy4xMjUgMTYuMzcgOS4zNzUgMjIuNjJsNDUuMjUgNDUuMjVDNjAuODcgNTA4LjkgNjkuMDYgNTEyIDc3LjI1IDUxMnMxNi4zNy0zLjEyNSAyMi42Mi05LjM3NWwxMTQuNy0xMTQuN2M2LjI1LTYuMjUgOS4zNzYtMTQuNDQgOS4zNzYtMjIuNjJjMC04LjE4NS0zLjEyNS0xNi4zNy05LjM3NC0yMi42MmwtNS42NTYtNS42NTZMMjgwIDI2NS45bDYyLjI2IDYyLjI2Yy00LjA3OCA0LjU5My02LjE0MyAxMC4zNS02LjE0MyAxNi4wOUMzMzYuMSAzNjAuMSAzNTAuOCAzNjggMzYwIDM2OGM2LjE0MSAwIDEyLjI4LTIuMzQ0IDE2Ljk3LTcuMDMxbDEyOC0xMjcuOEM1MDkuNyAyMjguNSA1MTIgMjIyLjEgNTEyIDIxNnpNMzc2IDI5NC4xTDIxNy45IDEzNkwyODAgNzMuOTRMNDM4LjEgMjMyTDM3NiAyOTQuMXonXHJcbiAgfTtcclxuICBASW5wdXQoKSBoZWlnaHQ6IHN0cmluZyA9ICcxcmVtJztcclxuICBASW5wdXQoKSBjb2xvcjogc3RyaW5nID0gXCJjdXJyZW50Q29sb3JcIjtcclxufVxyXG4iXX0=