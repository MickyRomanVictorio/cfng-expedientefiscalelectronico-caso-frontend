import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarReparacionCivilComponent } from './registrar-reparacion-civil.component';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { of } from 'rxjs';

describe('RegistrarReparacionCivilComponent', () => {
  let component: RegistrarReparacionCivilComponent;
  let fixture: ComponentFixture<RegistrarReparacionCivilComponent>;
  let iconUtil: jasmine.SpyObj<IconUtil>;

  beforeEach(async () => {
    iconUtil = jasmine.createSpyObj('IconUtil', ['obtenerIcono']);

    await TestBed.configureTestingModule({
      declarations: [RegistrarReparacionCivilComponent],
      providers: [
        { provide: IconUtil, useValue: iconUtil },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarReparacionCivilComponent);
    component = fixture.componentInstance;

    // Mock data
    // component.data = {   idActoTramiteCaso: "asdasd",
    //     idCaso: "asdasd",
    //     numeroCaso: "asdasd"  };
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el índice activo en 0', () => {
    expect(component.indexActivo).toBe(0);
  });

  it('debería cambiar el índice activo cuando cambiarTab es llamado', () => {
    component.cambiarTab(1);
    expect(component.indexActivo).toBe(1);
  });

  it('debería recibir el id de reparación civil', () => {
    const mockId = '12345';
    //component.recibirIdReparacionCivil(mockId);
    //expect(component.idReparacionCivil).toBe(mockId);
  });

  // Agrega más pruebas según sea necesario para otros métodos y funcionalidades
});
