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
import { CasoFiscal, PaginacionCondicion, PaginacionConfiguracion } from '@core/components/consulta-casos/models/listar-casos.model';
import { CarpetaCasoComponent } from './carpeta-caso/carpeta-caso.component';


@Component({
  standalone: true,
  selector: 'app-tarjeta-casos',
  templateUrl: './tarjeta-casos.component.html',
  imports: [
    ButtonModule,
    DataViewModule,
    TagModule,
    CarpetaCasoComponent,
    PaginatorComponent
  ],
})
export class TarjetaCasosComponent {

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
