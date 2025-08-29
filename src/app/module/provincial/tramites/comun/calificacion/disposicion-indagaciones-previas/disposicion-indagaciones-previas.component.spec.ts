import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisposicionIndagacionesPreviasComponent } from './disposicion-indagaciones-previas.component';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { IndagacionesPreviasService } from '@services/provincial/tramites/indagaciones-previas.service';
import { AlertaService } from '@core/services/shared/alerta.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { of, throwError } from 'rxjs';

describe('DisposicionIndagacionesPreviasComponent', () => {
  let componente: DisposicionIndagacionesPreviasComponent;
  let fixture: ComponentFixture<DisposicionIndagacionesPreviasComponent>;
  let tramiteServiceEspia: jasmine.SpyObj<TramiteService>;
  let indagacionesServiceEspia: jasmine.SpyObj<IndagacionesPreviasService>;
  let alertaServiceEspia: jasmine.SpyObj<AlertaService>;
  let gestionCasoServiceEspia: jasmine.SpyObj<GestionCasoService>;
  let firmaIndividualServiceEspia: jasmine.SpyObj<FirmaIndividualService>;
  let modalDialogServiceEspia: jasmine.SpyObj<NgxCfngCoreModalDialogService>;

  beforeEach(async () => {
    tramiteServiceEspia = jasmine.createSpyObj('TramiteService', ['formularioEditado', 'habilitarGuardar']);
    indagacionesServiceEspia = jasmine.createSpyObj('IndagacionesPreviasService', ['obtenerIndagacionesPrevias', 'guardarIndagacionesPrevias']);
    alertaServiceEspia = jasmine.createSpyObj('AlertaService', ['generarAlertaTramite']);
    gestionCasoServiceEspia = jasmine.createSpyObj('GestionCasoService', ['casoActual']);
    firmaIndividualServiceEspia = jasmine.createSpyObj('FirmaIndividualService', ['esFirmadoCompartidoObservable']);
    modalDialogServiceEspia = jasmine.createSpyObj('NgxCfngCoreModalDialogService', ['success', 'error']);

    await TestBed.configureTestingModule({
      declarations: [DisposicionIndagacionesPreviasComponent],
      providers: [
        { provide: TramiteService, useValue: tramiteServiceEspia },
        { provide: IndagacionesPreviasService, useValue: indagacionesServiceEspia },
        { provide: AlertaService, useValue: alertaServiceEspia },
        { provide: GestionCasoService, useValue: gestionCasoServiceEspia },
        { provide: FirmaIndividualService, useValue: firmaIndividualServiceEspia },
        { provide: NgxCfngCoreModalDialogService, useValue: modalDialogServiceEspia }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DisposicionIndagacionesPreviasComponent);
    componente = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    expect(componente).toBeTruthy();
  });

  it('debería inicializar y obtener los datos del formulario', () => {
    const datosMock = { plazo: 10, formularioCompleto: '0' };
    indagacionesServiceEspia.obtenerIndagacionesPrevias.and.returnValue(of(datosMock));
    componente.obtenerFormulario();
    expect(indagacionesServiceEspia.obtenerIndagacionesPrevias).toHaveBeenCalledWith(componente.idActoTramiteCaso);
  });

  it('debería validar correctamente el formulario', () => {
    componente['dias'] = 10;
    componente['seHanRegistradoAsociaciones'] = true;
    expect(componente.formularioValido).toBeTrue();
  });

  it('debería guardar el formulario y mostrar un mensaje de éxito', () => {
    indagacionesServiceEspia.guardarIndagacionesPrevias.and.returnValue(of({}));
    componente['guardarFormulario']().subscribe();
    expect(modalDialogServiceEspia.success).toHaveBeenCalled();
  });

  it('debería manejar el error al guardar', () => {
    indagacionesServiceEspia.guardarIndagacionesPrevias.and.returnValue(of(throwError(() => new Error('Error al guardar'))));
    componente['guardarFormulario']().subscribe({
      error: () => {}
    });
    expect(modalDialogServiceEspia.error).toHaveBeenCalled();
  });
});
