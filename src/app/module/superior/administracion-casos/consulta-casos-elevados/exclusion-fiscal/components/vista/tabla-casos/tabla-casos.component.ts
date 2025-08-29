import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BarraProgresoCasoComponent } from '@core/components/consulta-casos/components/carpeta-caso/barra-progreso-caso/barra-progreso-caso.component';
import { CasoFiscal } from '@core/components/consulta-casos/models/listar-casos.model';
import { ConsultaCasosGestionService } from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { DelitosYPartesModalComponent } from '@core/components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { VisorEfeModalComponent } from '@core/components/modals/visor-efe-modal/visor-efe-modal.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { PerfilJerarquia } from '@core/models/usuario-auth.model';
import { DateFormatPipe, obtenerCasoHtml } from 'ngx-cfng-core-lib';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { EtiquetaCasoComponent } from "../../../../../../../../core/components/consulta-casos/components/carpeta-caso/etiqueta-caso/etiqueta-caso.component";
import { TokenService } from '@core/services/shared/token.service';

@Component({
  selector: 'app-tabla-casos',
  standalone: true,
  imports: [
    TableModule,
    PaginatorComponent,
    BarraProgresoCasoComponent,
    DateFormatPipe,
    MenuModule,
    DialogModule,
    ButtonModule,
    EtiquetaCasoComponent,
  
],
  templateUrl: './tabla-casos.component.html',
  styleUrl: './tabla-casos.component.scss'
})
export class TablaCasosComponent implements OnInit {
  //public casofiscal = input.required<CasoFiscal>();
  @Input()
  public listaCasos: any[] = [];

  @Input({ required: true })
  public paginacionCondicion: any;

  @Input({ required: true })
  public paginacionConfiguracion: any;

  @Input({ required: true })
  public paginacionReiniciar: boolean = false;

  @Input()
  public procesadoCriterioBusqueda: boolean = false;

  @Output()
  public cambiarPagina = new EventEmitter<PaginacionInterface>();

  @Output()
  public casoSeleccionado = new EventEmitter<CasoFiscal>();
  protected mostrarDelitos: boolean = false;
  protected obtenerCasoHtml = obtenerCasoHtml;
  private idcasoSeleccionadoLista: string = '';
  protected casoSeleccionadoLista!: CasoFiscal ;
  protected pagina!: number;
  protected opcionesCaso: MenuItem[] = [];
  protected referenciaModal!: DynamicDialogRef;
  protected PerfilJerarquia = PerfilJerarquia;
  protected usuario: any;
  /**
   * Constructor
   *
   * @param dialogService Servicio para abrir dialogs
   */
  constructor(
    private readonly dialogService: DialogService,
    protected readonly consultaCasosGestionService: ConsultaCasosGestionService,
    private readonly tokenService: TokenService
  ) {
    this.usuario = this.tokenService.getDecoded().usuario;
  }

  ngOnInit(): void {
    this.opcionesCaso = [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarVisorDocumental(this.idcasoSeleccionadoLista);
        }
      },
      {
        label: 'Ver Delitos y Partes',
        icon: 'file-search-icon',
        command: () => {
          this.eventoVerDelitos();
        }
      }
    ];
    this.pagina = this.paginacionCondicion.page;
  }
  private mostrarVisorDocumental(idCaso: string): void {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      contentStyle: { "padding": 0 },
      data: { idCaso: idCaso }
    });
  }
  protected eventoCambiarPagina(paginacion: PaginacionInterface) {
    this.pagina = paginacion.page;
    this.cambiarPagina.emit(paginacion);
  }

  protected getFilaEstilo(caso: CasoFiscal): string {
    return this.consultaCasosGestionService.getFilaEstilo(PerfilJerarquia.Superior, caso);
  }

  protected eventoVerDelitosPartes(numeroCaso: any) {
   // e.stopPropagation();
    this.dialogService.open(DelitosYPartesModalComponent, {
      showHeader: false,
      data: {
        numeroCaso: numeroCaso
      }
    });
  }

  protected eventoCasoSeleccionado(caso: CasoFiscal) {
    this.casoSeleccionado.emit(caso);
  }
  protected eventoMostrarOpcionesCaso(event: Event, menu: any, caso: any) {
    this.idcasoSeleccionadoLista = caso.idCaso || '';
    this.casoSeleccionadoLista = caso;
    event.stopPropagation();
    menu.toggle(event);
  }
  protected eventoVerDelitos() {
   // event.stopPropagation();
    this.mostrarDelitos = true;
  }
  protected eventoCerrarDelitos(event: Event) {
    event.stopPropagation();
    this.mostrarDelitos = false;
  }
  protected etiquetas2(caso:any){
    return this.consultaCasosGestionService.getEtiquetaXTipoElevacion(caso.idTipoElevacion, {
      esContiendaCompetencia: caso.contiendaCompetencia,
      nuApelacion: caso.numeroApelacion,
      nuCuaderno: caso.nuCuaderno
    }, '2');
  }
}
