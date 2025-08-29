import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {CalendarModule} from "primeng/calendar";
import {CheckboxModule} from "primeng/checkbox";
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {CommonModule} from "@angular/common";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {MenuModule} from "primeng/menu";
import {MessagesModule} from "primeng/messages";
import {RadioButtonModule} from "primeng/radiobutton";
import {TableModule} from "primeng/table";
import {ToastModule} from "primeng/toast";
import {PaginatorComponent} from "@components/generales/paginator/paginator.component";
import {FuentesInvestigacion} from "@interfaces/provincial/documentos-ingresados/FuentesInvestigacion";
import {PaginacionInterface} from "@interfaces/comunes/paginacion.interface";
import {Subscription} from "rxjs";
import {
  EvidenciaInvesstigacionService
} from "@services/provincial/documentos-ingresados/evidencia-invesstigacion.service";
import {DocumentoIngresadoNuevo} from "@interfaces/provincial/documentos-ingresados/DocumentoIngresadoNuevo";
import {obtenerIcono} from "@utils/icon";

@Component({
  selector: 'app-fuentes-investigacion',
  standalone: true,
  templateUrl: './fuentes-investigacion.component.html',
  styleUrl: './fuentes-investigacion.component.scss',
  imports: [
    CalendarModule,
    CheckboxModule,
    CommonModule,
    CmpLibModule,
    FormsModule,
    FormsModule,
    InputTextModule,
    MenuModule,
    MessagesModule,
    RadioButtonModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    PaginatorComponent,
  ],
})
export class FuentesInvestigacionComponent implements OnInit {

  @Input() documento!: DocumentoIngresadoNuevo;
  protected evidenciasList: FuentesInvestigacion[] = [];
  protected evidenciasFiltradas: FuentesInvestigacion[] = [];
  public evidenciaSeleccionada: FuentesInvestigacion[] = [];
  private subscriptions: Subscription[] = [];

  private totalCasosAsignar: number = 0;
  public resetPage: boolean = false;
  public query: any = { limit: 10, page: 1, where: {} };
  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  formEvidencias: FormGroup = new FormGroup({
    chckMarcarTodos: new FormControl<any>(true)
  });

  constructor(private evidenciaInvesstigacionService: EvidenciaInvesstigacionService,
              private cdr: ChangeDetectorRef){
  }

  ngOnInit() {
    console.log("ngOnInit...")
    this.listarEvidencias();
  }

  private listarEvidencias(): void {
    let requestFuentes: any = {
      idCaso: this.documento.idCaso,
      idDocumentoEscrito: this.documento.idDocumentoEscrito
    }
    this.subscriptions.push(
      this.evidenciaInvesstigacionService.obtenerEvidencias(requestFuentes).subscribe({
        next: resp => {
          if (resp.code === 0) {
            this.evidenciasList = resp.data.map((evidencia: any) => ({ ...evidencia, seleccionado: true }));
            this.evidenciasFiltradas = this.evidenciasList;
            this.evidenciaSeleccionada = this.evidenciasFiltradas;
            this.itemPaginado.data.data = this.evidenciasFiltradas;
            this.itemPaginado.data.total = this.totalCasosAsignar = this.evidenciasFiltradas.length;
            this.actualizarPaginaRegistros(this.evidenciasFiltradas, false);
          }
        },
        error: error => {
          console.log(error)
        }
      })
    )
  }

  public obtenerClaseTipoEvidencia(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase()
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage)
  }

  actualizarPaginaRegistros(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.evidenciasFiltradas = data.slice(start, end);
  }

  get getTextoCheck(): string {
    return `Seleccionar todos`;
  }

  toggleAllCheckboxes(isChecked: boolean): void {
    this.evidenciaSeleccionada = this.evidenciasFiltradas.map((evidencia: any) => ({ ...evidencia, seleccionado: !isChecked }));
    this.evidenciaSeleccionada.push();
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

}
