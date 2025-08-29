import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { HistorialElevacionComponent } from '@components/modals/historial-elevacion/historial-elevacion.component';
import { EtiquetaCasoComponent } from '@core/components/consulta-casos/components/carpeta-caso/etiqueta-caso/etiqueta-caso.component';
import { ConsultaCasosGestionService } from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import { RespuestaSuperiorComponent as RespuestaSuperiorModalComponent } from '@core/components/modals/respuesta-superior/respuesta-superior.component';
import { TipoElevacionCodigo } from '@core/constants/superior';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { TipoArchivoType } from '@core/types/exportar.type';
import { DateMaskModule } from '@directives/date-mask.module';
import {
  RequestRespuestaSuperior
} from '@interfaces/provincial/administracion-casos/respuesta-elevacion/request-respuesta-superior.interface';
import {
  RespuestaElevacion
} from '@interfaces/provincial/administracion-casos/respuesta-elevacion/respuesta-elevacion.interface';
import { RespuestaSuperiorService } from '@services/provincial/respuesta-superior/respuesta-superior.service';
import { ExportarService } from '@services/shared/exportar.service';
import { MaestroService } from '@services/shared/maestro.service';
import { obtenerIcono } from '@utils/icon';
import { CATALOGO_NOM_GRUPO, IconUtil, StringUtil } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { tourService } from '@utils/tour';
import { urlConsultaCasoFiscal } from '@core/utils/utils';

@Component({
  selector: 'app-respuesta-superior',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    CheckboxModule,
    CmpLibModule,
    DateMaskModule,
    DialogModule,
    DividerModule,
    DropdownModule,
    DynamicDialogModule,
    FormsModule,
    FormsModule,
    InputTextModule,
    MenuModule,
    MessagesModule,
    RadioButtonModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    PaginatorComponent,
    EtiquetaCasoComponent
  ],
  templateUrl: './respuesta-superior.component.html',
  providers: [MessageService, DialogService, DatePipe],
})
export class RespuestaSuperiorComponent implements OnInit {

  protected obtenerIcono = obtenerIcono
  protected formularioFiltrarRespuestas!: FormGroup;
  protected readonly TipoElevacionCodigo = TipoElevacionCodigo;
  private readonly subscriptions: Subscription[] = [];
  public tipoElevacion = [];
  public respuestasSuperior: RespuestaElevacion[] = [];
  public respuestaSuperiorFiltrada: RespuestaElevacion[] = [];
  public mostrarFiltros = false;
  public totalRespuestas = 0;
  public totalCasos = 0;
  public totalPestanias = 0;
  protected query: any = { limit: 10, page: 1, where: {} };
  protected resetPage: boolean = false;
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  constructor(
    private readonly formulario: FormBuilder,
    private readonly maestrosService: MaestroService,
    private readonly messageService: MessageService,
    private readonly exportarService: ExportarService,
    private readonly datePipe: DatePipe,
    private readonly router: Router,
    private readonly respuestaSuperiorService: RespuestaSuperiorService,
    private readonly dialogService: DialogService,
    protected readonly stringUtil: StringUtil,
    protected readonly iconUtil: IconUtil,
    private readonly consultaCasosGestionService: ConsultaCasosGestionService,
    private tourService: tourService
  ) { }

  ngOnInit(): void {
    this.formBuild()
    this.obtenerTipoElevacion();
    this.obtenerRespuestas();
  }


