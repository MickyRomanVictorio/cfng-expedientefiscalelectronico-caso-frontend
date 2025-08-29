import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltrarConsultaCasoComponent } from './filtrar-consulta-caso.component';
import { TipoVistaEnum } from '../../models/listar-casos.model';
import { provideHttpClient } from '@angular/common/http';
import { Constants } from 'ngx-cfng-core-lib';
import { JwtHelperService } from '@auth0/angular-jwt';
import { of } from 'rxjs';


describe('FiltrarConsultaCasoComponent', () => {

  let component: FiltrarConsultaCasoComponent;
  let fixture: ComponentFixture<FiltrarConsultaCasoComponent>;

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
        FiltrarConsultaCasoComponent
      ], providers: [
        JwtHelperService,
        provideHttpClient()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltrarConsultaCasoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Crear componente', () => {
    expect(component).toBeTruthy();
  });

  it('Vista de tipo Grilla', () => {
    expect(component.tipoVista).toBe(TipoVistaEnum.Grilla);
  });

  it('Formulario con valores por defecto', () => {
    const formulario = (component as any).form;
    expect(formulario).toBeTruthy();
    expect(formulario.get('filtroTiempo')?.value).toBe('0');
    expect(formulario.get('tipoFecha')?.value).toBe('0');
  });

  it('Emitir el evento buscar con los valores del formulario', () => {
    spyOn(component.buscar, 'emit');

    (component as any).eventoBuscar();

    expect(component.buscar.emit).toHaveBeenCalledWith(jasmine.any(Object)); // Verifica que se emite un objeto
  });

  it('Emitir el evento buscarPorTexto después del temporizador', (done) => {
    spyOn(component.buscarPorTexto, 'emit');
    (component as any).form.get('buscar')?.setValue('prueba');
    (component as any).eventoBuscarSegunTexto();
    setTimeout(() => {
      expect(component.buscarPorTexto.emit).toHaveBeenCalledWith('prueba');
      done();
    }, 500); // Espera un poco más que el debounce de 400ms
  });

  it('Llamar a obtenerFiscaliasXEntidad y obtenerTipoProceso al inicializar', () => {
    spyOn(component as any, 'obtenerFiscaliasXEntidad');
    spyOn(component as any, 'obtenerTipoProceso');

    component.ngOnInit();

    expect((component as any).obtenerFiscaliasXEntidad).toHaveBeenCalled();
    expect((component as any).obtenerTipoProceso).toHaveBeenCalled();
  });

  it('Visibilidad de filtros cuando se llame a eventoMostrarOcultarFiltros', () => {
    (component as any).esVisibleFiltros = false;
    (component as any).eventoMostrarOcultarFiltros();
    expect((component as any).esVisibleFiltros).toBeTrue();

    (component as any).eventoMostrarOcultarFiltros();

    expect((component as any).esVisibleFiltros).toBeFalse();
  });

  it('Resetear subtipoProceso, etapa, actoProcesal y tramite al cambiar el tipo de proceso', () => {
    spyOn(component as any, 'resetearSubtipoProceso');
    spyOn(component as any, 'resetearEtapa');
    spyOn(component as any, 'resetearActoProcesal');
    spyOn(component as any, 'resetearTramite');

    (component as any).eventoCambiarTipoProceso(1);

    expect((component as any).resetearSubtipoProceso).toHaveBeenCalled();
    expect((component as any).resetearEtapa).toHaveBeenCalled();
    expect((component as any).resetearActoProcesal).toHaveBeenCalled();
    expect((component as any).resetearTramite).toHaveBeenCalled();
  });

  it('Suscribirse a obtenerTipoProceso correctamente', () => {
    const maestroServiceSpy = spyOn(component['maestrosService'], 'obtenerTipoProceso').and.returnValue(of({
      data: [{ id: 1, nombre: 'Proceso 1' }]
    }));
    component['obtenerTipoProceso']();
    expect(maestroServiceSpy).toHaveBeenCalled();
  });

});
