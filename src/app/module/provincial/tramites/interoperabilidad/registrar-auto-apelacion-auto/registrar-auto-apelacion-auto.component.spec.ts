import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService } from 'primeng/dynamicdialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { GestionCasoService } from '@services/shared/gestion-caso.service';
import { ResolucionAutoResuelveAutoSuperiorService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-auto-superior.service';
import { RegistrarAutoApelacionAutoComponent } from './registrar-auto-apelacion-auto.component';

describe('RegistrarAutoApelacionAutoComponent', () => {
  let component: RegistrarAutoApelacionAutoComponent;
  let fixture: ComponentFixture<RegistrarAutoApelacionAutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CommonModule],
      declarations: [RegistrarAutoApelacionAutoComponent],
      providers: [
        FormBuilder,
        DatePipe,
        NgxSpinnerService,
        DialogService,
        DomSanitizer,
        NgxCfngCoreModalDialogService,
        GestionCasoService,
        ResolucionAutoResuelveAutoSuperiorService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarAutoApelacionAutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize formGroup in ngOnInit', () => {
    component.ngOnInit();
    expect(component.formGroup).toBeTruthy();
    expect(component.formGroup.contains('fechaNotificacion')).toBeTrue();
    expect(component.formGroup.contains('txtObservacion')).toBeTrue();
  });

  it('should initialize subscriptions array', () => {
    expect(component.subscriptions).toBeTruthy();
    expect(component.subscriptions.length).toBe(0);
  });

  it('should initialize mostrarDevolverAlFiscalProvincial to false', () => {
    expect(component.mostrarDevolverAlFiscalProvincial).toBeFalse();
  });

  it('should initialize nombreFiscaliaProvincial to empty string', () => {
    expect(component.nombreFiscaliaProvincial).toBe('');
  });
});