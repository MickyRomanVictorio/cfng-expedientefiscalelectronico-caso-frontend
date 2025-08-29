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
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { PaginacionCondicion, PaginacionConfiguracion } from '@core/components/consulta-casos/models/listar-casos.model';
import { TarjetasCuadernosExtremosComponent } from './tarjetas-cuadernos-extremos/tarjetas-cuadernos-extremos.component';
import { Expediente } from '@core/utils/expediente';


@Component({
  selector: 'app-grilla-cuadernos-extremos',
  standalone: true,
  templateUrl: './grilla-cuadernos-extremos.component.html',
  imports: [
    ButtonModule,
    DataViewModule,
    TarjetasCuadernosExtremosComponent,
    TagModule,
    PaginatorComponent
  ],
})
export class GrillaCuadernosExtremosComponent  {
  @Input()
  public listaCasos: any[] = [];

  @Input()
  public casoPadre!: Expediente;

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

  @Output()
  public actualizarListaCuadernos = new EventEmitter<void>();

  protected eventoCambiarPagina(paginacion: PaginacionInterface){
    this.cambiarPagina.emit(paginacion);
  }
}
