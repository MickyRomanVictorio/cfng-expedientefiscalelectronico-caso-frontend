import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarAgendaMultipleComponent } from './listar-agenda-multiple.component';
import { DialogService } from 'primeng/dynamicdialog';
import { IconUtil, StringUtil } from 'dist/ngx-cfng-core-lib';
import { AgendaNotificacionInterface } from '@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface';
import { AgendaMultipleLecturaComponent } from '../agenda-multiple-lectura/agenda-multiple-lectura.component';

describe('ListarAgendaMultipleComponent', () => {
  let component: any;
  let fixture: ComponentFixture<ListarAgendaMultipleComponent>;

  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockStringUtil: jasmine.SpyObj<StringUtil>;
  let mockIconUtil: jasmine.SpyObj<IconUtil>;

  beforeEach(async () => {
    mockStringUtil = jasmine.createSpyObj('StringUtil', ['capitalizedFirstWord']);
    mockIconUtil = jasmine.createSpyObj('IconUtil', ['obtenerIcono']);

    mockIconUtil.obtenerIcono.and.returnValue({
      name: 'mock-icon',
      viewBox: '0 0 24 24'
    });

    await TestBed.configureTestingModule({
      imports: [ListarAgendaMultipleComponent],
      providers: [
        { provide: DialogService, useValue: mockDialogService },
        { provide: StringUtil, useValue: mockStringUtil },
        { provide: IconUtil, useValue: mockIconUtil },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarAgendaMultipleComponent);
    component = fixture.componentInstance;
    component.agendasMultiples = [
      {
          idRegistroTabla: "1",
          idAgendaFiscal: "2414671ECC5829D6E0650250569D508A",
          fechaNotificacion: "2024-10-09T05:00:00.000+00:00",
          fechaHoraAudicencia: "2024-10-09T23:13:01.000+00:00",
          idTipoActividadAgenda: 1223,
          tipoActividadAgenda: "VIRTUAL",
          urlReunion: "link 1",
          idDistritoPJ: 10,
          idJuzgadoPJ: "10000002",
          observacion: "sdg",
          estadoAgendaFiscal: "1",
          idCaso: "204D70BAB63A6455E0650250569D508A",
          idActoTramiteCaso: "241462A1636B29E6E0650250569D508A"
      },
      {
          idRegistroTabla: "2",
          idAgendaFiscal: "2414671ECC5829D6E0650250569D508B",
          fechaNotificacion: "2024-10-09T05:00:00.000+00:00",
          fechaHoraAudicencia: "2024-10-09T23:13:01.000+00:00",
          idTipoActividadAgenda: 1222,
          tipoActividadAgenda: "PRESENCIAL",
          urlReunion: "",
          idDistritoPJ: 10,
          idJuzgadoPJ: "10000002",
          observacion: "sdg",
          estadoAgendaFiscal: "1",
          idCaso: "204D70BAB63A6455E0650250569D508A",
          idActoTramiteCaso: "241462A1636B29E6E0650250569D508A"
      },
      {
        idRegistroTabla: "2",
        idAgendaFiscal: null,
        fechaNotificacion: "2024-10-09T05:00:00.000+00:00",
        fechaHoraAudicencia: "2024-10-09T23:13:01.000+00:00",
        idTipoActividadAgenda: 1222,
        tipoActividadAgenda: "PRESENCIAL",
        urlReunion: "",
        idDistritoPJ: 10,
        idJuzgadoPJ: "10000002",
        observacion: "sdg",
        estadoAgendaFiscal: "1",
        idCaso: "204D70BAB63A6455E0650250569D508A",
        idActoTramiteCaso: "241462A1636B29E6E0650250569D508A"
    }
    ] as AgendaNotificacionInterface[];
    component.modoEliminar = true; // O true, según lo que necesites
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializarse agendasMultiples y modoEliminar correctamente', () => {
    expect(component.agendasMultiples.length).toBe(3);
    expect(component.modoEliminar).toBeTrue();
  });

  it('debería obtener los íconos correctamente usando IconUtil', () => {
    mockIconUtil.obtenerIcono.and.returnValue({ name: 'mock-icon' })
    fixture.detectChanges();

    expect(mockIconUtil.obtenerIcono).toHaveBeenCalledWith('iEye')
    expect(mockIconUtil.obtenerIcono).toHaveBeenCalledWith('iTrashCan')
  })

  it('debería obtener solo las agendas activas (no eliminadas) con estadoAgendaFiscal 1', () => {
    const result = component.agendasMultiplesActivas;

    expect(result.length).toBe(3);
    expect(result[0].estadoAgendaFiscal).toBe("1");
    expect(result[1].estadoAgendaFiscal).toBe("1");
    expect(result[2].estadoAgendaFiscal).toBe("1");
  });

  it('debería retornar lista de agendas vacia', () => {
    component.agendasMultiples = [];

    const result = component.agendasMultiplesActivas;
    expect(result).toEqual([]);
  });

  it('debería abrir el modal con la data correctamente', () => {
    const mockAgenda = component.agendasMultiples[0];
    const dialogSpy = spyOn(component.dialogService, 'open');

    component.visualizarAgendaNotificacion(mockAgenda);

    expect(dialogSpy).toHaveBeenCalledWith(AgendaMultipleLecturaComponent, {
      width: '900px',
      showHeader: false,
      contentStyle: { padding: '10px', 'border-radius': '15px' },
      data: { agendaNotificacion: mockAgenda }
    });
  });

  it('debería eliminar la primera agenda correctamente seteando el estadoAgendaFiscal a "0" - con idAgenda presente', () => {
    const agendaToDelete = component.agendasMultiples[0];

    component.eliminarAgendaNotificacion(agendaToDelete);
    expect(component.agendasMultiples[0].estadoAgendaFiscal).toBe('0');
  });

  it('debería eliminar la tercera agenda corectamente quitando de la lista de Agendas - sin idAgenda presente', () => {
    const agendaToDelete = component.agendasMultiples[2];

    component.eliminarAgendaNotificacion(agendaToDelete);
    expect(component.agendasMultiples.length).toBe(2);
  });

});
