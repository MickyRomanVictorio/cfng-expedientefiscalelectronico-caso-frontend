import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BreadCrum } from '@core/interfaces/comunes/breadcrumb';
import { CalificarCaso } from '@core/interfaces/provincial/administracion-casos/calificacion/CalificarCaso';
import { RouterParamService } from '@core/services/shared/router-param.service';
import { CalificarCasoService } from '@services/provincial/calificar/calificar-caso.service';
import { filter, Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  imports: [CommonModule, RouterModule, JsonPipe],
})
export class BreadcrumbComponent implements OnInit, OnChanges {

  @Input() routes: BreadCrum[] = [];
  @Input() idCaso!: string | null;

  readonly URL_SEGUIMIENTO_EJECUCION = '/app/administracion-casos/consultar-casos-fiscales/seguimiento-ejecucion';

  numeroCaso: string = '';

  public subscriptions: Subscription[] = [];
  public calificarCaso!: CalificarCaso;

  constructor(
    private routerParamService: RouterParamService,
    private calificarCasoService: CalificarCasoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.idCaso) {
      this.obtenerInformacionCalificarCaso(this.idCaso);
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idCaso']) {
      const nuevoId = changes['idCaso'].currentValue;
      if (nuevoId) {
        this.obtenerInformacionCalificarCaso(nuevoId);
      } else {
        this.numeroCaso = ''; // Limpiar si se borra el idCaso
      }
    }
    //solo para la bandeja de SEGUIMIENTO DE EJECUCIÓN
    if (changes['routes']) {
      const rutaActual = this.router.url;
      if (rutaActual === this.URL_SEGUIMIENTO_EJECUCION) {
        this.routes = this.routes.filter((item, index) => index !== 1); // Oculta solo el segundo breadcrumb
      }
    }
  }

  /*ngDoCheck(): void {
  }*/

  protected eventoCambiarPagina(index: number) {
    //Eliminar el contenido siguiente del vinculo seleccionado
    this.routes = this.routes.slice(0, index + 1);
  }

  public obtenerInformacionCalificarCaso(idCaso: string) {
    this.subscriptions.push(
      this.calificarCasoService
        .obtenerInformacionCalificarCaso(idCaso)
        .subscribe({
          next: (resp) => {
            this.calificarCaso = resp;
            /**if (this.calificarCaso !== null)
            this.numeroCaso = this.calificarCaso.coCaso;**/
            this.numeroCaso = this.calificarCaso?.coCaso || '';
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
