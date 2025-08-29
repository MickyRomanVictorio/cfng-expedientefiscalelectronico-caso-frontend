import {Component, OnInit} from '@angular/core';
import {UsuarioAuthService} from '@core/services/auth/usuario.service.ts.service';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AutoCompleteModule} from "primeng/autocomplete";
import {PanelMenuModule} from "primeng/panelmenu";
import {MenuItem} from "primeng/api";
import {NgIf} from "@angular/common";
import {IconUtil} from 'ngx-cfng-core-lib';
import {Subscription} from "rxjs";
import {AyudaService} from "@services/ayuda/ayuda.service";
import {CategoriaDetalle, CategoriaSimple} from "@interfaces/ayuda/ayuda";
import {ActivatedRoute, Router} from "@angular/router";
import {InputTextareaModule} from "primeng/inputtextarea";
import {NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService} from '@ngx-cfng-core-modal/dialog';
import {BreadcrumbModule} from "primeng/breadcrumb";
import {AutocompletarComponent} from "@modules/ayuda/autocompletar/autocompletar.component";
import {BreadcrumbComponent} from "@modules/ayuda/breadcum/breadcrumb.component";
import {CmpLibModule} from 'dist/cmp-lib';


interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  standalone: true,
  selector: 'app-busqueda',
  styleUrls: ['./articulo.component.scss'],
  templateUrl: './articulo.component.html',
  imports: [
    FormsModule,
    AutoCompleteModule,
    PanelMenuModule,
    NgIf,
    InputTextareaModule,
    ReactiveFormsModule,
    NgxCfngCoreModalDialogModule,
    BreadcrumbModule,
    AutocompletarComponent,
    BreadcrumbComponent,
    CmpLibModule
  ]
})
export class ArticuloComponent implements OnInit {
  idCategoria: any;

  protected subscriptions: Subscription[] = [];
  protected esJerarquiaSuperior: boolean = false;
  protected categoriaDetalle?: CategoriaDetalle;

  items: any[] | undefined;
  selectedItem: any;
  suggestions: any[] = [];
  protected showComentario: boolean = false;
  protected categoriasRelacionadas: CategoriaSimple[] = [];
  protected preguntasRelacionadas: CategoriaSimple[] = [];
  protected comentario: string = "";
  home: MenuItem | undefined;
  breadCumList: any = [];

  constructor(
    private readonly usuarioAuthService: UsuarioAuthService,
    protected iconUtil: IconUtil,
    private ayudaService: AyudaService,
    private route: ActivatedRoute,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idCategoria = params['id'];
    });

    this.cargarPagina();
  }

  cargarPagina(){
    this.obtenerCategoriaDetalle();
    this.obtenerCategoriasRelacionadas();
  }

  search(event: AutoCompleteCompleteEvent) {
    this.suggestions = [...Array(10).keys()].map(item => event.query + '-' + item);
  }

  buscarTag(idTag: number) {
    //IR A BUSCAR CON EL ID TAG -- busqueda?tag=idTag
  }

  mostrarComentario() {
    this.showComentario = true;
  }

  /** LLAMADA A DATOS **/

  private obtenerCategoriaDetalle(): void {
    this.subscriptions.push(
      this.ayudaService
        .obtenerCategoriaDetalle(this.idCategoria)
        .subscribe({
          next: (data: any) => {
            this.categoriaDetalle = data;
            this.breadCumList.push(
              { label: this.categoriaDetalle?.noCategoriaPadre, route: '../busqueda', id: this.categoriaDetalle?.idCategoriaPadre },
              { label: this.categoriaDetalle?.noCategoria },
            )
          },
        })
    );
    this.breadCumList.push(
      { label: 'Asignación', route: '../busqueda', id: 123 },
      { label: 'Asignación de casos' },
    )
  }

  private obtenerCategoriasRelacionadas(): void {
    this.subscriptions.push(
      this.ayudaService
        .obtenerCategoriasRelacionadas(this.idCategoria)
        .subscribe({
          next: (data: CategoriaSimple[]) => {
            this.categoriasRelacionadas = data.filter(c => c.idTipoCategoria === 1);
            this.preguntasRelacionadas = data.filter(c => c.idTipoCategoria === 2);
          }
        })
    );
  }

  protected guardarComentario(): void {
    const request = {
      idCategoria: this.idCategoria,
      tipoComentario: !this.showComentario ? 1 : 2, // 1 => Positivo | 2 => Negativo
      comentario: this.comentario
    }
    this.subscriptions.push(
      this.ayudaService
        .guardarComentario(request)
        .subscribe({
          next: (data: any) => {
            this.modalDialogService.success(
              'Datos guardado correctamente',
              'Gracias por hacernos llegar tus comentarios',
              'Aceptar'
            );
            this.showComentario = false;
          }
        })
    );
  }

  navigateToDetail(item: any) {
    this.idCategoria = item.idCategoria;
    this.cargarPagina();
  }

}
