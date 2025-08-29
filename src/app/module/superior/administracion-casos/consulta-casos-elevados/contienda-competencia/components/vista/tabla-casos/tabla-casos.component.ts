import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BarraProgresoCasoComponent } from '@core/components/consulta-casos/components/carpeta-caso/barra-progreso-caso/barra-progreso-caso.component';
import { CasoFiscal } from '@core/components/consulta-casos/models/listar-casos.model';
import { ConsultaCasosGestionService } from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { DelitosYPartesModalComponent } from '@core/components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { PerfilJerarquia } from '@core/models/usuario-auth.model';
import { DateFormatPipe, obtenerCasoHtml } from 'ngx-cfng-core-lib';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import {RouterLink} from "@angular/router";
import {MenuOpcionesCasoComponent} from "@components/reutilizable/menu-opciones-caso/menu-opciones-caso.component";

@Component({
  selector: 'app-tabla-casos',
  standalone: true,
  imports: [
    TableModule,
    PaginatorComponent,
    BarraProgresoCasoComponent,
    DateFormatPipe,
    RouterLink,
    MenuOpcionesCasoComponent
  ],
  templateUrl: './tabla-casos.component.html',
  styleUrl: './tabla-casos.component.scss'
})
export class TablaCasosComponent implements OnInit {

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

  protected obtenerCasoHtml = obtenerCasoHtml;

  protected pagina!: number;

/**
 * Constructor
 *
 * @param dialogService Servicio para abrir dialogs
 */
  constructor(
    private readonly dialogService: DialogService,
    protected readonly consultaCasosGestionService: ConsultaCasosGestionService
  ){
  }

  ngOnInit(): void {
    this.pagina = this.paginacionCondicion.page;
  }

  protected eventoCambiarPagina(paginacion: PaginacionInterface){
    this.pagina = paginacion.page;
    this.cambiarPagina.emit(paginacion);
  }

  protected getFilaEstilo(caso: CasoFiscal):string {
    return this.consultaCasosGestionService.getFilaEstilo(PerfilJerarquia.Superior, caso);
  }

  protected eventoVerDelitosPartes(e:Event,caso: any) {
    e.stopPropagation();
    this.dialogService.open(DelitosYPartesModalComponent, {
      showHeader: false,
      data: {
        numeroCaso: caso.numeroCaso
      }
    });
  }

  protected eventoCasoSeleccionado(caso: CasoFiscal) {
    this.casoSeleccionado.emit(caso);
  }

}
