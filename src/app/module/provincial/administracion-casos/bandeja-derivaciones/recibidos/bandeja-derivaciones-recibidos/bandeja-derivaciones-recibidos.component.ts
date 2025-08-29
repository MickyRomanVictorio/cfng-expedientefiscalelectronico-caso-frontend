import { CommonModule, DatePipe, NgClass, NgIf, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
import { DateMaskModule } from '@directives/date-mask.module';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { MenuItem } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { Subscription } from 'rxjs';
import { DerivacionesRecibidosService } from "@services/provincial/bandeja-derivaciones/recibidos/derivaciones-recibidos.service";
import { FormBuscarService } from "@services/provincial/bandeja-derivaciones/recibidos/form-buscar.service";
import { TabRecibidosComponent } from "@modules/provincial/administracion-casos/bandeja-derivaciones/recibidos/tab-recibidos/tab-recibidos.component";
import { Tab } from '@core/interfaces/comunes/tab';

@Component({
  standalone: true,
  imports: [CommonModule,
    TabViewModule,
    TabMenuModule,
    CmpLibModule,
    TabsViewComponent,
    CalendarModule,
    CmpLibModule,
    DateMaskModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    RadioButtonModule, TabRecibidosComponent],
  selector: 'app-bandeja-derivaciones-recibidos',
  templateUrl: './bandeja-derivaciones-recibidos.component.html',
  styleUrls: ['./bandeja-derivaciones-recibidos.component.scss'],
  providers: [DatePipe, TitleCasePipe, DerivacionesRecibidosService, FormBuscarService, DerivacionesRecibidosService],
})

export class BandejaDerivacionesRecibidosComponent implements OnInit {
  public mostrarFiltros = false;
  public subscriptions: Subscription[] = [];

  public showFilterDate: boolean = true;
  public filterDateLabel: string = '';
  public filterTipoDateLabel: string = '';

  //---------------------------------------------------
  itemsDerivados: MenuItem[] = [
    {
      label: "Por revisar",
      routerLink: `derivado-de/derivado-por-revisar`,
    },
    {
      label: "Aceptados",
      routerLink: 'derivado-de/derivado-aceptados',
    },
    {
      label: "Devueltos",
      routerLink: `derivado-de/derivado-devueltos`,
    },
    {
      label: "Revertidos",
      routerLink: `derivado-de/derivado-revertidos`,
    }
  ];
  itemsAcumulados: MenuItem[] = [
    {
      label: "Por revisar",
      routerLink: `acumulado-de/acumulado-por-revisar`,
    },
    {
      label: "Aceptados",
      routerLink: `acumulado-de/acumulados-aceptados`,
    },
    {
      label: "Devueltos",
      routerLink: `acumulado-de/acumulado-devueltos`,
    },
    {
      label: "Revertidos",
      routerLink: `acumulado-de/acumulado-revertidos`,
    }
  ];

  protected readonly  tabs: Tab[] = [
    {
      titulo: 'Derivado de',
      ancho: 170,
      rutaPadre: 'derivado-de',
      rutasHijas: 'derivado-por-revisar,derivado-aceptados,derivado-devueltos,derivado-revertidos',
    },
    {
      titulo: 'Acumulado de',
      ancho: 200,
      rutaPadre: 'acumulado-de',
      rutasHijas: 'acumulado-por-revisar,acumulados-aceptados,acumulado-devueltos,acumulado-revertidos',
    }
  ]

  public tabActivo: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public fs: FormBuscarService,
    public recibidosService: DerivacionesRecibidosService
  ) {
    this.tabActivo = this.router.url.includes('acumulado-de') ? 1 : 0
  }

  ngOnInit(): void {
    this.showFilterDate = false;
    this.filterDateLabel = 'Fecha de derivación';
    setTimeout(() => {
      this.revisarFiltrosActivos()
    }, 500);
  }

  cambiarTab(indiceTab: number) {
    this.tabActivo = indiceTab;
    if (indiceTab === 0) {
      this.router.navigate(['derivado-de/derivado-por-revisar'], { relativeTo: this.route });
    } else {
      this.router.navigate(['acumulado-de/acumulado-por-revisar'], { relativeTo: this.route });
    }

    // Simulando un evento para el tab 'Por revisar'
    const event = { label: 'Por revisar' };
    this.changeTab(event);
  }

  changeTab(event: any) {
    if (event.label === 'Por revisar') {
      this.showFilterDate = false;
      this.filterDateLabel = 'Fecha de derivación';
      /**this.fs.form.patchValue({
        tipoFecha: '1'  // Valor para el primer tab (puedes ajustarlo según tu lógica)
      });**/
    } else {
      if (event.label === 'Aceptados') {
        this.filterTipoDateLabel = 'Fecha de aceptación';
      }
      if (event.label === 'Devueltos') {
        this.filterTipoDateLabel = 'Fecha de devolución';
      }
      if (event.label === 'Revertidos') {
        this.filterTipoDateLabel = 'Fecha de reversión';

      }
      this.showFilterDate = true;
      this.filterDateLabel = 'Fecha:'
      /**this.fs.form.patchValue({
        tipoFecha: '0'  // Valor para el primer tab (puedes ajustarlo según tu lógica)
      });**/
    }
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  private revisarFiltrosActivos() {
    const url = this.router.url;
    if ( url.includes('revisar') ) {
      this.showFilterDate = false;
      this.filterDateLabel = 'Fecha de derivación';
    }
    else {
      if ( url.includes('aceptados') ) {
        this.filterTipoDateLabel = 'Fecha de aceptación';
      }
      if ( url.includes('devuelto') ) {
        this.filterTipoDateLabel = 'Fecha de devolución';
      }
      if ( url.includes('revertido') ) {
        this.filterTipoDateLabel = 'Fecha de reversión';
      }
      this.showFilterDate = true;
      this.filterDateLabel = 'Fecha:'
    }
  }

  buscar() {
    const request = this.fs.values;
    this.recibidosService.enviarFiltroRequest(request);
  }

  buscarSegunTexto() {
    const texto = this.fs.fieldBuscar!.value!;
    this.recibidosService.enviarTextoBuscado(texto);
  }

  navegar(event: any) {
    if (event.item.routerLink) {
      console.log(event.item.routerLink)
      this.router.navigate(event.item.routerLink)
    }
  }

}
