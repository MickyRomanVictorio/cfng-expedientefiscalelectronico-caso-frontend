// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { SubetapasComponent } from './subetapas.component';
// import { IconUtil } from 'ngx-cfng-core-lib';
// import { By } from '@angular/platform-browser';
// import { CommonModule } from '@angular/common';
// import { CmpLibModule } from 'dist/cmp-lib';

// xdescribe('SubetapasComponent', () => {

//     let component: SubetapasComponent;
//     let fixture: ComponentFixture<SubetapasComponent>;
//     let mockIconUtil: jasmine.SpyObj<IconUtil>;

//     beforeEach(async () => {

//         mockIconUtil = jasmine.createSpyObj('IconUtil', ['obtenerIcono']);

//         mockIconUtil.obtenerIcono.and.returnValue({
//           name: 'mock-icon',
//           viewBox: '0 0 24 24'
//         });
    
//        await TestBed.configureTestingModule({
//             imports: [CommonModule, CmpLibModule, SubetapasComponent],
//             providers: [{ provide: IconUtil, useValue: mockIconUtil }],
//         }).compileComponents()

//         fixture = TestBed.createComponent(SubetapasComponent)
//         component = fixture.componentInstance
//         fixture.detectChanges()
//     });

//     it('debería crearse correctamente', () => {
//         expect(component).toBeTruthy()
//     })

//     it('debería asignar todas las subetapas con la clase SUBETAPAS_CLASE_POSTERIOR cuando no existe la etapa actual', () => {

//         component.etapa = '05'  // Etapa no existente en la lista
//         component.subetapas = [
//             { codigo: '01', nombre: 'Subetapa 1', clase: '' },
//             { codigo: '02', nombre: 'Subetapa 2', clase: '' },
//         ]
    
//         component.ngOnInit()
    
//         component.subetapas.forEach(subetapa => {
//             expect(subetapa.clase).toBe('subetapa-posterior')
//         })
//     })

//     it('debería asignar correctamente las clases cuando existe la etapa actual', () => {

//         component.etapa = '02'  // Etapa actual
//         component.subetapas = [
//             { codigo: '01', nombre: 'Subetapa 1', clase: '' },
//             { codigo: '02', nombre: 'Subetapa 2', clase: '' },
//             { codigo: '03', nombre: 'Subetapa 3', clase: '' },
//         ];
    
//         component.ngOnInit()
    
//         expect(component.subetapas[0].clase).toBe('subetapa-anterior')
//         expect(component.subetapas[1].clase).toBe('subetapa-actual')
//         expect(component.subetapas[2].clase).toBe('subetapa-posterior')
//     });

//     it('debería asignar clase posterior si no se encuentra la etapa actual', () => {
//         component.etapa = '04' // No existe en subetapas
//         component.subetapas = [
//             { codigo: '01', nombre: 'Subetapa 1', clase: '' },
//             { codigo: '02', nombre: 'Subetapa 2', clase: '' },
//             { codigo: '03', nombre: 'Subetapa 3', clase: '' }
//         ];
    
//         component.ngOnInit()
        
//         component.subetapas.forEach(subetapa => {
//             expect(subetapa.clase).toBe('subetapa-posterior')
//         });
//     })

//     it('debería renderizar correctamente las subetapas en el HTML', () => {

//         component.etapa = '02';
//         component.subetapas = [
//           { codigo: '01', nombre: 'Subetapa 1', clase: '' },
//           { codigo: '02', nombre: 'Subetapa 2', clase: '' },
//           { codigo: '03', nombre: 'Subetapa 3', clase: '' }
//         ];
    
//         fixture.detectChanges();
    
//         const listItems = fixture.debugElement.queryAll(By.css('li'));
//         expect(listItems.length).toBe(3);
//         expect(listItems[1].nativeElement.textContent).toContain('Subetapa 2');

//     })

//     it('debería obtener los íconos correctamente usando IconUtil', () => {

//         component.etapa = '02';
//         component.subetapas = [
//             { codigo: '01', nombre: 'Subetapa 1', clase: '' },
//             { codigo: '02', nombre: 'Subetapa 2', clase: '' },
//         ];

//         mockIconUtil.obtenerIcono.and.returnValue({ name: 'mock-icon' })
//         fixture.detectChanges();

//         expect(mockIconUtil.obtenerIcono).toHaveBeenCalledWith('iCheckCircle')
//         expect(mockIconUtil.obtenerIcono).toHaveBeenCalledWith('iArrowRight')
//     })

// })
