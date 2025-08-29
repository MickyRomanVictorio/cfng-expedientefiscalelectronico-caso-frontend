import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistrarPenasComponent } from './registrar-penas.component';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { MaestroService } from '@core/services/shared/maestro.service';
import { RegistrarPenasService } from '@core/services/reusables/otros/registrar-penas.service';
import { of, throwError } from 'rxjs';

describe('RegistrarPenasComponent', () => {
  let component: RegistrarPenasComponent;
  let fixture: ComponentFixture<RegistrarPenasComponent>;
  let modalDialogService: jasmine.SpyObj<NgxCfngCoreModalDialogService>;
  let registrarPenasService: jasmine.SpyObj<RegistrarPenasService>;
  let maestroService: jasmine.SpyObj<MaestroService>;

  beforeEach(async () => {
    modalDialogService = jasmine.createSpyObj('NgxCfngCoreModalDialogService', ['success', 'error', 'warning']);
    registrarPenasService = jasmine.createSpyObj('RegistrarPenasService', ['obtenerPena', 'validar', 'crearEditarPena', 'listarSujetos', 'listarDelitosxSujeto']);
    maestroService = jasmine.createSpyObj('MaestroService', ['obtenerCatalogo', 'getTipoPena', 'getReglasConducta']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegistrarPenasComponent],
      providers: [
        { provide: NgxCfngCoreModalDialogService, useValue: modalDialogService },
        { provide: RegistrarPenasService, useValue: registrarPenasService },
        { provide: MaestroService, useValue: maestroService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarPenasComponent);
    component = fixture.componentInstance;
    component.data = { idActoTramiteCaso: '1', idCaso: '123' }; // Datos simulados para inputs
    component.accion = 2;
    //component.id = '456';
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario en ngOnInit', () => {
    spyOn(component, 'iniciarDatos').and.callThrough();
    component.ngOnInit();
    expect(component.iniciarDatos).toHaveBeenCalled();
    expect(component.formPenas).toBeDefined();
  });

  it('debería cargar los datos correctamente cuando la acción es EDITAR', () => {
    const mockPenaResponse = {
      sujeto: 'Sujeto Test',
      clasePena: 1230,
      tipoPena: 1,
      delito: 'Delito Test',
      // Agrega más campos según sea necesario
    };

    registrarPenasService.obtenerPena.and.returnValue(of(mockPenaResponse));
    component.ngOnInit();
    component.cargarDatosPena();

    //expect(registrarPenasService.obtenerPena).toHaveBeenCalledWith(component.id);
    expect(component.formPenas.get('sujeto')?.value).toBe(mockPenaResponse.sujeto);
    expect(component.formPenas.get('clasePena')?.value).toBe(mockPenaResponse.clasePena);
    // Agrega más afirmaciones según sea necesario
  });

  it('debería manejar el error al cargar los datos', () => {
    registrarPenasService.obtenerPena.and.returnValue(throwError(new Error('Error al cargar los datos')));
    spyOn(modalDialogService, 'error');

    component.cargarDatosPena();

    expect(modalDialogService.error).toHaveBeenCalledWith("Error", "Se ha producido un error al intentar obtener la información de la pena", 'Ok');
  });

  // Agrega más pruebas según sea necesario para otros métodos y funcionalidades
});
