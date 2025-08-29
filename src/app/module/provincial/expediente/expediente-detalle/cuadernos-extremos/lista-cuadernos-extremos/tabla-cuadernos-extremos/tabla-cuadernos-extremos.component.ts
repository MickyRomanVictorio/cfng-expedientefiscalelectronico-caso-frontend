import { JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { obtenerCasoHtml } from 'ngx-cfng-core-lib';
import { TableModule } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { DelitosYPartesModalComponent } from '@core/components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { BarraProgresoCasoComponent } from '../grilla-cuadernos-extremos/tarjetas-cuadernos-extremos/barra-progreso-caso/barra-progreso-caso.component';
import { Expediente } from '@core/utils/expediente';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-tabla-cuadernos-extremos',
  standalone:true,
    imports: [
      TableModule,
      PaginatorComponent,
      BarraProgresoCasoComponent,
      DialogModule,
      ButtonModule,
      
    ],
  templateUrl: './tabla-cuadernos-extremos.component.html',
  styleUrls: ['./tabla-cuadernos-extremos.component.scss']
})
export class TablaCuadernosExtremosComponent implements OnInit {

  @Input()
  public listaCasos: any[] = [];

  @Input()
  public casoPadre!: Expediente;

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


  public caso:any = null;


  protected obtenerCasoHtml = obtenerCasoHtml;

  protected pagina!: number;
  
  protected mostrarDelitos: boolean = false;


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

  protected verDelitoInicio(delitos: any[]) {
    const result = delitos.slice(0, 2).map(curr => curr.nombre.toLowerCase().replace(/^\w/, (match: string) => match.toUpperCase())).join(', ');
    return result.length > 20 ? result.substring(0, 20) + '...' : result;
  }

  protected eventoVerDelitos(event:Event) {
    event.stopPropagation();
    this.mostrarDelitos = true;
  }
  protected eventoCerrarDelitos(event:Event){
    event.stopPropagation();
    this.mostrarDelitos = false;
  }
}
