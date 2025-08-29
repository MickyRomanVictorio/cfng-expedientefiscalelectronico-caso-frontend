import {Component, OnInit} from '@angular/core';
import {UsuarioAuthService} from '@core/services/auth/usuario.service.ts.service';
import {FormsModule} from "@angular/forms";
import {AutoCompleteModule} from "primeng/autocomplete";
import {PanelMenuModule} from "primeng/panelmenu";
import {NgForOf, NgIf} from "@angular/common";
import {IconUtil} from 'ngx-cfng-core-lib';
import {BreadcrumbModule} from "primeng/breadcrumb";
import {ActivatedRoute, Router} from "@angular/router";
import {AutocompletarComponent} from "@modules/ayuda/autocompletar/autocompletar.component";
import {BreadcrumbComponent} from "@modules/ayuda/breadcum/breadcrumb.component";
import {BusquedaRequest, BusquedaResponse} from "@interfaces/ayuda/ayuda";
import {Subscription} from "rxjs";
import {AyudaService} from "@services/ayuda/ayuda.service";

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  standalone: true,
  selector: 'app-busqueda',
  styleUrls: ['./busqueda.component.scss'],
  templateUrl: './busqueda.component.html',
  imports: [
    FormsModule,
    AutoCompleteModule,
    PanelMenuModule,
    NgForOf,
    BreadcrumbModule,
    AutocompletarComponent,
    BreadcrumbComponent,
    NgIf
  ]
})
export class BusquedaComponent implements OnInit {
  breadCumList: any = [];
  listaArticulos: BusquedaResponse[] = [];
  totalResultados: number = 0;
  private busquedaRequest?: BusquedaRequest;
  protected busqueda: string = '';
  private idCategoria: any;
  private idTag: any;
  protected subscriptions: Subscription[] = [];

  constructor(
    private readonly usuarioAuthService: UsuarioAuthService,
    protected iconUtil: IconUtil,
    private route: ActivatedRoute,
    private router: Router,
    private ayudaService: AyudaService,
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.busqueda = params['busqueda'];
      this.busquedaRequest = {
        busqueda: params['busqueda'],
        idTag: params['idTag'],
        idCategoria: params['idCategoria'],
        pagina: 0
      };
    });
    this.buscar();
  }

  private buscar(): void {
    this.subscriptions.push(
      this.ayudaService
        .busqueda(this.busquedaRequest)
        .subscribe({
          next: (resp: any) => {
            this.listaArticulos = resp;
            this.breadCumList = [{label: resp.noCategoria}];
            this.totalResultados = resp.length;
          },
        })
    );
  }

  navigateToDetail(item: any, tipo: any) {
    this.listaArticulos = [];
    if (tipo === 'tag') {
      this.busquedaRequest = {
        busqueda: '',
        idTag: item.idTag,
        idCategoria: '',
        pagina: 0
      };
      this.router.navigate(['../busqueda'], {
        relativeTo: this.route,
        queryParams: {idTag: item.idTag}
      });
      this.buscar();
    }
    if (tipo === 'categoria') {
      this.busquedaRequest = {
        busqueda: '',
        idTag: '',
        idCategoria: item.idCategoriaPadre,
        pagina: 0
      };
      this.router.navigate(['../busqueda'], {
        relativeTo: this.route,
        queryParams: {idCategoria: item.idCategoria}
      });
      this.buscar();
    }
    if (tipo === 'detalle') {
      this.router.navigate(['../detalle'], {
        relativeTo: this.route,
        queryParams: {id: item.idCategoria}
      });
    }
  }

  public verMas() {
    this.buscar();
  }

  highlightMatch(text: string, term: string): string {
    if (!term) return text;
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    return text.replace(regex, '<b>$1</b>');
  }

}
