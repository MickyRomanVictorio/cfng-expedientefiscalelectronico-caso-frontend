import { CommonModule, DatePipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { CmpLibModule } from 'dist/cmp-lib';
import { DateFormatPipe } from 'ngx-cfng-core-lib';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { of } from 'rxjs';
import { ElevacionActuadosComponent } from './elevacion-actuados.component';


describe('ElevacionActuadosComponent', () => {

  let component: any;
  let fixture: ComponentFixture<ElevacionActuadosComponent>;

  beforeEach(async () => {
    //
    const mockToken = JSON.stringify({token:'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0NTI1OTAwOSIsImlzcyI6Imh0dHA6Ly9jZm1zLXNhZC1hZG1pbmlzdHJhY2lvbi1nZXN0aW9uLWFwaS1kZXZlbG9wbWVudC5hcHBzLmRldi5vY3A0LmNmZS5tcGZuLmdvYi5wZS9jZmUvc2FkL2FkbWluaXN0cmFjaW9uL3YxL2Uvc2VzaW9uL3Rva2VuU2VzaW9uLW5ldyIsImlwIjoiMTkyLjE2OC4xMzAuMSIsInVzdWFyaW8iOnsiZXN0YWRvIjoiMSIsImlwIjoiMTkyLjE2OC4xMzAuMSIsInVzdWFyaW8iOiI0NTI1OTAwOSIsImluZm8iOnsiYXBlbGxpZG9QYXRlcm5vIjoiVkVOVFVSTyIsImVzUHJpbWVyTG9naW4iOmZhbHNlLCJjb2RpZ29UaXBvRG9jdW1lbnRvIjoiMDAxIiwidGlwb0RvY3VtZW50byI6IkROSSIsImRuaSI6IjQ1MjU5MDA5Iiwibm9tYnJlcyI6IlJPTkFMRCBIRVJCRVJUIiwiYXBlbGxpZG9NYXRlcm5vIjoiUk9KQVMifSwiY29kRGVwZW5kZW5jaWEiOiI0MDA1MDE0NTAxIiwiZGVwZW5kZW5jaWEiOiIwMcK6IEZJU0NBTElBIFNVUEVSSU9SIFBFTkFMIERFIFZFTlRBTklMTEEiLCJjb2REZXNwYWNobyI6IjQwMDUwMTQ1MDEtMSIsInNlZGUiOiIyIHkgMyBGaXNjYWxpYSBNaXh0YSBkZSBWZW50YW5pbGxhIiwiZGVzcGFjaG8iOiIxRVIgREVTUEFDSE8iLCJjb2RDYXJnbyI6IjAwMDAwMDA2IiwiY29kU2VkZSI6IjE1NCIsImNhcmdvIjoiRklTQ0FMIFNVUEVSSU9SIG1vZGlmY2FkbyIsImNvZERpc3RyaXRvRmlzY2FsIjoiNDciLCJkaXN0cml0b0Zpc2NhbCI6IkxJTUEgTk9ST0VTVEUiLCJkbmlGaXNjYWwiOiI0NTI1OTAwOSIsImRpcmVjY2lvbiI6IiAiLCJmaXNjYWwiOiJST05BTEQgSEVSQkVSVCBWRU5UVVJPIFJPSkFTIiwiY29ycmVvRmlzY2FsIjpudWxsLCJjb2RKZXJhcnF1aWEiOiIwMiIsImNvZENhdGVnb3JpYSI6IjAxIiwiY29kRXNwZWNpYWxpZGFkIjoiMDE1IiwidWJpZ2VvIjoiICIsImRpc3RyaXRvIjoiTElNQSBOT1JPRVNURSIsImNvcnJlbyI6bnVsbCwidGVsZWZvbm8iOiIgIiwic2lzdGVtYXMiOlt7ImNvZGlnbyI6IjE0NSIsIm9wY2lvbmVzIjpbIjI1IiwiMjYiLCIyOCIsIjMxIiwiNTAiLCIyMiIsIjIzIiwiMjQiLCI1MiIsIjQ2IiwiNDAiLCIxMjMiLCIyIiwiMzk4Mzg3OTQ4NyIsIjAwMSIsIjEyMzQ1IiwiNjY2NiJdLCJwZXJmaWxlcyI6W251bGwsIjAzIl19LHsiY29kaWdvIjoiMDAwMSIsIm9wY2lvbmVzIjpbIjAwMTAiLCIxNTUiLCIyMDAiLCIxNDciLCIwMDA2IiwiMTQ1IiwiMDAwOCIsIjAwMDkiXSwicGVyZmlsZXMiOltudWxsXX1dfSwiaWF0IjoxNzI4NTY5NjQ3LCJleHAiOjE3Mjg2MzAwMDB9.XP8ZiMZSizPtvJ-3LLKxsAhKJYgR50A5jZU-Z9T1wv9SgDKzgag7R-27kG185HgdbDVIHDaJ73-bYfV_Mz2J3g'});
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
      return mockToken;
    });
    //

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: () => 'mockId'  // Simula un parámetro de la ruta si es necesario
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        ElevacionActuadosComponent,
        CommonModule,
        ReactiveFormsModule,
        CmpLibModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        RadioButtonModule,
        CalendarModule,
        DateMaskModule,
        PaginatorComponent,
        DateFormatPipe,
        TableModule,
        ProgressBarModule,
        MenuModule
      ], providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        JwtHelperService,
        provideHttpClient(),
        MessageService, DialogService, DatePipe
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElevacionActuadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Crear componente', () => {
    expect(component).toBeTruthy();
  });

  it('Suscribirse a elevacionActuadosService en elevaciones actuadas correctamente', () => {
    const mockData = {
      idCaso: 'mockIdCaso',
      idTipoElevacion: 'mockIdTipoElevacion',
      idActoTramiteCaso: 'mockIdActoTramiteCaso'
    };

    component.ngOnInit();

    const opciones = component['opcionesFila'](mockData);

    expect(opciones).toBeDefined();
    expect(opciones.length).toBeGreaterThan(0);
    expect(opciones[0].command).toBeDefined();

  });


});
