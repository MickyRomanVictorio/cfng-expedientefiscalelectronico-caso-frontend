import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
import { DocumentosBandejaComponent } from '@core/components/documentos-bandeja/documentos-bandeja.component';
import { ID_TIPO_BANDEJA_DOCUMENTOS_INGRESADOS } from '@core/types/tipo-bandeja-documentos-ingresados';
import { Tab } from '@interfaces/comunes/tab';
import { DocumentoIngresadoNuevo } from '@interfaces/provincial/documentos-ingresados/DocumentoIngresadoNuevo';
import { DocumentoIngresadoNuevoRequest } from '@interfaces/provincial/documentos-ingresados/DocumentoIngresadoNuevoRequest';
import { DocumentosIngresadosService } from '@services/provincial/documentos-ingresados/documentos-ingresados.service';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TabViewModule } from 'primeng/tabview';
import { Subscription } from 'rxjs';
import { DocumentosAgendaComponent } from './documentos-agenda/documentos-agenda.component';
import { DocumentosNuevosFiltroComponent } from './documentos-nuevos-filtro/documentos-nuevos-filtro.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';

@Component({
  standalone: true,
  selector: 'app-documentos-ingresados',
  templateUrl: './documentos-ingresados.component.html',
  styleUrls: ['./documentos-ingresados.component.scss'],
  imports: [
    NgIf,
    TabViewModule,
    TabsViewComponent,
    DocumentosNuevosFiltroComponent,
    DocumentosAgendaComponent,
    DocumentosBandejaComponent,
  ],
  providers: [MessageService, DialogService, DatePipe],
})
export class DocumentosIngresadosComponent implements OnInit {
  @ViewChild(DocumentosNuevosFiltroComponent)
  filtroComponent!: DocumentosNuevosFiltroComponent;

  protected subscriptions: Subscription[] = [];

  protected listaBandejaActiva: DocumentoIngresadoNuevo[] = [];
  protected listaBandejaInicial: DocumentoIngresadoNuevo[] = [];
  protected requestIni!: DocumentoIngresadoNuevoRequest;

  //paginación
  protected paginacionCondicion: any = { limit: 10, page: 1, where: {} }//paginacionCondicion
  protected paginacionReiniciar: boolean = false;//paginacionReiniciar
  protected paginacionConfiguracion: any = {//paginacionConfiguracion
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  protected tabs: Tab[] = [
    {
      titulo: 'Nuevos',
      ancho: 150,
    },
    {
      titulo: 'Recibidos',
      ancho: 120,
    },
    {
      titulo: 'Observados',
      ancho: 140,
    },
    {
      titulo: 'No Presentados',
      ancho: 180,
    },
  ];
  protected tabActivo: number = 0;
  protected tabConfig: any = {
    0: { title: 'Documentos nuevos' },
    1: { title: 'Documentos recibidos' },
    2: { title: 'Documentos observados' },
    3: { title: 'Documentos no presentados' },
  };

  protected idBandeja: number = 0;

  limpiarFiltros: { state: boolean } = { state: false };

  constructor(
    private documentosIngresadosService: DocumentosIngresadosService
  ) { }

  ngOnInit(): void {
    this.idBandeja = ID_TIPO_BANDEJA_DOCUMENTOS_INGRESADOS.NUEVOS;
  }

  protected cambiarTab(indiceTab: number) {
    this.tabActivo = indiceTab;
    if (this.filtroComponent) {
      this.idBandeja = this.setIdBandeja();
      this.filtroComponent.idBandeja = this.setIdBandeja();
      this.filtroComponent.buscarInicial();
    }
  }

  protected getTitleDocumento(tabIndex: number): string {
    return this.tabConfig[tabIndex].title;
  }

  protected setIdBandeja(): number {
    let id = 0;
    switch (this.tabActivo) {
      case 0:
        id = ID_TIPO_BANDEJA_DOCUMENTOS_INGRESADOS.NUEVOS;
        break;
      case 1:
        id = ID_TIPO_BANDEJA_DOCUMENTOS_INGRESADOS.RECIBIDOS;
        break;
      case 2:
        id = ID_TIPO_BANDEJA_DOCUMENTOS_INGRESADOS.OBSERVADOS;
        break;
      case 3:
        id = ID_TIPO_BANDEJA_DOCUMENTOS_INGRESADOS.NO_PRESENTADOS;
        break;
    }
    return id;
  }

  protected buscarFiltros(request: DocumentoIngresadoNuevoRequest) {
    this.requestIni = request;
    this.obtenerDocumentosIngresados(request);
  }

  protected buscarTexto(buscado: string) {
    this.listaBandejaActiva = this.listaBandejaInicial.filter((data) =>
      this.obtenerFiltroBuscador(data, buscado)
    );

    this.paginacionConfiguracion.data.data = this.listaBandejaActiva;
    this.paginacionConfiguracion.data.total = this.listaBandejaActiva.length;
    this.actualizarListaCasosPaginacion(this.listaBandejaActiva, true);
  }

  protected obtenerDocumentosIngresados(request: DocumentoIngresadoNuevoRequest): void {
    this.listaBandejaActiva = [];
    this.listaBandejaInicial = [];
    this.documentosIngresadosService
      .obtenerDocumentosIngresadosNuevos(request)
      .subscribe({
        next: (response) => {
          this.listaBandejaActiva = response.data;
          this.listaBandejaInicial = response.data;

          this.paginacionConfiguracion.data.data = this.listaBandejaActiva;
          this.paginacionConfiguracion.data.total = response.total;
          if (this.tabActivo == 0) {
            const tab = this.tabs.find(f => f.id == this.tabActivo);
            if (tab) tab.cantidad = response.total;
          }
        },
        error: (error) => {
          console.error('Error:', error);
        }
      });
  }

  protected obtenerFiltroBuscador(data: any, buscado: string): boolean {
    return Object.values(data).some(
      (fieldValue) =>
        (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
        fieldValue?.toString()?.toLowerCase().includes(buscado.toLowerCase())
    );
  }

  eventoCambiarPagina(paginacion: PaginacionInterface) {
    this.paginacionCondicion.page = paginacion.page;
    this.paginacionCondicion.limit = paginacion.limit;
    this.requestIni.page = paginacion.page;
    this.obtenerDocumentosIngresados(this.requestIni);
  }

  actualizarListaCasosPaginacion(data: any, reset: boolean) {
    this.paginacionReiniciar = reset;
    const start = (this.paginacionCondicion.page - 1) * this.paginacionCondicion.limit;
    const end = start + this.paginacionCondicion.limit;
    this.listaBandejaActiva = data.slice(start, end);
  }

}
