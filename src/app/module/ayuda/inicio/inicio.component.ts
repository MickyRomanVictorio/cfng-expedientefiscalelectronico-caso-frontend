import {Component, OnInit} from '@angular/core';
import {UsuarioAuthService} from '@core/services/auth/usuario.service.ts.service';
import {FormsModule} from "@angular/forms";
import {AutoCompleteModule} from "primeng/autocomplete";
import {PanelMenuModule} from "primeng/panelmenu";
import {MenuItem} from "primeng/api";
import {NgIf} from "@angular/common";
import {IconUtil} from 'ngx-cfng-core-lib';
import {CmpLibModule} from 'dist/cmp-lib';
import {AyudaService} from "@services/ayuda/ayuda.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AutocompletarComponent} from "@modules/ayuda/autocompletar/autocompletar.component";

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  standalone: true,
  selector: 'app-ayuda-inicio',
  styleUrls: ['./inicio.component.scss'],
  templateUrl: './inicio.component.html',
  imports: [
    FormsModule,
    AutoCompleteModule,
    PanelMenuModule,
    NgIf,
    CmpLibModule,
    AutocompletarComponent,
  ]
})
export class InicioComponent implements OnInit {

  protected esJerarquiaSuperior: boolean = false;

  items: any[] | undefined;
  pregunta: any;
  suggestions: any[] = [];
  menuItems: MenuItem[] = [];

  fakeCategorias: MenuItem[] = [
    {
      label: 'Asignación',
      items: [
        {
          label: 'Asignación de casos',
          idCategoria: 123,
          route: "detalle"
        },
        {
          label: 'Plazos de asignación',
          idCategoria: 123,
          route: "detalle"
        },
        {
          label: 'Orígenes de la asignación',
          idCategoria: 123,
          route: "detalle"
        },
        {
          label: 'Delitos y partes en la asignación',
          idCategoria: 123,
          route: "detalle"
        },
        {
          label: 'Visor documental en la asignación',
          idCategoria: 123,
          route: "detalle"
        },
        {
          label: 'Asuntos y observaciones en la asignación',
          idCategoria: 123,
          route: "detalle"
        },
        {
          label: 'Anular casos en la asignación',
          idCategoria: 123,
          route: "detalle"
        },
        {
          label: 'Reasignar casos',
          idCategoria: 123,
          route: "detalle"
        }
      ]
    },
    {
      label: 'Recepción',
    },
    {
      label: 'Etapa de Calificación',
    },
    {
      label: 'Etapa Preliminar',
    },
    {
      label: 'Etapa Preparatoria',
    },
    {
      label: 'Etapa Intermedia',
    },
    {
      label: 'Etapa de Juzgamiento',
    },
    {
      label: 'Etapa de Ejecución de Sentencia',
    },
    {
      label: 'Visor documental',
    },
    {
      label: 'Creación de trámite y firma digital',
    },
    {
      label: 'Bandeja de trámites',
    },
    {
      label: 'Documentos ingresados',
    },
    {
      label: 'Derivaciones',
    },
    {
      label: 'Exhortos',
    },
    {
      label: 'Contiendas de competencia',
    },
    {
      label: 'Alertas',
    },
    {
      label: 'Agenda',
    },
    {
      label: 'Reportes',
    }
  ];

  constructor(
    private readonly usuarioAuthService: UsuarioAuthService,
    protected iconUtil: IconUtil,
    private ayudaService: AyudaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.obtenerCategorias();
    this.esJerarquiaSuperior = this.usuarioAuthService.esJerarquiaSuperior();
  }

  private obtenerCategorias(): void {
    this.ayudaService.obtenerCategorias().subscribe({
      next: resp => {
        this.menuItems = resp.map((category: any) => (
          {
            label: category.noCategoria,
            items: category.subCategorias?.map((item: any) => (
              {
                label: item.noCategoria,
                route: 'detalle',
                command: () => this.navigateToDetail(item.idCategoria)
              }))
          }));
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  navigateToDetail(id: string) {
    this.router.navigate(['../detalle'], {
      relativeTo: this.route,
      queryParams: {id: id}
    });
  }

}
