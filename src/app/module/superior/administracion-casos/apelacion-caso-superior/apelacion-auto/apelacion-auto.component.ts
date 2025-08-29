import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CasoFiscal,
  PaginacionCondicion,
  PaginacionConfiguracion,
  TipoExportar,
  TipoVistaEnum,
} from '@core/components/consulta-casos/models/listar-casos.model';
import { OnInit, signal } from '@angular/core';
import { CasosElevadosService } from '@core/services/superior/casos-elevados/casos-monitoreados.service';
import { TipoElevacionCodigo } from '@core/constants/superior';
import { ConsultaCasosGestionService } from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import { FiltrarConsultaCasoComponent } from '../../consulta-casos-elevados/contienda-competencia/components/filtrar-consulta-caso/filtrar-consulta-caso.component';
import { IconAsset } from 'dist/ngx-cfng-core-lib';
import { ExportarService } from '@core/services/shared/exportar.service';
import { TarjetaCasosComponent } from "../../consulta-casos-elevados/elevacion-actuados/components/vista/tarjeta-casos/tarjeta-casos.component";
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { TablaCasosComponent } from '../../consulta-casos-elevados/contienda-competencia/components/vista/tabla-casos/tabla-casos.component';


@Component({
  selector: 'app-apelacion-auto',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    CmpLibModule,
    FiltrarConsultaCasoComponent,
    TablaCasosComponent,
    TarjetaCasosComponent
],
  templateUrl: './apelacion-auto.component.html',
  styleUrls: ['./apelacion-auto.component.scss'],
  providers: [MessageService, DialogService, DatePipe],
})
export class ApelacionAutoComponent {
  protected listaCasosOriginal: CasoFiscal[] = [];
  protected listaCasos: CasoFiscal[] = [];
  public id_apelacion: number = 0;
  protected tipoVista: TipoVistaEnum = TipoVistaEnum.Tarjeta;
  protected datosRutaCondicion: any = {};
  protected leyendaPlazos = signal<any[]>([]);
  protected procesadoCriterioBusqueda: boolean = false;
  protected paginacionCondicion: PaginacionCondicion = {
    limit: 9,
    page: 1,
    where: {},
  };
  public paginacionConfiguracion: PaginacionConfiguracion = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  protected paginacionReiniciar: boolean = false;
  private readonly datosRuta: any = {};
  protected TipoVistaEnum = TipoVistaEnum;
  protected TipoExportarEnum = TipoExportar;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly casosElevadosService: CasosElevadosService,
    protected readonly consultaCasosGestionService: ConsultaCasosGestionService,
    protected iconAsset: IconAsset,
      private readonly exportarService:ExportarService
  ) {
    this.leyendaPlazos.set(this.consultaCasosGestionService.getLeyendaPlazos());
  }
  ngOnInit(): void {
    this.id_apelacion = this.route.snapshot.data['idTipoElevacion'];
    console.log(
      'id tipo elevacion apelacion',
      this.route.snapshot.data['idTipoElevacion']
    );
    this.obtenerDatos({ ...this.datosRuta, filtroTiempo: '0' });
  }
  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  verCasoResuelto() {
    const ruta = `app/administracion-casossuperior/apelacion/listar-casos-resueltos/${this.id_apelacion}`;
    this.router.navigate([`${ruta}`]);
  }

  protected eventoBuscar(datos: any) {
    this.obtenerDatos({ ...this.datosRuta, ...datos });
  }

  private obtenerDatos(datos: any) {
    this.casosElevadosService
      .obtenerCasos(TipoElevacionCodigo.ContiendaCompetencia, datos)
      .subscribe({
        next: (rs) => {
          this.listaCasosOriginal = rs.data;
          this.listaCasos = rs.data;
          //
          this.contarLeyendaPlazos(this.listaCasosOriginal);
          //
          this.paginacionConfiguracion.data.data = this.listaCasos;
          this.paginacionConfiguracion.data.total = this.listaCasos.length;
          this.actualizarListaCasosPaginacion(this.listaCasos, false);
        },
      });
  }
  private actualizarListaCasosPaginacion(datos: any, reiniciar: boolean) {
    this.paginacionReiniciar = reiniciar;
    const start =
      (this.paginacionCondicion.page - 1) * this.paginacionCondicion.limit;
    const end = start + this.paginacionCondicion.limit;
    this.listaCasos = datos.slice(start, end);
  }
  protected eventoBuscarPorTexto(bucarValor: string) {
    this.procesadoCriterioBusqueda = false;
    this.listaCasos = this.listaCasosOriginal.filter((data) =>
      Object.values(data).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(bucarValor.toLowerCase())
      )
    );
    if (bucarValor !== '' && this.listaCasos.length === 0) {
      this.procesadoCriterioBusqueda = true;
    }
    //
    this.contarLeyendaPlazos(this.listaCasos);
    //
    this.paginacionConfiguracion.data.data = this.listaCasos;
    this.paginacionConfiguracion.data.total = this.listaCasos.length;
    this.actualizarListaCasosPaginacion(this.listaCasos, true);
  }

  private contarLeyendaPlazos(casos: CasoFiscal[]) {
    const plazos = [0, 0, 0];
    casos.forEach((caso) => {
      if (caso.plazos && caso.plazos.length > 0) {
        const id = caso.plazos[0].indSemaforo;
        if (id === 1) {
          plazos[0]++;
        } else if (id === 2) {
          plazos[1]++;
        } else if (id === 3) {
          plazos[2]++;
        }
      }
    });
    const leyenda = this.consultaCasosGestionService.getLeyendaPlazos();
    plazos.forEach((plazo, index) => {
      leyenda[index].cantidad = plazo;
    });
    this.leyendaPlazos.set(leyenda);
  }
  protected eventoExportar(tipoExportar: TipoExportar): void {
    if (this.listaCasos.length > 0) {
      const headers = [
        'Número de caso',
        'Etapa',
        'Fiscal',
        'F. Registro',
        'F Último Trámite',
        'Último Acceso Procesal',
      ];
      const data: any[] = [];
      this.listaCasos.forEach((c: CasoFiscal) => {
        const row = {
          'Número de caso': c.numeroCaso,
          Etapa: c.etapa,
          Fiscal: c.fiscal,
          //'Delitos': c.delitos,
          'F. Registro': c.fechaIngreso,
          'F Último Trámite': c.fechaUltimoTramite,
          'Último Acceso Procesal': c.ultimoTramite,
        };
        data.push(row);
      });

      tipoExportar === TipoExportar.Pdf? this.exportarService.exportarAPdf(data, headers, 'casos_fiscales_monitoreados') : this.exportarService.exportarAExcel(data, headers, 'casos_fiscales_monitoreados');
    }
  }

  protected eventoTipoVista(e: Event, tipoVista: TipoVistaEnum) {
    e.preventDefault();
    this.tipoVista = tipoVista;
  }
   protected eventoCambiarPagina(datos:PaginacionInterface){
      this.paginacionCondicion.page = datos.page;
      this.paginacionCondicion.limit = datos.limit;
      this.actualizarListaCasosPaginacion(datos.data, datos.resetPage);
    }
    protected eventoCasoSeleccionado(caso:CasoFiscal){
      this.router.navigate([`caso/${caso.idCaso}/acto-procesal`], { relativeTo: this.route });
    }
}
