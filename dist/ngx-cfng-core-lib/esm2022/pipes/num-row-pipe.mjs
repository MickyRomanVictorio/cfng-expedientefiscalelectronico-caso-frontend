import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
const CAN_CEROS = 3;
export class NumRowPipe {
    transform(row, param) {
        if (!param) {
            return String(row).padStart(CAN_CEROS, '0');
        }
        else if (param) {
            if (param.page == 1) {
                return String(row).padStart(CAN_CEROS, '0');
            }
            else if (param?.page > 1) {
                const num = (param.page - 1) * param.perPage + row;
                return String(num).padStart(CAN_CEROS, '0');
            }
            else {
                return String(1).padStart(CAN_CEROS, '0');
            }
        }
        return null;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: NumRowPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: NumRowPipe, isStandalone: true, name: "numrow" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: NumRowPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'numrow',
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtLXJvdy1waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWNmbmctY29yZS1saWIvcGlwZXMvbnVtLXJvdy1waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDOztBQUVwRCxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFNcEIsTUFBTSxPQUFPLFVBQVU7SUFDckIsU0FBUyxDQUNQLEdBQVcsRUFDWCxLQUF5QztRQUV6QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDWCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzlDLENBQUM7YUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ2pCLElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDcEIsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM5QyxDQUFDO2lCQUFNLElBQUksS0FBSyxFQUFFLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDM0IsTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO2dCQUNuRCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzlDLENBQUM7aUJBQU0sQ0FBQztnQkFDTixPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzVDLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDOzhHQW5CVSxVQUFVOzRHQUFWLFVBQVU7OzJGQUFWLFVBQVU7a0JBSnRCLElBQUk7bUJBQUM7b0JBQ0osSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5jb25zdCBDQU5fQ0VST1MgPSAzO1xuXG5AUGlwZSh7XG4gIG5hbWU6ICdudW1yb3cnLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBOdW1Sb3dQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybShcbiAgICByb3c6IG51bWJlcixcbiAgICBwYXJhbT86IHsgcGFnZTogbnVtYmVyOyBwZXJQYWdlOiBudW1iZXIgfVxuICApOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoIXBhcmFtKSB7XG4gICAgICByZXR1cm4gU3RyaW5nKHJvdykucGFkU3RhcnQoQ0FOX0NFUk9TLCAnMCcpO1xuICAgIH0gZWxzZSBpZiAocGFyYW0pIHtcbiAgICAgIGlmIChwYXJhbS5wYWdlID09IDEpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyhyb3cpLnBhZFN0YXJ0KENBTl9DRVJPUywgJzAnKTtcbiAgICAgIH0gZWxzZSBpZiAocGFyYW0/LnBhZ2UgPiAxKSB7XG4gICAgICAgIGNvbnN0IG51bSA9IChwYXJhbS5wYWdlIC0gMSkgKiBwYXJhbS5wZXJQYWdlICsgcm93O1xuICAgICAgICByZXR1cm4gU3RyaW5nKG51bSkucGFkU3RhcnQoQ0FOX0NFUk9TLCAnMCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZygxKS5wYWRTdGFydChDQU5fQ0VST1MsICcwJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==