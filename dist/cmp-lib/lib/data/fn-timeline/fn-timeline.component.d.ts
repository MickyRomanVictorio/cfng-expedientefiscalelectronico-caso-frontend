import { OnInit } from '@angular/core';
import * as i0 from "@angular/core";
type OrientationType = 'horizontal' | 'vertical';
export declare class FnTimelineComponent implements OnInit {
    items: string[];
    currentIndex: number;
    orientation: OrientationType;
    maxWidth: number;
    currentOrientation: OrientationType;
    constructor();
    ngOnInit(): void;
    onResize(event: Event): void;
    private checkWindowSize;
    static ɵfac: i0.ɵɵFactoryDeclaration<FnTimelineComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FnTimelineComponent, "fn-timeline", never, { "items": { "alias": "items"; "required": false; }; "currentIndex": { "alias": "currentIndex"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "maxWidth": { "alias": "maxWidth"; "required": false; }; }, {}, never, never, false, never>;
}
export {};
