import { CuadernoIncidental } from './../../../../../../core/interfaces/visor/visor-interface';

import { Expediente } from '@core/utils/expediente';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaCuadernoPruebaComponent } from './lista-cuaderno-prueba.component';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { provideHttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Constants } from 'ngx-cfng-core-lib';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { VisorEfeService } from '@core/services/visor/visor.service';
import { IconUtil } from 'ngx-cfng-core-lib';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { CuadernosPruebaService } from './services/cuadernos-prueba.service';

describe('ListaCuadernoPruebaComponent', () => {
  let component: ListaCuadernoPruebaComponent;
  let fixture: ComponentFixture<ListaCuadernoPruebaComponent>;

  function setCasos(component: ListaCuadernoPruebaComponent, caso: Expediente) {
    (component as any).caso = caso;
  }

  beforeEach(async () => {
    const mockToken = JSON.stringify({
      token:
        'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIzMjkyMDU4OSIsImlzcyI6Imh0dHA6Ly9jZm1zLXNhZC1hZG1pbmlzdHJhY2lvbi1nZXN0aW9uLWFwaS1kZXZlbG9wbWVudC5hcHBzLmRldi5vY3A0LmNmZS5tcGZuLmdvYi5wZS9jZmUvc2FkL2FkbWluaXN0cmFjaW9uL3YxL2Uvc2VzaW9uL3Rva2VuU2VzaW9uLW5ldyIsImlwIjoiMTkyLjE2OC4xMzAuMSIsInVzdWFyaW8iOnsiZXN0YWRvIjoiMSIsImlwIjoiMTkyLjE2OC4xMzAuMSIsInVzdWFyaW8iOiIzMjkyMDU4OSIsImluZm8iOnsiYXBlbGxpZG9QYXRlcm5vIjoiUElOSUxMT1MiLCJlc1ByaW1lckxvZ2luIjp0cnVlLCJjb2RpZ29UaXBvRG9jdW1lbnRvIjoiMDAxIiwidGlwb0RvY3VtZW50byI6IkROSSIsImRuaSI6IjMyOTIwNTg5Iiwibm9tYnJlcyI6IkdJTEJFUlRPIE9TQ0FSIiwiYXBlbGxpZG9NYXRlcm5vIjoiQ0FESUxMTyJ9LCJjb2REZXBlbmRlbmNpYSI6IjQwMDYwMTQ1MDEiLCJkZXBlbmRlbmNpYSI6IjHCsCBGSVNDQUxJQSBQUk9WSU5DSUFMIFBFTkFMIENPUlBPUkFUSVZBIERFIFZFTlRBTklMTEEiLCJjb2REZXNwYWNobyI6IjQwMDYwMTQ1MDEtNCIsInNlZGUiOiIxwrAgRmlzY2FsaWEgUHJvdmluY2lhbCBNaXh0YSBkZSBWZW50YW5pbGxhIiwiZGVzcGFjaG8iOiI0VE8gREVTUEFDSE8iLCJjb2RDYXJnbyI6IkZQIiwiY29kU2VkZSI6IjE2MCIsImNhcmdvIjoiRklTQ0FMIFBST1ZJTkNJQUwiLCJjb2REaXN0cml0b0Zpc2NhbCI6IjQ3IiwiZGlzdHJpdG9GaXNjYWwiOiJMSU1BIE5PUk9FU1RFIiwiZG5pRmlzY2FsIjoiMzI5MjA1ODkiLCJkaXJlY2Npb24iOiIgIiwiZmlzY2FsIjoiR0lMQkVSVE8gT1NDQVIgUElOSUxMT1MgQ0FESUxMTyIsImNvcnJlb0Zpc2NhbCI6Imd1aWRvbWdtQGdtYWlsLmNvbSIsImNvZEplcmFycXVpYSI6IjAxIiwiY29kQ2F0ZWdvcmlhIjoiMDEiLCJjb2RFc3BlY2lhbGlkYWQiOiIwMDEiLCJ1YmlnZW8iOiIgIiwiZGlzdHJpdG8iOiJMSU1BIE5PUk9FU1RFIiwiY29ycmVvIjoiZ3VpZG9tZ21AZ21haWwuY29tIiwidGVsZWZvbm8iOiIgIiwic2lzdGVtYXMiOlt7ImNvZGlnbyI6IjE0NSIsIm9wY2lvbmVzIjpbIjI1IiwiMjYiLCIyOCIsIjMxIiwiNTAiLCIyMiIsIjIzIiwiMjQiLCI1MiIsIjQ2IiwiNDAiLCIxMjMiLCIyIiwiNDgzOTgzNDk4NDMiLCIzOTgzODc5NDg3IiwiMDAxIiwiMTIzNDUiLCIyNTQiLCI2NjY2IiwiMDk5ODg5NyJdLCJwZXJmaWxlcyI6W251bGwsIjAzIl19LHsiY29kaWdvIjoiMDAwOCIsIm9wY2lvbmVzIjpbImFwMDEiLCJhcDAxMSIsIkRFTU8xIiwiREVNTzIiLCJERU1PNCIsIjAwMyIsIjAxMyIsIjQyMjQiLCIwMDEiLCI4ODU1NTQ3NSIsIjM0NTUiLCI1NjU3IiwiMDAyIiwiMDA0IiwiMDA1IiwiMDA2IiwiMDA3IiwiMDA4IiwiQ09EMjMiLCJDT0RFMSIsIlBST0QxIiwiMDAxMiIsIjAwMDQiLCIwMDA5IiwiNTU1NTU1IiwiUkVQMDAxIiwiQUIwMDEiLCIxMjMzMjEiLCI1NjciLCIwMDAxMSIsIk5PRE8wMDEiXSwicGVyZmlsZXMiOlsiMDAyIiwiMDAzIiwiMDA1IiwiMDA2Il19XX0sImlhdCI6MTcyODk5Mjc0NSwiZXhwIjoxNzI5MDYyMDAwfQ.A4MnQqM-EZASFWXaURqiULiQ2euq-grrsu-3KAOtTWpJPZOlDxobtKC2S8qcj6Snf33BshovktOHckTt1B4asQ',
    });
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
      if (key === Constants.TOKEN_NAME) {
        return mockToken;
      }
      return null;
    });

    await TestBed.configureTestingModule({
      imports: [ListaCuadernoPruebaComponent],
      providers: [JwtHelperService, provideHttpClient()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaCuadernoPruebaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const mockExpediente: Expediente = {
      atoTramiteCasoDocumentoUltimo: [],
      supuestos: '',
      idCaso: '1D74B05EFE3AC28DE0650250569D508A',
      numeroCaso: '4006014501-2024-268-0',
      dependenciaFiscal: '4006014501-4',
      numSecuencial: '0',
      anioNumCaso: '2024-268',
      flgAcumulado: 0,
      flgReservado: '0',
      flgLectura: 0,
      fechaIngreso: '17/07/2024',
      flgElevacion: '0',
      flgAcuerdoReparatorio: '0',
      flgPrincipioOportunidad: '0',
      flgDerivado: '0',
      idEtapa: '11',
      etapa: 'DESARROLLO DE JUICIO ORAL',
      fiscal: 'PINILLOS CADILLO GILBERTO OSCAR',
      ultimoTramite: 'RESOLUCIÓN - AUTO QUE DE NIEGA EL RECURSO DE APELACIÓN',
      fechaUltimoTramite: '19/07/2024',
      actoProcesal: 'APELACIÓN AL CUADERNO INCIDENTAL',
      flgCasoLeido: '1',
      idJerarquia: '1',
      numExpediente: '',
      idEspecialidad: '001',
      idTipoEspecialidad: '1',
      idTipoProceso: '1',
      idTipoProcesoEtapa: '10111',
      flgCuaderno: '0',
      idTipoCuaderno: 0,
      flgCarpeta: '',
      idActoTramiteCasoUltimo: '1D9D2F87A9726844E0650250569D508A',
      idEstadoRegistro: 946,
      estadoRegistro: 'FIRMADO',
      codigoCasoPadreAcumulacion: '',
      usuarioOrigenTramite: '32920589',
      nombreUsuarioOrigenTramite: 'PINILLOS CADILLO GILBERTO OSCAR',
      usuarioActualTramite: '',
      nombreUsuarioActualTramite: '',
      idActoTramiteEstado: '00006110100111010200050901000',
      flgLecturaSuperior: 0,
      notas: [],
      delitos: [],
      pendientes: [],
      plazos: [],
      idTipoComplejidad: 2,
      idActoTramiteCasoDocumentoUltimo: '',
      flgConcluido: '0',
    };

    // const CuadernoIncidental

    // Bypass protection using casting
    (component as any).caso = mockExpediente;
    expect(component).toBeTruthy();
  });

  it('Llamar a obtenerCodigoCuadernoPruebas al inicializar', () => {
    spyOn(component as any, 'obtenerCodigoCuadernoPruebas');

    component.ngOnInit();

    expect((component as any).obtenerCodigoCuadernoPruebas).toHaveBeenCalled();
  });

  it('Llamar a listarDocumentosCuadernoPruebas al inicializar', () => {
    spyOn(component as any, 'listarDocumentosCuadernoPruebas');

    component.ngOnInit();

    expect(
      (component as any).listarDocumentosCuadernoPruebas
    ).toHaveBeenCalled();
  });
});
