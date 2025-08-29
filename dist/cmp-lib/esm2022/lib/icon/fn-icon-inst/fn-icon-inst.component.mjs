import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "../../shared/pipes/safe-html.pipe";
export class FnIconInstComponent {
    constructor() {
        this.ico = {
            viewBox: '0 0 640 512',
            path: ['<path fill="#0f2c52" d="M313.1 511.2l-288-63.1C10.42 443.1 0 430.1 0 416V64.01C0 43.19 19.56 27.92 39.76 32.97L64 39.03v325.6c0 14.1 10.42 27.98 25.06 31.24L320 447.2l230.9-51.32C565.6 392.6 576 379.7 576 364.7V39.03l24.24-6.058C620.4 27.92 640 43.19 640 64.01v351.1c0 14.1-10.42 27.99-25.06 31.24l-288 63.1C322.4 512.3 317.6 512.3 313.1 511.2z"/>', '<path fill="#d9a927" d="M64 32.4v323.1L304 416V40.02L100.9 .3879C81.5-2.649 64 12.54 64 32.4zM539.1 .3879L336 40.02V416l240-59.62V32.4C576 12.54 558.5-2.649 539.1 .3879z"/>']
        };
        this.height = "3rem";
        this.arrViewBox = this.ico.viewBox.split(' ');
        this.proportion = this.arrViewBox[2] / this.arrViewBox[3];
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnIconInstComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: FnIconInstComponent, selector: "fn-icon-inst", inputs: { ico: "ico", height: "height" }, host: { properties: { "style.width": "'calc(' + height + '*' + proportion + '*2)'", "style.height": "'calc(' + height + '*' + proportion + ' + ' + height + ')'" } }, ngImport: i0, template: `
    <svg
      version="1.1"
      [attr.viewBox]="ico.viewBox"
      [attr.height]="height"
    >
      <path *ngFor="let p of ico.path" [outerHTML]="p | safeHtml"/>
    </svg>
  `, isInline: true, styles: [":host{display:inline-flex;justify-content:center;align-items:center}\n"], dependencies: [{ kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "pipe", type: i2.SafeHtmlPipe, name: "safeHtml" }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnIconInstComponent, decorators: [{
            type: Component,
            args: [{ selector: 'fn-icon-inst', template: `
    <svg
      version="1.1"
      [attr.viewBox]="ico.viewBox"
      [attr.height]="height"
    >
      <path *ngFor="let p of ico.path" [outerHTML]="p | safeHtml"/>
    </svg>
  `, host: {
                        '[style.width]': "'calc(' + height + '*' + proportion + '*2)'",
                        '[style.height]': "'calc(' + height + '*' + proportion + ' + ' + height + ')'",
                    }, styles: [":host{display:inline-flex;justify-content:center;align-items:center}\n"] }]
        }], propDecorators: { ico: [{
                type: Input
            }], height: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm4taWNvbi1pbnN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2NtcC1saWIvc3JjL2xpYi9pY29uL2ZuLWljb24taW5zdC9mbi1pY29uLWluc3QuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7O0FBcUJqRCxNQUFNLE9BQU8sbUJBQW1CO0lBbkJoQztRQW9CVyxRQUFHLEdBQVE7WUFDbEIsT0FBTyxFQUFFLGFBQWE7WUFDdEIsSUFBSSxFQUFFLENBQUMsNlZBQTZWLEVBQUMsOEtBQThLLENBQUM7U0FDcmhCLENBQUM7UUFDTyxXQUFNLEdBQVcsTUFBTSxDQUFDO1FBRWpDLGVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDeEMsZUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUVuRDs4R0FWWSxtQkFBbUI7a0dBQW5CLG1CQUFtQixvUUFqQnBCOzs7Ozs7OztHQVFUOzsyRkFTVSxtQkFBbUI7a0JBbkIvQixTQUFTOytCQUNFLGNBQWMsWUFDZDs7Ozs7Ozs7R0FRVCxRQUNLO3dCQUNKLGVBQWUsRUFBQyw2Q0FBNkM7d0JBQzdELGdCQUFnQixFQUFDLDREQUE0RDtxQkFDOUU7OEJBTVEsR0FBRztzQkFBWCxLQUFLO2dCQUlHLE1BQU07c0JBQWQsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnZm4taWNvbi1pbnN0JyxcclxuICB0ZW1wbGF0ZTogYFxyXG4gICAgPHN2Z1xyXG4gICAgICB2ZXJzaW9uPVwiMS4xXCJcclxuICAgICAgW2F0dHIudmlld0JveF09XCJpY28udmlld0JveFwiXHJcbiAgICAgIFthdHRyLmhlaWdodF09XCJoZWlnaHRcIlxyXG4gICAgPlxyXG4gICAgICA8cGF0aCAqbmdGb3I9XCJsZXQgcCBvZiBpY28ucGF0aFwiIFtvdXRlckhUTUxdPVwicCB8IHNhZmVIdG1sXCIvPlxyXG4gICAgPC9zdmc+XHJcbiAgYCxcclxuICBob3N0OiB7XHJcbiAgICAnW3N0eWxlLndpZHRoXSc6XCInY2FsYygnICsgaGVpZ2h0ICsgJyonICsgcHJvcG9ydGlvbiArICcqMiknXCIsXHJcbiAgICAnW3N0eWxlLmhlaWdodF0nOlwiJ2NhbGMoJyArIGhlaWdodCArICcqJyArIHByb3BvcnRpb24gKyAnICsgJyArIGhlaWdodCArICcpJ1wiLFxyXG4gIH0sXHJcbiAgc3R5bGVzOiBbXHJcbiAgICAnOmhvc3Qge2Rpc3BsYXk6IGlubGluZS1mbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgYWxpZ24taXRlbXM6IGNlbnRlcn0nXHJcbiAgXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgRm5JY29uSW5zdENvbXBvbmVudCB7XHJcbiAgQElucHV0KCkgaWNvOiBhbnkgPSB7XHJcbiAgICB2aWV3Qm94OiAnMCAwIDY0MCA1MTInLFxyXG4gICAgcGF0aDogWyc8cGF0aCBmaWxsPVwiIzBmMmM1MlwiIGQ9XCJNMzEzLjEgNTExLjJsLTI4OC02My4xQzEwLjQyIDQ0My4xIDAgNDMwLjEgMCA0MTZWNjQuMDFDMCA0My4xOSAxOS41NiAyNy45MiAzOS43NiAzMi45N0w2NCAzOS4wM3YzMjUuNmMwIDE0LjEgMTAuNDIgMjcuOTggMjUuMDYgMzEuMjRMMzIwIDQ0Ny4ybDIzMC45LTUxLjMyQzU2NS42IDM5Mi42IDU3NiAzNzkuNyA1NzYgMzY0LjdWMzkuMDNsMjQuMjQtNi4wNThDNjIwLjQgMjcuOTIgNjQwIDQzLjE5IDY0MCA2NC4wMXYzNTEuMWMwIDE0LjEtMTAuNDIgMjcuOTktMjUuMDYgMzEuMjRsLTI4OCA2My4xQzMyMi40IDUxMi4zIDMxNy42IDUxMi4zIDMxMy4xIDUxMS4yelwiLz4nLCc8cGF0aCBmaWxsPVwiI2Q5YTkyN1wiIGQ9XCJNNjQgMzIuNHYzMjMuMUwzMDQgNDE2VjQwLjAyTDEwMC45IC4zODc5QzgxLjUtMi42NDkgNjQgMTIuNTQgNjQgMzIuNHpNNTM5LjEgLjM4NzlMMzM2IDQwLjAyVjQxNmwyNDAtNTkuNjJWMzIuNEM1NzYgMTIuNTQgNTU4LjUtMi42NDkgNTM5LjEgLjM4Nzl6XCIvPiddXHJcbiAgfTtcclxuICBASW5wdXQoKSBoZWlnaHQ6IHN0cmluZyA9IFwiM3JlbVwiO1xyXG5cclxuICBhcnJWaWV3Qm94ID0gdGhpcy5pY28udmlld0JveC5zcGxpdCgnICcpXHJcbiAgcHJvcG9ydGlvbiA9IHRoaXMuYXJyVmlld0JveFsyXS90aGlzLmFyclZpZXdCb3hbM11cclxuXHJcbn1cclxuIl19