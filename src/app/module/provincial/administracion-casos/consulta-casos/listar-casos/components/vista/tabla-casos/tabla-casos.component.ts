import { CommonModule, JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { DateFormatPipe, obtenerCasoHtml } from 'ngx-cfng-core-lib';
import { TableModule } from 'primeng/table';
import { BarraProgresoCasoComponent } from '../../carpeta-caso/barra-progreso-caso/barra-progreso-caso.component';
import { DialogService } from 'primeng/dynamicdialog';
import { DelitosYPartesModalComponent } from '@core/components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';

@Component({
  selector: 'app-tabla-casos',
  standalone: true,
  imports: [
    TableModule,
    PaginatorComponent,
    BarraProgresoCasoComponent, JsonPipe,
    CommonModule, DateFormatPipe
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
    private readonly dialogService: DialogService
  ){
  }

  ngOnInit(): void {
    console.log("lista casos", this.listaCasos);
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