  private obtenerTipoElevacion(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerCatalogo(CATALOGO_NOM_GRUPO.TIPO_ELEVACION).subscribe({
        next: resp => {
          this.tipoElevacion = resp.data
        }
      })
    )
  }

  private formBuild(): void {
    this.formularioFiltrarRespuestas = this.formulario.group({
      buscar: [''],
      tiempoAFiltrar: ['0'],
      fechaDesde: [new Date(new Date().setMonth(new Date().getMonth() - 6))],
      fechaHasta: [new Date()],
      tipoElevacion: [null]
    })
  }

  public limpiarFiltros(): void {
    this.formBuild();
    this.obtenerRespuestas();
  }

  obtenerRespuestas(): void {
    let form = this.formularioFiltrarRespuestas.getRawValue()
    if (!form.fechaDesde || !form.fechaHasta) {
      this.formularioFiltrarRespuestas.get('tiempoAFiltrar')!.setValue('0')
      this.prepararDataBusqueda()
      return
    }
    let request: RequestRespuestaSuperior = {
      fechaDesde: this.datePipe.transform(form.fechaDesde, 'yyyy-MM-dd'),
      fechaHasta: this.datePipe.transform(form.fechaHasta, 'yyyy-MM-dd'),
      tipoElevacion: form.tipoElevacion,
      filtrotiempo: form.tiempoAFiltrar
    }

    this.subscriptions.push(
      this.respuestaSuperiorService.getRespuestasSuperior(request).subscribe({
        next: resp => {

          if (resp.code == 0) {
            this.respuestasSuperior = resp.data.map((respuesta: any) => ({ ...respuesta }))
            this.respuestaSuperiorFiltrada = this.respuestasSuperior
            this.itemPaginado.data.data = this.respuestaSuperiorFiltrada
            this.itemPaginado.data.total = this.totalRespuestas = this.respuestaSuperiorFiltrada.length
            this.obtenerCabecera(this.respuestaSuperiorFiltrada)
            this.actualizarPaginaRegistros(this.respuestaSuperiorFiltrada, false);
          }
        },
        error: error => {

        }
      })
    )
  }
  private obtenerCabecera(respuestaSuperiorFiltrada: Array<RespuestaElevacion>): void {
    this.totalRespuestas = 0;
    this.totalCasos = 0;
    this.totalPestanias = 0;
    respuestaSuperiorFiltrada.forEach((respuesta: RespuestaElevacion) => {
      if (respuesta.esPestana === 1) this.totalPestanias += 1;
      if (respuesta.esCaso === 1) this.totalCasos += 1;
      this.totalRespuestas++;
    });
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros
    this.mostrarFiltros && this.formularioFiltrarRespuestas.get('tiempoAFiltrar')!.setValue('0')
    this.mostrarFiltros && this.prepararDataBusqueda()
  }

  public prepararDataBusqueda() {
    let fechaInicio = new Date(new Date().setMonth(new Date().getMonth() - 6))
    this.formularioFiltrarRespuestas.patchValue({
      buscar: '',
      fechaDesde: fechaInicio,
      fechaHasta: new Date(),
      plazo: null,
      origen: null
    })

    this.obtenerRespuestas()
  }

  public filtrarCasos(): void {
    let textoBusqueda = this.formularioFiltrarRespuestas.get('buscar')!.value;
    this.respuestaSuperiorFiltrada = this.respuestasSuperior.filter(item =>
      Object.values(item).some((fieldValue: any) =>
        (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
        fieldValue?.toString()?.toLowerCase().includes(textoBusqueda?.toLowerCase())
      )
    );

    this.itemPaginado.data.data = this.respuestaSuperiorFiltrada
    this.itemPaginado.data.total = this.totalRespuestas = this.respuestaSuperiorFiltrada.length
    this.actualizarPaginaRegistros(this.respuestaSuperiorFiltrada, true)
  }

  public exportarPdfExcel(exportType: TipoArchivoType): void {
    if (this.respuestasSuperior.length > 0) {

      const headers = ['Número de caso / Cuaderno Incidental', 'Etapa', 'Fiscal Superior', 'Último trámite', 'Delitos', 'F. Elevación', 'F. Respuesta']
      const data: any[] = [];

      this.respuestasSuperior.forEach((caso: any) => {
        const row = {
          'Número de caso / Cuaderno Incidental': caso.numeroCaso,
          'Etapa': caso.origen,
          'Fiscal Superior': caso.tipoRemitente,
          'Último trámite': caso.remitente,
          'Delitos': caso.telefono,
          'F. Elevación': caso.correo,
          'F. Respuesta': caso.fechaIngreso
        }
        data.push(row)
      })

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Respuestas del Superior')
        : this.exportarService.exportarAExcel(data, headers, 'Respuestas del Superior')
      return;
    }
    this.messageService.add({
      severity: 'warn',
      detail: `No se encontraron registros para ser exportados a ${exportType}`
    })


  }

  protected eventoMostrarDetalle(idEtapa: string, idCaso: string, idActoTramiteCasoElevacion: string, idActoTramiteCasoRespuesta: string) {
    const modalDetalle = this.dialogService.open(RespuestaSuperiorModalComponent, {
      showHeader: false,
      styleClass: 'cfe-modal-xxl',
      data: {
        idEtapa: idEtapa,
        idCaso: idCaso,
        idActoTramiteCasoElevacion: idActoTramiteCasoElevacion,
        idActoTramiteCasoRespuesta: idActoTramiteCasoRespuesta
      }
    });
    modalDetalle.onClose.subscribe({
      next: (rs) => {
        if (rs === 'exito') {
          this.obtenerRespuestas();
        } else if (rs === 'aceptarCaso') {
          const ruta = `${urlConsultaCasoFiscal({ idEtapa: idEtapa, idCaso: idCaso, flgConcluido: '0' })}/acto-procesal`;
          this.router.navigate([ruta])
            .then(() => {
              window.location.reload();//Forzar la actualización para forzar la actualización menú lateral
            });;
        }
      }
    });
  }

  flatDelitos(delitos: string) {
    return delitos.length > 20 ? delitos.substring(0, 20) + '...' : delitos.toLowerCase();
  }

  public obtenerClaseDeOrigen(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase()
  }

  protected abrirModalHistorial(dataSuperior: any): void {
    this.dialogService.open(HistorialElevacionComponent, {
      showHeader: false,
      width: '90%',
      contentStyle: { overflow: 'auto' },
      data: {
        idBandejaElevacion: dataSuperior.idBandejaElevacion
      }
    });
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage)
  }

  actualizarPaginaRegistros(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.respuestaSuperiorFiltrada = data.slice(start, end);
  }

  protected etiqueta(caso: any) {
    return this.consultaCasosGestionService.getEtiquetaXTipoElevacion(caso.idTipoElevacion.toString(), {
      etiqueta: caso.descTipoElevacion
    }, '2');
  }
  protected etiqueta2(caso: any) {
    return this.consultaCasosGestionService.getEtiquetaXTipoElevacion(caso.idTipoElevacion.toString(), {
      esContiendaCompetencia: caso.idTipoContienda.toString(),
      nuApelacion: caso.nuPestana,
      nuCuaderno: caso.nuCuaderno
    }, '2');
  }

  protected startTour(): void {
    setTimeout(() => {
      this.tourService.startTour(this.stepsComponente);
    }, 500);
  }

  private stepsComponente = [
    {
      attachTo: { element: '.tour-a-1', on: 'top' },
      title: '1. Pestaña de apelación',
      text: 'Aquí puede ver la información de la pestaña de apelación'
    },
    {
      attachTo: { element: '.tour-a-2', on: 'bottom' },
      title: '2. Busqueda',
      text: 'Ingrese un texto para realizar una busqueda en todos los registros'
    },
    {
      attachTo: { element: '.tour-a-3', on: 'top' },
      title: '3. Busqueda avanzada',
      text: 'Al hacer clic se desplegaran campos para realizar una busqueda mas precisa'
    },
    {
      attachTo: { element: '.tour-a-4', on: 'bottom' },
      title: '4. Historial',
      text: 'Al hacer clic se abrirá una ventana con información historica de la pestaña de apelación'
    },
    {
      attachTo: { element: '.tour-a-5', on: 'bottom' },
      title: '5. Detalle',
      text: 'Al hacer clic se desplegara una ventana con la información de la respuesta del fiscal superior, de ser necesario podrá realizar una observación'
    }
  ];

}
