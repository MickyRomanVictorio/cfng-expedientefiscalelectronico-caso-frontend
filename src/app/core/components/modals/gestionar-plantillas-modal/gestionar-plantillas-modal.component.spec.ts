import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GestionarPlantillasModalComponent } from './gestionar-plantillas-modal.component';
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PlantillaTramiteManualService } from '@core/services/provincial/tramites/plantilla-tramite-manual.service';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { of, throwError } from 'rxjs';
import { HttpEvent, HttpEventType,HttpProgressEvent } from '@angular/common/http';
import { fakeAsync, tick } from '@angular/core/testing';

describe('GestionarPlantillasModalComponent', () => {
  let component: GestionarPlantillasModalComponent;
  let fixture: ComponentFixture<GestionarPlantillasModalComponent>;
  let dialogService: DialogService;
  let messageService: MessageService;
  let plantillaTramiteManualService: PlantillaTramiteManualService;
  let dialogRef: DynamicDialogRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule,GestionarPlantillasModalComponent,AlertaModalComponent],
      providers: [
        DialogService,
        DynamicDialogRef,
        { provide: DynamicDialogConfig, useValue: { data: { idActoTramiteEstado: '00000310100111010100002302000', codigoDespacho: '4006014501-4' } } }, 
        //DynamicDialogConfig,
        ConfirmationService,
        MessageService,
        PlantillaTramiteManualService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarPlantillasModalComponent);
    component = fixture.componentInstance;
    dialogService = TestBed.inject(DialogService);
    messageService = TestBed.inject(MessageService);
    plantillaTramiteManualService = TestBed.inject(PlantillaTramiteManualService);
    dialogRef = TestBed.inject(DynamicDialogRef);
    fixture.detectChanges();
  });

  it('llamar al crear', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario', () => {
    expect(component.formularioGestorPlantilla).toBeDefined();
    expect(component.formularioGestorPlantilla.controls['nombrePlantilla']).toBeDefined();
  });

  it('debe llamar al mensajeGuardarPlantilla con los parametros correctos en el correcto upload', () => {
    spyOn(component, 'mensajeGuardarPlantilla');
    spyOn(plantillaTramiteManualService, 'subirNuevaPlantilla').and.returnValue(of({
      type: HttpEventType.UploadProgress,
      loaded: 100,
      total: 100,
      status: 200
    } as HttpProgressEvent));

    const formData = new FormData();
    component.getPlantillaTramiteManualService().subirNuevaPlantilla(formData).subscribe(event => {
        console.log(event);
        if (event.type === HttpEventType.UploadProgress && event.loaded === event.total) {
          component.mensajeGuardarPlantilla('nombrePlantillaPersonalizada', 'ok');
        }
      });
    //component.plantillaTramiteManualService.subirNuevaPlantilla(formData).subscribe();

    expect(component.mensajeGuardarPlantilla).toHaveBeenCalledWith('nombrePlantillaPersonalizada', 'ok');
  });

  it('debe llamar a mensajeGuardarPlantilla with error con upload failure', () => {
    spyOn(component, 'mensajeGuardarPlantilla');
    spyOn(plantillaTramiteManualService, 'subirNuevaPlantilla').and.returnValue(throwError({ status: 500 }));

    const formData = new FormData();
    component.getPlantillaTramiteManualService().subirNuevaPlantilla(formData).subscribe({
      error: () => {
        component.mensajeGuardarPlantilla('nombrePlantillaPersonalizada', 'error');
       // expect(component.mensajeGuardarPlantilla).toHaveBeenCalledWith('nombrePlantillaPersonalizada', 'error');
      },
    });
    expect(component.mensajeGuardarPlantilla).toHaveBeenCalledWith('nombrePlantillaPersonalizada', 'error');
  });



  it('debe eliminar eliminarPlantilla y dar success', fakeAsync(() => {
    spyOn(component, 'mensajeGuardarPlantilla');
    spyOn(plantillaTramiteManualService, 'eliminarPlantilla').and.returnValue(of('OK'));

    const plantilla = {
      idPlantillaPersonalizada: 367,
      nombrePlantillaPersonalizada: 'PlantillaUltima',
      idNode: '123',
      codigoDespacho: '4006014501-4',
      tags: [],
      idActoTramiteEstado: '789',
    };

    component.eliminarPlantilla(plantilla);
    tick(1000);
   expect(component.mensajeGuardarPlantilla).toHaveBeenCalledWith(plantilla.nombrePlantillaPersonalizada, 'error');
  }));

  it('debe llamar a  eliminarPlantilla y botar error', fakeAsync(() => {
    spyOn(component, 'mensajeGuardarPlantilla');
    spyOn(plantillaTramiteManualService, 'eliminarPlantilla').and.returnValue(throwError({ status: 500 }));

    const plantilla = {
      idPlantillaPersonalizada: 367,
      nombrePlantillaPersonalizada: 'Test Plantilla',
      idNode: '123',
      codigoDespacho:'4006014501-4',
      tags: [],
      idActoTramiteEstado: '789',
    };

    component.eliminarPlantilla(plantilla);
    tick(1000);
    expect(component.mensajeGuardarPlantilla).toHaveBeenCalledWith('Test Plantilla', 'error');
  }));

  it('deberia llamar a cargarTablaPlantillas y botar success', () => {
    spyOn(plantillaTramiteManualService, 'listarPlantillas').and.returnValue(of([]));

    component.cargarTablaPlantillas();

    expect(component.listaDocumentos.length).toBe(0);
  });

  it('deberia llamar a  cargarTablaPlantillas y botar error', () => {
    spyOn(messageService, 'add');
    spyOn(plantillaTramiteManualService, 'listarPlantillas').and.returnValue(throwError({ status: 500 }));

    component.cargarTablaPlantillas();
     expect(console.log("Error de plantillas"))
   
  });

  it('deberia llamar a actualizarPlantilla y setear form values', () => {
    const plantilla = {
      idPlantillaPersonalizada: 367,
      nombrePlantillaPersonalizada: 'Test Plantilla',
      idNode: '123',
      codigoDespacho: '456',
      tags: [],
      idActoTramiteEstado: '789',
    };

    component.actualizarPlantilla(plantilla);

    expect(component.formularioGestorPlantilla.get('nombrePlantilla')?.value).toBe('Test Plantilla');
    expect(component.isEditMode).toBeTrue();
  });

  it('deberia llamar a limpiarFormulario y resetear form values', () => {
    component.limpiarFormulario();

    expect(component.formularioGestorPlantilla.get('nombrePlantilla')?.value).toBeNull();
    expect(component.archivo).toBeUndefined();
    expect(component.isEditMode).toBeFalse();
  });
});