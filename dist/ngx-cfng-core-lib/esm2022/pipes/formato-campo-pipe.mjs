import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class formatoCampoPipe {
    transform(value) {
        let texto = value;
        if (texto == '-') {
            return '';
        }
        else {
            return texto;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: formatoCampoPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: formatoCampoPipe, isStandalone: true, name: "formatoCampo" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: formatoCampoPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'formatoCampo',
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0by1jYW1wby1waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWNmbmctY29yZS1saWIvcGlwZXMvZm9ybWF0by1jYW1wby1waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDOztBQU1wRCxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFNBQVMsQ0FBQyxLQUFhO1FBQ3JCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNsQixJQUFJLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNqQixPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO0lBQ0gsQ0FBQzs4R0FSVSxnQkFBZ0I7NEdBQWhCLGdCQUFnQjs7MkZBQWhCLGdCQUFnQjtrQkFKNUIsSUFBSTttQkFBQztvQkFDSixJQUFJLEVBQUUsY0FBYztvQkFDcEIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5AUGlwZSh7XG4gIG5hbWU6ICdmb3JtYXRvQ2FtcG8nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBmb3JtYXRvQ2FtcG9QaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgdGV4dG8gPSB2YWx1ZTtcbiAgICBpZiAodGV4dG8gPT0gJy0nKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0ZXh0bztcbiAgICB9XG4gIH1cbn1cbiJdfQ==