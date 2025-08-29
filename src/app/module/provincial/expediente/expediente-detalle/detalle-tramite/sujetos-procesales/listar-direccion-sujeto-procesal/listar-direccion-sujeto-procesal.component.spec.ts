import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarDireccionSujetoProcesalComponent } from './listar-direccion-sujeto-procesal.component';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

describe('ListarDireccionSujetoProcesalComponent', () => {
  let component: ListarDireccionSujetoProcesalComponent;
  let maestrosService: any;
  let fixture: ComponentFixture<ListarDireccionSujetoProcesalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarDireccionSujetoProcesalComponent, HttpClientModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarDireccionSujetoProcesalComponent);
    maestrosService = jasmine.createSpyObj('MaestrosService', [
      'obtenertipovia',
    ]);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería obtener los distritos y asignarlos a lstTipoVia', async () => {
    const mockResponse = { data: ['Distrito1', 'Distrito2'] };
    maestrosService.obtenertipovia.and.returnValue(of(mockResponse));

    await component.obtenertipoVia();

    // expect(maestrosService.obtenertipovia).toHaveBeenCalledWith(
    //   'dptoTest',
    //   'provTest'
    // );
    expect(component.lstTipoVia).toEqual(mockResponse.data);
  });

  it('should eliminarDireccion', () => {
    component.eliminarDireccion(1);
    expect(component.listaDirecciones.length).toBe(0);
  });

  it('should setTipoDireccion', () => {
    component.lstTipoVia = [
      {
        id: 5,
        nombre: 'calle',
      },
    ];
    const result = component.setTipoDireccion(5);
    expect(result).toBe('calle');
  });
});
