import { AppRecursoApelacionSentenciaComponent } from './recurso-apelacion-sentencia.component';
import { of, throwError } from 'rxjs';
import { ESTADO_REGISTRO } from 'ngx-cfng-core-lib';

describe('AppRecursoApelacionSentenciaComponent', () => {
  let component: AppRecursoApelacionSentenciaComponent;
  let dialogServiceSpy: any;
  let spinnerSpy: any;
  let modalDialogServiceSpy: any;
  let tramiteServiceSpy: any;
  let recursoApelacionSentenciaSpy: any;
  let firmaIndividualServiceSpy: any;
  let resolucionAutoResuelveRequerimientoServiceSpy: any;

  beforeEach(() => {
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['open']);
    spinnerSpy = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    modalDialogServiceSpy = jasmine.createSpyObj('NgxCfngCoreModalDialogService', ['success']);
    tramiteServiceSpy = {
      habilitarGuardar: false,
      habilitarFirmar: false,
      formularioEditado: false,
    };
    recursoApelacionSentenciaSpy = jasmine.createSpyObj('RecursoApelacionSentenciaService', ['registrarTramite', 'obtenerResultadosSentencia']);
    firmaIndividualServiceSpy = {
      esFirmadoCompartidoObservable: of({ esFirmado: true })
    };
    resolucionAutoResuelveRequerimientoServiceSpy = jasmine.createSpyObj('ResolucionAutoResuelveRequerimientoService', ['obtenerSujetosProcesales']);

    component = new AppRecursoApelacionSentenciaComponent(
      {} as any,
      dialogServiceSpy,
      {} as any,
      resolucionAutoResuelveRequerimientoServiceSpy,
      spinnerSpy,
      modalDialogServiceSpy,
      tramiteServiceSpy,
      {} as any,
      recursoApelacionSentenciaSpy,
      firmaIndividualServiceSpy
    );
    // Set private variables using bracket notation
    (component as any).idCaso = '1';
    (component as any).idActoTramiteCaso = '2';
    (component as any).numeroCaso = '3';
    (component as any).tramiteSeleccionado = { nombreTramite: 'Trámite Test' } as any;
    (component as any).idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
    (component as any).selectedSujetos = [{ flApelacion: '1' }];
    (component as any).sujetosProcesales = [
      { flApelacion: '1' },
      { flApelacion: '0' }
    ];
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set soloLectura to true if esFirmado is true on ngOnInit', () => {
    (component as any).soloLectura = false;
    component.ngOnInit();
    expect((component as any).soloLectura).toBeTrue();
  });

  it('should unsubscribe on ngOnDestroy', () => {
    const subSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    (component as any).subscriptions = [subSpy];
    component.ngOnDestroy();
    expect(subSpy.unsubscribe).toHaveBeenCalled();
  });

  it('should return estadoRecibido true if idEstadoTramite is RECIBIDO', () => {
    (component as any).idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
    expect(component.estadoRecibido).toBeTrue();
  });

  it('should return icon path', () => {
    expect(component.icon('test')).toBe('assets/icons/test.svg');
  });

  it('should return iconButton success if formularioValido or soloLectura', () => {
    (component as any).selectedSujetos = [{ flApelacion: '1' }];
    expect(component.iconButton).toBe('success');
    (component as any).selectedSujetos = [];
    (component as any).soloLectura = true;
    expect(component.iconButton).toBe('success');
  });

  it('should return formularioValido true if selectedSujetos has items', () => {
    (component as any).selectedSujetos = [{ flApelacion: '1' }];
    expect(component.formularioValido).toBeTrue();
  });

  it('should return tramiteEstadoRecibido true if idEstadoRegistro is RECIBIDO', () => {
    (component as any).idEstadoRegistro = ESTADO_REGISTRO.RECIBIDO;
    expect(component.tramiteEstadoRecibido).toBeTrue();
  });

  it('should call obtenerSujetosProcesales and set sujetosProcesales', () => {
    recursoApelacionSentenciaSpy.obtenerResultadosSentencia.and.returnValue(of([{ flApelacion: '1' }]));
    (component as any).idActoTramiteCaso = '2';
    (component as any).obtenerSujetosProcesales();
    expect((component as any).sujetosProcesales.length).toBe(1);
    expect((component as any).sujetosProcesales[0].flApelacion).toBe('1');
  });

  it('should call obtenerDatosFormulario and set sujetosProcesales', () => {
    resolucionAutoResuelveRequerimientoServiceSpy.obtenerSujetosProcesales.and.returnValue(of([{ flApelacion: '1' }]));
    (component as any).idActoTramiteCaso = '2';
    (component as any).obtenerDatosFormulario();
    expect((component as any).sujetosProcesales.length).toBe(1);
    expect((component as any).sujetosProcesales[0].flApelacion).toBe('1');
  });

  it('should set habilitarGuardar and habilitarFirmar on guardarFormulario success', (done) => {
    recursoApelacionSentenciaSpy.registrarTramite.and.returnValue(of({ code: '0' }));
    (component as any).tramiteService.habilitarGuardar = true;
    (component as any).tramiteService.habilitarFirmar = false;
    component.guardarFormulario().subscribe(() => {
      expect((component as any).tramiteService.habilitarGuardar).toBeFalse();
      expect((component as any).tramiteService.habilitarFirmar).toBeTrue();
      expect(spinnerSpy.hide).toHaveBeenCalled();
      expect(modalDialogServiceSpy.success).toHaveBeenCalled();
      done();
    });
  });

  it('should handle error on guardarFormulario', (done) => {
    recursoApelacionSentenciaSpy.registrarTramite.and.returnValue(throwError(() => new Error('error')));
    component.guardarFormulario().subscribe({
      error: (err) => {
        expect(spinnerSpy.hide).toHaveBeenCalled();
        expect(err).toBeTruthy();
        done();
      }
    });
  });

  it('should update selectedSujetos and habilitarGuardar in validarHabilitarGuardar', () => {
    (component as any).sujetosProcesales = [
      { flApelacion: '1' },
      { flApelacion: '0' }
    ];
    (component as any).idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
    (component as any).validarHabilitarGuardar();
    expect((component as any).selectedSujetos.length).toBe(1);
    expect(tramiteServiceSpy.habilitarGuardar).toBeTrue();

    (component as any).sujetosProcesales = [{ flApelacion: '0' }];
    (component as any).validarHabilitarGuardar();
    expect(tramiteServiceSpy.habilitarGuardar).toBeFalse();
    expect(tramiteServiceSpy.habilitarFirmar).toBeFalse();

    (component as any).idEstadoTramite = ESTADO_REGISTRO.FIRMADO;
    (component as any).validarHabilitarGuardar();
    expect((component as any).soloLectura).toBeTrue();
  });

   it('should update sujetosProcesales from modal on openModalSujetos', () => {
    dialogServiceSpy.open.and.returnValue({
      onClose: of({ data: [{ flApelacion: '1' }] })
    });
    (component as any).sujetosProcesales = [{ flApelacion: '0' }];
    component.openModalSujetos();
    expect((component as any).sujetosProcesales.length).toBe(1);
    expect((component as any).sujetosProcesales[0].flApelacion).toBe('1');
  });
});