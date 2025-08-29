import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { CmpLibComponent } from './cmp-lib.component';
import { IconComponent } from './icon/icon.component';
import { CommonModule } from '@angular/common';
// import { HttpClientModule } from "@angular/common/http";
//primeng
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from "primeng/fileupload";
//mpfn components
// import { InputFnComponent } from './form/input-fn/input-fn.component';
import { FnDataFieldComponent } from './data/fn-data-field/fn-data-field.component';
import { FnTableBtnComponent } from './button/fn-table-btn/fn-table-btn.component';
import { FnTxtLogoComponent } from './icon/fn-txt-logo/fn-txt-logo.component';
import { InputWrapperComponent } from './form/input-wrapper/input-wrapper.component';
import { FnIconInstComponent } from './icon/fn-icon-inst/fn-icon-inst.component';
//pipe
import { SafeHtmlPipe } from './shared/pipes/safe-html.pipe';
import { FnInputComponent } from './form/fn-input/fn-input.component';
import { FnFileUploadComponent } from './file/fn-file-upload/fn-file-upload.component';
import { FnTimelineComponent } from './data/fn-timeline/fn-timeline.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import * as i0 from "@angular/core";
export class CmpLibModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: CmpLibModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.1.3", ngImport: i0, type: CmpLibModule, declarations: [CmpLibComponent,
            IconComponent,
            FnDataFieldComponent,
            FnTableBtnComponent,
            FnTxtLogoComponent,
            InputWrapperComponent,
            FnIconInstComponent,
            SafeHtmlPipe,
            FnInputComponent,
            FnFileUploadComponent,
            FnTimelineComponent], imports: [CommonModule,
            FormsModule,
            InputTextModule,
            ButtonModule,
            FileUploadModule,
            RadioButtonModule,
            DropdownModule
            // HttpClientModule
        ], exports: [CmpLibComponent,
            IconComponent,
            FnDataFieldComponent,
            FnTableBtnComponent,
            FnTxtLogoComponent,
            InputWrapperComponent,
            FnIconInstComponent,
            SafeHtmlPipe,
            FnInputComponent,
            FnFileUploadComponent,
            FnTimelineComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: CmpLibModule, imports: [CommonModule,
            FormsModule,
            InputTextModule,
            ButtonModule,
            FileUploadModule,
            RadioButtonModule,
            DropdownModule
            // HttpClientModule
        ] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: CmpLibModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        CmpLibComponent,
                        IconComponent,
                        FnDataFieldComponent,
                        FnTableBtnComponent,
                        FnTxtLogoComponent,
                        InputWrapperComponent,
                        FnIconInstComponent,
                        SafeHtmlPipe,
                        FnInputComponent,
                        FnFileUploadComponent,
                        FnTimelineComponent,
                    ],
                    imports: [
                        CommonModule,
                        FormsModule,
                        InputTextModule,
                        ButtonModule,
                        FileUploadModule,
                        RadioButtonModule,
                        DropdownModule
                        // HttpClientModule
                    ],
                    exports: [
                        CmpLibComponent,
                        IconComponent,
                        FnDataFieldComponent,
                        FnTableBtnComponent,
                        FnTxtLogoComponent,
                        InputWrapperComponent,
                        FnIconInstComponent,
                        SafeHtmlPipe,
                        FnInputComponent,
                        FnFileUploadComponent,
                        FnTimelineComponent
                    ]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21wLWxpYi5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9jbXAtbGliL3NyYy9saWIvY21wLWxpYi5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDN0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsMkRBQTJEO0FBQzNELFNBQVM7QUFDVCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3RELGlCQUFpQjtBQUNqQix5RUFBeUU7QUFDekUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDcEYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDbkYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDckYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDakYsTUFBTTtBQUNOLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUM3RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUN2RixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7O0FBd0NsRCxNQUFNLE9BQU8sWUFBWTs4R0FBWixZQUFZOytHQUFaLFlBQVksaUJBcENyQixlQUFlO1lBQ2YsYUFBYTtZQUNiLG9CQUFvQjtZQUNwQixtQkFBbUI7WUFDbkIsa0JBQWtCO1lBQ2xCLHFCQUFxQjtZQUNyQixtQkFBbUI7WUFDbkIsWUFBWTtZQUNaLGdCQUFnQjtZQUNoQixxQkFBcUI7WUFDckIsbUJBQW1CLGFBR25CLFlBQVk7WUFDWixXQUFXO1lBQ1gsZUFBZTtZQUNmLFlBQVk7WUFDWixnQkFBZ0I7WUFDaEIsaUJBQWlCO1lBQ2pCLGNBQWM7WUFDZCxtQkFBbUI7cUJBR25CLGVBQWU7WUFDZixhQUFhO1lBQ2Isb0JBQW9CO1lBQ3BCLG1CQUFtQjtZQUNuQixrQkFBa0I7WUFDbEIscUJBQXFCO1lBQ3JCLG1CQUFtQjtZQUNuQixZQUFZO1lBQ1osZ0JBQWdCO1lBQ2hCLHFCQUFxQjtZQUNyQixtQkFBbUI7K0dBR1YsWUFBWSxZQXZCckIsWUFBWTtZQUNaLFdBQVc7WUFDWCxlQUFlO1lBQ2YsWUFBWTtZQUNaLGdCQUFnQjtZQUNoQixpQkFBaUI7WUFDakIsY0FBYztZQUNkLG1CQUFtQjs7OzJGQWdCVixZQUFZO2tCQXRDeEIsUUFBUTttQkFBQztvQkFDUixZQUFZLEVBQUU7d0JBQ1osZUFBZTt3QkFDZixhQUFhO3dCQUNiLG9CQUFvQjt3QkFDcEIsbUJBQW1CO3dCQUNuQixrQkFBa0I7d0JBQ2xCLHFCQUFxQjt3QkFDckIsbUJBQW1CO3dCQUNuQixZQUFZO3dCQUNaLGdCQUFnQjt3QkFDaEIscUJBQXFCO3dCQUNyQixtQkFBbUI7cUJBQ3BCO29CQUNELE9BQU8sRUFBRTt3QkFDUCxZQUFZO3dCQUNaLFdBQVc7d0JBQ1gsZUFBZTt3QkFDZixZQUFZO3dCQUNaLGdCQUFnQjt3QkFDaEIsaUJBQWlCO3dCQUNqQixjQUFjO3dCQUNkLG1CQUFtQjtxQkFDcEI7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLGVBQWU7d0JBQ2YsYUFBYTt3QkFDYixvQkFBb0I7d0JBQ3BCLG1CQUFtQjt3QkFDbkIsa0JBQWtCO3dCQUNsQixxQkFBcUI7d0JBQ3JCLG1CQUFtQjt3QkFDbkIsWUFBWTt3QkFDWixnQkFBZ0I7d0JBQ2hCLHFCQUFxQjt3QkFDckIsbUJBQW1CO3FCQUNwQjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEZvcm1zTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XHJcbmltcG9ydCB7IENtcExpYkNvbXBvbmVudCB9IGZyb20gJy4vY21wLWxpYi5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBJY29uQ29tcG9uZW50IH0gZnJvbSAnLi9pY29uL2ljb24uY29tcG9uZW50JztcclxuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuLy8gaW1wb3J0IHsgSHR0cENsaWVudE1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xyXG4vL3ByaW1lbmdcclxuaW1wb3J0IHsgSW5wdXRUZXh0TW9kdWxlIH0gZnJvbSBcInByaW1lbmcvaW5wdXR0ZXh0XCI7XHJcbmltcG9ydCB7QnV0dG9uTW9kdWxlfSBmcm9tICdwcmltZW5nL2J1dHRvbic7XHJcbmltcG9ydCB7IEZpbGVVcGxvYWRNb2R1bGUgfSBmcm9tIFwicHJpbWVuZy9maWxldXBsb2FkXCI7XHJcbi8vbXBmbiBjb21wb25lbnRzXHJcbi8vIGltcG9ydCB7IElucHV0Rm5Db21wb25lbnQgfSBmcm9tICcuL2Zvcm0vaW5wdXQtZm4vaW5wdXQtZm4uY29tcG9uZW50JztcclxuaW1wb3J0IHsgRm5EYXRhRmllbGRDb21wb25lbnQgfSBmcm9tICcuL2RhdGEvZm4tZGF0YS1maWVsZC9mbi1kYXRhLWZpZWxkLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IEZuVGFibGVCdG5Db21wb25lbnQgfSBmcm9tICcuL2J1dHRvbi9mbi10YWJsZS1idG4vZm4tdGFibGUtYnRuLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IEZuVHh0TG9nb0NvbXBvbmVudCB9IGZyb20gJy4vaWNvbi9mbi10eHQtbG9nby9mbi10eHQtbG9nby5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBJbnB1dFdyYXBwZXJDb21wb25lbnQgfSBmcm9tICcuL2Zvcm0vaW5wdXQtd3JhcHBlci9pbnB1dC13cmFwcGVyLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IEZuSWNvbkluc3RDb21wb25lbnQgfSBmcm9tICcuL2ljb24vZm4taWNvbi1pbnN0L2ZuLWljb24taW5zdC5jb21wb25lbnQnO1xyXG4vL3BpcGVcclxuaW1wb3J0IHsgU2FmZUh0bWxQaXBlIH0gZnJvbSAnLi9zaGFyZWQvcGlwZXMvc2FmZS1odG1sLnBpcGUnO1xyXG5pbXBvcnQgeyBGbklucHV0Q29tcG9uZW50IH0gZnJvbSAnLi9mb3JtL2ZuLWlucHV0L2ZuLWlucHV0LmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IEZuRmlsZVVwbG9hZENvbXBvbmVudCB9IGZyb20gJy4vZmlsZS9mbi1maWxlLXVwbG9hZC9mbi1maWxlLXVwbG9hZC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBGblRpbWVsaW5lQ29tcG9uZW50IH0gZnJvbSAnLi9kYXRhL2ZuLXRpbWVsaW5lL2ZuLXRpbWVsaW5lLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFJhZGlvQnV0dG9uTW9kdWxlIH0gZnJvbSAncHJpbWVuZy9yYWRpb2J1dHRvbic7XHJcbmltcG9ydCB7IERyb3Bkb3duTW9kdWxlIH0gZnJvbSAncHJpbWVuZy9kcm9wZG93bic7XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gIGRlY2xhcmF0aW9uczogW1xyXG4gICAgQ21wTGliQ29tcG9uZW50LFxyXG4gICAgSWNvbkNvbXBvbmVudCxcclxuICAgIEZuRGF0YUZpZWxkQ29tcG9uZW50LFxyXG4gICAgRm5UYWJsZUJ0bkNvbXBvbmVudCxcclxuICAgIEZuVHh0TG9nb0NvbXBvbmVudCxcclxuICAgIElucHV0V3JhcHBlckNvbXBvbmVudCxcclxuICAgIEZuSWNvbkluc3RDb21wb25lbnQsXHJcbiAgICBTYWZlSHRtbFBpcGUsXHJcbiAgICBGbklucHV0Q29tcG9uZW50LFxyXG4gICAgRm5GaWxlVXBsb2FkQ29tcG9uZW50LFxyXG4gICAgRm5UaW1lbGluZUNvbXBvbmVudCxcclxuICBdLFxyXG4gIGltcG9ydHM6IFtcclxuICAgIENvbW1vbk1vZHVsZSxcclxuICAgIEZvcm1zTW9kdWxlLFxyXG4gICAgSW5wdXRUZXh0TW9kdWxlLFxyXG4gICAgQnV0dG9uTW9kdWxlLFxyXG4gICAgRmlsZVVwbG9hZE1vZHVsZSxcclxuICAgIFJhZGlvQnV0dG9uTW9kdWxlLFxyXG4gICAgRHJvcGRvd25Nb2R1bGVcclxuICAgIC8vIEh0dHBDbGllbnRNb2R1bGVcclxuICBdLFxyXG4gIGV4cG9ydHM6IFtcclxuICAgIENtcExpYkNvbXBvbmVudCxcclxuICAgIEljb25Db21wb25lbnQsXHJcbiAgICBGbkRhdGFGaWVsZENvbXBvbmVudCxcclxuICAgIEZuVGFibGVCdG5Db21wb25lbnQsXHJcbiAgICBGblR4dExvZ29Db21wb25lbnQsXHJcbiAgICBJbnB1dFdyYXBwZXJDb21wb25lbnQsXHJcbiAgICBGbkljb25JbnN0Q29tcG9uZW50LFxyXG4gICAgU2FmZUh0bWxQaXBlLFxyXG4gICAgRm5JbnB1dENvbXBvbmVudCxcclxuICAgIEZuRmlsZVVwbG9hZENvbXBvbmVudCxcclxuICAgIEZuVGltZWxpbmVDb21wb25lbnRcclxuICBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDbXBMaWJNb2R1bGUgeyB9XHJcbiJdfQ==