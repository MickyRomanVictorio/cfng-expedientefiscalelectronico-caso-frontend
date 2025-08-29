import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsViewComponent } from './tabs-view.component';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { Tab } from '@core/interfaces/comunes/tab';

class MockRouter {
    url = '/current-route';
    events = new Subject<any>();
}

describe('TabsViewComponent', () => {
    let component: TabsViewComponent;
    let fixture: ComponentFixture<TabsViewComponent>;
    let mockRouter: MockRouter;

    beforeEach(async () => {
        mockRouter = new MockRouter();

        await TestBed.configureTestingModule({
            imports: [TabsViewComponent],
            providers: [
                { provide: Router, useValue: mockRouter }
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TabsViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Debería crear el componente', () => {
        expect(component).toBeTruthy();
    });

    it('Debería inicializar las pestañas en ngOnInit', () => {
        const tabs: Tab[] = [
            { id: 1, titulo: 'Tab 1', rutaPadre: 'home', oculto: false },
            { id: 2, titulo: 'Tab 2', rutaPadre: 'mail', oculto: false },
        ];
        component.tabs = tabs;
        component.ngOnInit();

        expect(component.indexSeleccionado).toBe(0);
    });

    it('Debería llamar a asignarTabId en ngOnChanges cuando cambia la entrada de las pestañas', () => {
        const asignarTabIdSpy = spyOn<any>(component, 'asignarTabId');

        component.tabs = [{ id: undefined, titulo: 'Tab 1', oculto: false }];
        component.ngOnChanges({ tabs: { currentValue: component.tabs, previousValue: [], firstChange: true, isFirstChange: () => true } });

        expect(asignarTabIdSpy).toHaveBeenCalled();
    });

    it('Debería calcular las pestañas visibles en ajustarTabsVisibles', () => {
        spyOn<any>(component, 'obtenerWidthTabView').and.returnValue(300);

        component.tabs = [
            { id: 1, titulo: 'Tab 1', ancho: 100, oculto: false },
            { id: 2, titulo: 'Tab 2', ancho: 100, oculto: false },
            { id: 3, titulo: 'Tab 3', ancho: 100, oculto: false },
        ];

        component["ajustarTabsVisibles"]();

        expect(component["tabsPorPagina"]).toBe(2);
    });

    it('Debe actualizar la ruta actual en el evento NavigationEnd', () => {
        mockRouter.events.next(new NavigationEnd(1, '/new-route', '/new-route'));

        expect(component["currentRoute"]).toBe('/new-route');
    });

    it('Deberían devolverse las pestañas visibles correctas en tabsVisibles', () => {
        component.tabs = [
            { id: 1, titulo: 'Tab 1', oculto: false },
            { id: 2, titulo: 'Tab 2', oculto: true },
            { id: 3, titulo: 'Tab 3', oculto: false },
        ];

        component["tabsPorPagina"] = 1;
        component["paginaActual"] = 0;

        const visibleTabs = component["tabsVisibles"]();

        expect(visibleTabs.length).toBe(1);
        expect(visibleTabs[0].id).toBe(1);
    });
});
