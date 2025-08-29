import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Constants } from 'ngx-cfng-core-lib';
import { AutoRechazaConclusionAnticipadaComponent } from './auto-rechaza-conclusion-anticipada.component';

describe('AutoRechazaConclusionAnticipadaComponent', () => {
  let component: AutoRechazaConclusionAnticipadaComponent;
  let fixture: ComponentFixture<AutoRechazaConclusionAnticipadaComponent>;

  beforeEach(async () => {
    const mockToken = JSON.stringify({
      token:
        'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIzMjkyMDU4OSIsImlzcyI6Imh0dHA6Ly9jZm1zLXNhZC1hZG1pbmlzdHJhY2lvbi1nZXN0aW9uLWFwaS1kZXZlbG9wbWVudC5hcHBzLmRldi5vY3A0LmNmZS5tcGZuLmdvYi5wZS9jZmUvc2FkL2FkbWluaXN0cmFjaW9uL3YxL2Uvc2VzaW9uL3Rva2VuU2VzaW9uLW5ldyIsImlwIjoiMTkyLjE2OC4xMzAuMSIsInVzdWFyaW8iOnsiZXN0YWRvIjoiMSIsImlwIjoiMTkyLjE2OC4xMzAuMSIsInVzdWFyaW8iOiIzMjkyMDU4OSIsImluZm8iOnsiYXBlbGxpZG9QYXRlcm5vIjoiUElOSUxMT1MiLCJlc1ByaW1lckxvZ2luIjp0cnVlLCJjb2RpZ29UaXBvRG9jdW1lbnRvIjoiMDAxIiwidGlwb0RvY3VtZW50byI6IkROSSIsImRuaSI6IjMyOTIwNTg5Iiwibm9tYnJlcyI6IkdJTEJFUlRPIE9TQ0FSIiwiYXBlbGxpZG9NYXRlcm5vIjoiQ0FESUxMTyJ9LCJjb2REZXBlbmRlbmNpYSI6IjQwMDYwMTQ1MDEiLCJkZXBlbmRlbmNpYSI6IjHCsCBGSVNDQUxJQSBQUk9WSU5DSUFMIFBFTkFMIENPUlBPUkFUSVZBIERFIFZFTlRBTklMTEEiLCJjb2REZXNwYWNobyI6IjQwMDYwMTQ1MDEtNCIsInNlZGUiOiIxwrAgRmlzY2FsaWEgUHJvdmluY2lhbCBNaXh0YSBkZSBWZW50YW5pbGxhIiwiZGVzcGFjaG8iOiI0VE8gREVTUEFDSE8iLCJjb2RDYXJnbyI6IkZQIiwiY29kU2VkZSI6IjE2MCIsImNhcmdvIjoiRklTQ0FMIFBST1ZJTkNJQUwiLCJjb2REaXN0cml0b0Zpc2NhbCI6IjQ3IiwiZGlzdHJpdG9GaXNjYWwiOiJMSU1BIE5PUk9FU1RFIiwiZG5pRmlzY2FsIjoiMzI5MjA1ODkiLCJkaXJlY2Npb24iOiIgIiwiZmlzY2FsIjoiR0lMQkVSVE8gT1NDQVIgUElOSUxMT1MgQ0FESUxMTyIsImNvcnJlb0Zpc2NhbCI6Imd1aWRvbWdtQGdtYWlsLmNvbSIsImNvZEplcmFycXVpYSI6IjAxIiwiY29kQ2F0ZWdvcmlhIjoiMDEiLCJjb2RFc3BlY2lhbGlkYWQiOiIwMDEiLCJ1YmlnZW8iOiIgIiwiZGlzdHJpdG8iOiJMSU1BIE5PUk9FU1RFIiwiY29ycmVvIjoiZ3VpZG9tZ21AZ21haWwuY29tIiwidGVsZWZvbm8iOiIgIiwic2lzdGVtYXMiOlt7ImNvZGlnbyI6IjE0NSIsIm9wY2lvbmVzIjpbIjI1IiwiMjYiLCIyOCIsIjMxIiwiNTAiLCIyMiIsIjIzIiwiMjQiLCI1MiIsIjQ2IiwiNDAiLCIxMjMiLCIyIiwiNDgzOTgzNDk4NDMiLCIzOTgzODc5NDg3IiwiMDAxIiwiMTIzNDUiLCIyNTQiLCI2NjY2IiwiMDk5ODg5NyJdLCJwZXJmaWxlcyI6W251bGwsIjAzIl19LHsiY29kaWdvIjoiMjAzIiwib3BjaW9uZXMiOlsiMjAzLTAxIiwiMjAzLTAyIiwiMDAxIiwiMDAyIl0sInBlcmZpbGVzIjpbIjYzIixudWxsXX0seyJjb2RpZ28iOiIwMDA4Iiwib3BjaW9uZXMiOlsiYXAwMSIsImFwMDExIiwiREVNTzEiLCJERU1PMiIsIkRFTU80IiwiMDAzIiwiMDEzIiwiNDIyNCIsIjAwMSIsIjg4NTU1NDc1IiwiMzQ1NSIsIjU2NTciLCIwMDIiLCIwMDQiLCIwMDUiLCIwMDYiLCIwMDciLCIwMDgiLCJDT0QyMyIsIkNPREUxIiwiUFJPRDEiLCIwMDEyIiwiMDAwNCIsIjAwMDkiLCI1NTU1NTUiLCJSRVAwMDEiLCJBQjAwMSIsIjEyMzMyMSIsIjU2NyIsIjAwMDExIiwiTk9ETzAwMSJdLCJwZXJmaWxlcyI6WyIwMDIiLCIwMDMiLCIwMDUiLCIwMDYiXX1dfSwiaWF0IjoxNzMwMzg4NDE0LCJleHAiOjE3MzA0NDQ0MDB9.Kuu9M4GO0g7EY9qtlEFU5eQEf4ttMY8bC9odaMVGk6TNiIBbklEdBpDfUW-y4hJUDBIxvT256VgR-PprMDFFZg',
    });
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
      if (key === Constants.TOKEN_NAME) {
        return mockToken;
      }
      return null;
    });

    await TestBed.configureTestingModule({
      imports: [AutoRechazaConclusionAnticipadaComponent],
      providers: [JwtHelperService, provideHttpClient()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoRechazaConclusionAnticipadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Crear componente', () => {
    expect(component).toBeTruthy();
  });
});
