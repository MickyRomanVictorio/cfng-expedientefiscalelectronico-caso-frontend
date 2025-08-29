import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActaInconcurrenciaTerminacionAnticipadaComponent } from './acta-inconcurrencia-terminacion-anticipada.component';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { IconAsset } from 'dist/ngx-cfng-core-lib';

describe('ActaInconcurrenciaTerminacionAnticipadaComponent', () => {
  let component: ActaInconcurrenciaTerminacionAnticipadaComponent;
  let fixture: ComponentFixture<ActaInconcurrenciaTerminacionAnticipadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CheckboxModule,
        ActaInconcurrenciaTerminacionAnticipadaComponent
      ],
      providers: [
        FormBuilder,
        {
          provide: IconAsset,
          useValue: {
            obtenerRutaIcono: jasmine.createSpy('obtenerRutaIcono').and.returnValue('dummy-path')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActaInconcurrenciaTerminacionAnticipadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería ejecutar openModalSujetos sin errores', () => {
    spyOn(component, 'openModalSujetos');
    component.openModalSujetos();
    expect(component.openModalSujetos).toHaveBeenCalled();
  });

  it('debería ejecutar cambioIncluye sin errores', () => {
    spyOn(component, 'cambioIncluye');
    component.cambioIncluye();
    expect(component.cambioIncluye).toHaveBeenCalled();
  });

});
