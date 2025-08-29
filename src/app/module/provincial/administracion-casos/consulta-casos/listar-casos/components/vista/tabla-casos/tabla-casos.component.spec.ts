import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Constants } from 'ngx-cfng-core-lib';
import { JwtHelperService } from '@auth0/angular-jwt';
import { of } from 'rxjs';
import { TablaCasosComponent } from './tabla-casos.component';
import { DialogService } from 'primeng/dynamicdialog';


describe('FiltrarConsultaCasoComponent', () => {

  let component: TablaCasosComponent;
  let fixture: ComponentFixture<TablaCasosComponent>;

  beforeEach(async () => {
    //
    const mockToken = JSON.stringify({token:'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0NTI1OTAwOSIsImlzcyI6Imh0dHA6Ly9jZm1zLXNhZC1hZG1pbmlzdHJhY2lvbi1nZXN0aW9uLWFwaS1kZXZlbG9wbWVudC5hcHBzLmRldi5vY3A0LmNmZS5tcGZuLmdvYi5wZS9jZmUvc2FkL2FkbWluaXN0cmFjaW9uL3YxL2Uvc2VzaW9uL3Rva2VuU2VzaW9uLW5ldyIsImlwIjoiMTkyLjE2OC4xMzAuMSIsInVzdWFyaW8iOnsiZXN0YWRvIjoiMSIsImlwIjoiMTkyLjE2OC4xMzAuMSIsInVzdWFyaW8iOiI0NTI1OTAwOSIsImluZm8iOnsiYXBlbGxpZG9QYXRlcm5vIjoiVkVOVFVSTyIsImVzUHJpbWVyTG9naW4iOmZhbHNlLCJjb2RpZ29UaXBvRG9jdW1lbnRvIjoiMDAxIiwidGlwb0RvY3VtZW50byI6IkROSSIsImRuaSI6IjQ1MjU5MDA5Iiwibm9tYnJlcyI6IlJPTkFMRCBIRVJCRVJUIiwiYXBlbGxpZG9NYXRlcm5vIjoiUk9KQVMifSwiY29kRGVwZW5kZW5jaWEiOiI0MDA1MDE0NTAxIiwiZGVwZW5kZW5jaWEiOiIwMcK6IEZJU0NBTElBIFNVUEVSSU9SIFBFTkFMIERFIFZFTlRBTklMTEEiLCJjb2REZXNwYWNobyI6IjQwMDUwMTQ1MDEtMSIsInNlZGUiOiIyIHkgMyBGaXNjYWxpYSBNaXh0YSBkZSBWZW50YW5pbGxhIiwiZGVzcGFjaG8iOiIxRVIgREVTUEFDSE8iLCJjb2RDYXJnbyI6IjAwMDAwMDA2IiwiY29kU2VkZSI6IjE1NCIsImNhcmdvIjoiRklTQ0FMIFNVUEVSSU9SIG1vZGlmY2FkbyIsImNvZERpc3RyaXRvRmlzY2FsIjoiNDciLCJkaXN0cml0b0Zpc2NhbCI6IkxJTUEgTk9ST0VTVEUiLCJkbmlGaXNjYWwiOiI0NTI1OTAwOSIsImRpcmVjY2lvbiI6IiAiLCJmaXNjYWwiOiJST05BTEQgSEVSQkVSVCBWRU5UVVJPIFJPSkFTIiwiY29ycmVvRmlzY2FsIjpudWxsLCJjb2RKZXJhcnF1aWEiOiIwMiIsImNvZENhdGVnb3JpYSI6IjAxIiwiY29kRXNwZWNpYWxpZGFkIjoiMDE1IiwidWJpZ2VvIjoiICIsImRpc3RyaXRvIjoiTElNQSBOT1JPRVNURSIsImNvcnJlbyI6bnVsbCwidGVsZWZvbm8iOiIgIiwic2lzdGVtYXMiOlt7ImNvZGlnbyI6IjE0NSIsIm9wY2lvbmVzIjpbIjI1IiwiMjYiLCIyOCIsIjMxIiwiNTAiLCIyMiIsIjIzIiwiMjQiLCI1MiIsIjQ2IiwiNDAiLCIxMjMiLCIyIiwiMzk4Mzg3OTQ4NyIsIjAwMSIsIjEyMzQ1IiwiNjY2NiJdLCJwZXJmaWxlcyI6W251bGwsIjAzIl19LHsiY29kaWdvIjoiMDAwMSIsIm9wY2lvbmVzIjpbIjAwMTAiLCIxNTUiLCIyMDAiLCIxNDciLCIwMDA2IiwiMTQ1IiwiMDAwOCIsIjAwMDkiXSwicGVyZmlsZXMiOltudWxsXX1dfSwiaWF0IjoxNzI4NTY5NjQ3LCJleHAiOjE3Mjg2MzAwMDB9.XP8ZiMZSizPtvJ-3LLKxsAhKJYgR50A5jZU-Z9T1wv9SgDKzgag7R-27kG185HgdbDVIHDaJ73-bYfV_Mz2J3g'});
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
      if (key === Constants.TOKEN_NAME) {
        return mockToken;
      }
      return null;
    });
    //
    await TestBed.configureTestingModule({
      imports: [
        TablaCasosComponent
      ], providers: [
        JwtHelperService,
        DialogService,
        provideHttpClient()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaCasosComponent);
    component = fixture.componentInstance;
    component.paginacionCondicion = { limit: 9, page: 1, where: {} };
    component.paginacionConfiguracion = {
      isLoading: false,
      data: {
        data: [],
        pages: 0,
        perPage: 0,
        total: 0,
      },
    };

    fixture.detectChanges();
  });

  it('Crear componente', () => {
    expect(component).toBeTruthy();
  });

});
