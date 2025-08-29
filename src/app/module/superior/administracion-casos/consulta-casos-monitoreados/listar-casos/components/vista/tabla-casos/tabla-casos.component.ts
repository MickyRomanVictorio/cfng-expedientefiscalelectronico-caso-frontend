import { JsonPipe, NgIf, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { obtenerCasoHtml } from 'ngx-cfng-core-lib';
import { TableModule } from 'primeng/table';
import { BarraProgresoCasoComponent } from '../../carpeta-caso/barra-progreso-caso/barra-progreso-caso.component';
import { DialogService } from 'primeng/dynamicdialog';
import { DelitosYPartesModalComponent } from '@core/components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { Caso } from '../../../models/listar-casos.model';
import { EtiquetaBotonesComponent } from '../../carpeta-caso/etiqueta-acciones-caso/etiqueta-botones/etiqueta-botones.component';
import { EtiquetaAccionesCasoComponent } from '../../carpeta-caso/etiqueta-acciones-caso/etiqueta-acciones-caso.component';
import { EtiquetaAccionesComponent } from "../../carpeta-caso/etiqueta-acciones-caso/etiqueta-acciones/etiqueta-acciones.component";

@Component({
  selector: 'app-tabla-casos',
  standalone: true,
  imports: [
    TableModule,
    PaginatorComponent,
    BarraProgresoCasoComponent, JsonPipe,
    NgIf,
    NgClass,
    EtiquetaAccionesCasoComponent,
    EtiquetaBotonesComponent,
    EtiquetaAccionesComponent
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
  public casoSeleccionado = new EventEmitter<Caso>();

  protected obtenerCasoHtml = obtenerCasoHtml;

  protected leyendaPlazosCss: { [key:number]: string } = {1:'dentro-del-plazo',2:'plazo-por-vencer',3:'plazo-vencido'};

  protected pagina!: number;

/**
 * Constructor
 *
 * @param dialogService Servicio para abrir dialogs
 */
  constructor(
    private readonly dialogService: DialogService
  ){
  }

  ngOnInit(): void {
    this.pagina = this.paginacionCondicion.page;
  }

  protected eventoCambiarPagina(paginacion: PaginacionInterface){
    this.pagina = paginacion.page;
    this.cambiarPagina.emit(paginacion);
  }

  protected getFilaEstilo(caso: any) {
    if (caso.flgLectura === '1') return '#1B1C1E';
    if (
      caso.plazos.filter((x: any) => x.flgNivel == 'C' && x.indSemaforo == 3).length > 0
    )
      return '#F4D8D8';
    return '#E7EAED';
  }

  protected getLeyenda(caso: any) {
    const plazo = caso.plazos.find((x: any) => x.flgNivel == 'C');
    if(plazo!=null){
      return this.leyendaPlazosCss[plazo.indSemaforo];
    }
    return null;
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

  protected eventoCasoSeleccionado(caso: Caso) {
    this.casoSeleccionado.emit(caso);
  }

}
