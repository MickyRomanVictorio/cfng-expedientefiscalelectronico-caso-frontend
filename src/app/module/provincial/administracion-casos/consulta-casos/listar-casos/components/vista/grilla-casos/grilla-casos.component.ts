import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { Caso, PaginacionCondicion, PaginacionConfiguracion } from '../../../models/listar-casos.model';
import { BarraProgresoCasoComponent } from '../../carpeta-caso/barra-progreso-caso/barra-progreso-caso.component';
import { CarpetaCasoComponent } from '../../carpeta-caso/carpeta-caso.component';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';


@Component({
  standalone: true,
  selector: 'app-grilla-casos',
  templateUrl: './grilla-casos.component.html',
  imports: [
    ButtonModule,
    DataViewModule,
    CarpetaCasoComponent,
    TagModule,
    BarraProgresoCasoComponent,
    PaginatorComponent
  ],
})
export class GrillaCasosComponent {
  @Input()
  public listaCasos: any[] = [];

  @Input({ required: true })
  public paginacionCondicion!: PaginacionCondicion;

  @Input({ required: true })
  public paginacionConfiguracion!: PaginacionConfiguracion;

  @Input({ required: true })
  public paginacionReiniciar: boolean = false;

  @Output()
  public cambiarPagina = new EventEmitter<PaginacionInterface>();

  @Output()
  public casoSeleccionado = new EventEmitter<CasoFiscal>();

  protected eventoCambiarPagina(paginacion: PaginacionInterface){
    this.cambiarPagina.emit(paginacion);
  }
}
