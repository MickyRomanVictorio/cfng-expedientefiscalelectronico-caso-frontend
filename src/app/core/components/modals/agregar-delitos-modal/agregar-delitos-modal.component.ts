import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import {
  ActualizarDelitosRequest,
  DelitoPorActualizar,
} from '@interfaces/reusables/agregar-delito/actualizar-delito-request.interface';
import { Delito } from '@interfaces/reusables/agregar-delito/agregar-delito.interface';
import { ReusablesTransaccionalService } from '@services/reusables/reusables-transaccional.service';
import { RESPUESTA_HTTP } from 'ngx-cfng-core-lib';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { forkJoin, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EncabezadoModalComponent } from '../encabezado-modal/encabezado-modal.component';
import { ReusablesConsultaService } from '@services/reusables/reusables-consulta.service';
import { AlertaModalComponent } from "@components/modals/alerta-modal/alerta-modal.component";
import { AlertaData } from "@interfaces/comunes/alert";

@Component({
  selector: 'app-agregar-delitos-modal',
  standalone: true,
  templateUrl: './agregar-delitos-modal.component.html',
  styleUrls: ['./agregar-delitos-modal.component.scss'],
  imports: [
    CommonModule,
    EncabezadoModalComponent,
    TableModule,
    CmpLibModule,
    FormsModule,
    ReactiveFormsModule,
    CapitalizePipe,
    PaginatorComponent,
  ],
})
export class AgregarDelitosModalComponent implements OnInit, OnDestroy {
  public resetPage: boolean = false;
  public formularioFiltrarDelitos!: FormGroup;
  public numeroCaso: string;
  public idSujetoProcesal: string;
  public descripcionHechos: string = '';
  public delitosActuales: string;

  // public cargandoTabla: boolean = false
  public delitos: Delito[] = [];
  public delitosFiltrados: Delito[] = [];
  public delitosSeleccionados: Delito[] = [];
  private delitosActualesSeleccionados: Delito[] = [];

  public buscadorControl: FormControl = new FormControl('');
  public obtenerIcono = obtenerIcono;

  public subscriptions: Subscription[] = [];

  public disableButtonAgregarDelitos: boolean = false;
  public hiddenPaginator: boolean = false;
  public isRendered: boolean = false;
  private dialogElement: any;
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

  constructor(
    private formBuilder: FormBuilder,
    public referenciaModal: DynamicDialogRef,
    private configuracion: DynamicDialogConfig,
    private reusableConsultaService: ReusablesConsultaService,
    private reusableTransaccionService: ReusablesTransaccionalService,
    private renderer: Renderer2,
    private readonly dialogService: DialogService
  ) {
    //this.configuracion.data;
    this.numeroCaso = this.configuracion.data?.numeroCaso;
    this.idSujetoProcesal = this.configuracion.data?.idSujetoProcesal;
    this.delitosActuales = this.configuracion.data?.delitosActuales;
  }

  ngOnInit(): void {
    this.formBuild();
    // this.obtenerHechosCaso();
    // this.obtenerDelitosParaTipificar();
    this.configuracionInicial();
    this.cargaInicialDatos();

    this.buscadorControl.valueChanges.subscribe({
      next: (criterioBusqueda) => {
        this.delitosFiltrados = [];
        this.resetPage = true;
        if (!criterioBusqueda) {
          this.delitosFiltrados = this.delitos;
          this.itemPaginado.data.data = this.delitosFiltrados;
          this.itemPaginado.data.total = this.delitosFiltrados.length;
          this.updatePagedItems();
          this.hiddenPaginator = this.delitosFiltrados.length <= 0;
          this.disableButtonAgregarDelitos = this.delitosFiltrados.length <= 0;
          return;
        }
        this.delitosFiltrados = this.delitos.filter((delito) => {
          return (
            delito.articulo
              ?.toLowerCase()
              .includes(criterioBusqueda.toLowerCase()) ||
            delito.delitoGenerico
              ?.toLowerCase()
              .includes(criterioBusqueda.toLowerCase()) ||
            delito.delitoSubgenerico
              ?.toLowerCase()
              .includes(criterioBusqueda.toLowerCase()) ||
            delito.delitoEspecifico
              ?.toLowerCase()
              .includes(criterioBusqueda.toLowerCase())
          );
        });
        this.itemPaginado.data.data = this.delitosFiltrados;
        this.itemPaginado.data.total = this.delitosFiltrados.length;
        const start = (this.query.page - 1) * this.query.limit;
        const end = start + this.query.limit;
        this.delitosFiltrados = this.delitosFiltrados.slice(start, end);
        this.hiddenPaginator = this.delitosFiltrados.length <= 0;
        this.disableButtonAgregarDelitos = this.delitosFiltrados.length <= 0;
      },
    });
  }

  private configuracionInicial() {
    this.dialogElement = document.querySelectorAll(
      'body p-dynamicdialog .p-dialog-content'
    );
    if (this.dialogElement.length > 1) {
      this.renderer.addClass(this.dialogElement[1], 'hidden');
    }
  }

  private cargaInicialDatos() {
    forkJoin([
      this.reusableConsultaService.obtenerHechosCaso(this.numeroCaso),
      this.reusableConsultaService.obtenerDelitosParaTipificar(this.numeroCaso),
    ]).subscribe(
      ([result1, result2]) => {
        // #result1
        this.descripcionHechos = result1.narrativa;

        // #result2
        const datos = result2;
        if (datos != null && datos.length > 0) {
          this.identificarDelitosSeleccionados(datos);
        }
        // this.cargandoTabla = false
      },
      (error) => {
        console.error('Error:', error);
      },
      () => {
        // console.log('All requests are completed');
        this.isRendered = true;
        if (this.dialogElement.length > 1) {
          this.renderer.removeClass(this.dialogElement[1], 'hidden');
        }
      }
    );
  }

  private formBuild(): void {
    this.formularioFiltrarDelitos = this.formBuilder.group({
      buscar: [''],
    });
    this.busquedaDinamica();
  }

  private busquedaDinamica(): void {
    this.formularioFiltrarDelitos
      .get('buscar')!
      .valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.filtrarDelitosPorCampo();
      });
  }

  public filtrarDelitosPorCampo(): void {
    if (this.formularioFiltrarDelitos.valid) {
      const textoBusqueda = this.formularioFiltrarDelitos.get('buscar')!.value;
      if (!textoBusqueda) {
        this.delitosFiltrados = [...this.delitos];
      } else {
        this.delitosFiltrados = this.delitos.filter((delito) => {
          return (
            delito.articulo?.toLowerCase().includes(textoBusqueda) ||
            delito.delitoGenerico?.toLowerCase().includes(textoBusqueda) ||
            delito.delitoSubgenerico?.toLowerCase().includes(textoBusqueda) ||
            delito.delitoEspecifico?.toLowerCase().includes(textoBusqueda)
          );
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private obtenerHechosCaso(): void {
    this.subscriptions.push(
      this.reusableConsultaService
        .obtenerHechosCaso(this.numeroCaso)
        .subscribe({
          next: (resp) => {
            //if ( resp.code === 200 ) {
            //this.descripcionHechos = resp.data.hechos
            this.descripcionHechos = resp.narrativa;
            //}
          },
          error: (error) => {
            console.error(error);
          },
        })
    );
  }

  private obtenerDelitosParaTipificar(): void {
    // this.cargandoTabla = true
    this.subscriptions.push(
      this.reusableConsultaService
        .obtenerDelitosParaTipificar(this.numeroCaso)
        .subscribe({
          next: (response) => {
            const datos = response;
            if (datos != null && datos.length > 0) {
              this.identificarDelitosSeleccionados(datos);
            }
            // this.cargandoTabla = false
          },
          error: (error) => {
            console.error('Error: ', error.status, error.statusText);
            // this.cargandoTabla = false
          },
        })
    );
  }

  private identificarDelitosSeleccionados(datos: any[]): void {
    //
    const delitosActualesArray: string[] = this.delitosActuales
      ?.toLowerCase()
      ?.split('||');

    if (delitosActualesArray !== undefined) {
      delitosActualesArray.forEach((delitoActual) => {
        const delitoSeleccionado = datos.find(
          (delito) =>
            `${delito?.delitoGenerico} / ${delito?.delitoSubgenerico} / ${delito?.delitoEspecifico}`?.toLowerCase() ===
            delitoActual
        ); //TODO: Cambiar a comparacion por id
        if (delitoSeleccionado !== undefined) {
          this.delitosSeleccionados.push(delitoSeleccionado);
        }
      });

      const delitosNoSeleccionados = datos.filter(
        (delito) => !this.delitosSeleccionados.includes(delito)
      );

      this.delitos = [...this.delitosSeleccionados, ...delitosNoSeleccionados];

      this.delitosFiltrados = [
        ...this.delitosSeleccionados,
        ...delitosNoSeleccionados,
      ];

      this.itemPaginado.data.data = this.delitosFiltrados;
      this.itemPaginado.data.total = this.delitosFiltrados.length;
    } else {
      this.delitosSeleccionados = [...this.delitosSeleccionados];
      this.delitosFiltrados = [...this.delitosSeleccionados];

      this.itemPaginado.data.data = this.delitosFiltrados;
      this.itemPaginado.data.total = this.delitosFiltrados.length;
    }
    this.delitosActualesSeleccionados = [...this.delitosSeleccionados];
    this.updatePagedItems();
  }

  public cancelarAgregadoDeDelitos(): void {
    this.referenciaModal.close();
  }

  public actualizarDelitos(): void {
    const delitosPorActualizar: DelitoPorActualizar[] = this.obtenerDelitosPorActualizar();

    if (!delitosPorActualizar || delitosPorActualizar.length === 0) {
      this.mensajeError('Aviso:', `<strong>Debe seleccionar al menos un Delito</strong>`);
      return;
    }

    if (this.idSujetoProcesal != 'nuevo') {
      console.log('!=nuevo');
      let request: ActualizarDelitosRequest = {
        numeroCaso: this.numeroCaso,
        numeroSujetoCaso: this.idSujetoProcesal,
        delitos: delitosPorActualizar,
      };
      // this.spinner.show()
      this.subscriptions.push(
        this.reusableTransaccionService.agregarDelitos(request).subscribe({
          next: (resp) => {
            console.log(resp);
            if (resp.code === 200) {
              this.referenciaModal.close(RESPUESTA_HTTP.OK);
            }
            // this.spinner.hide()
          },
          error: (error) => {
            console.error(error);
            // this.spinner.hide()
          },
        })
      );
    } else {
      console.log('entro els');
      this.referenciaModal.close(delitosPorActualizar);
    }
  }

  private obtenerDelitosPorActualizar(): DelitoPorActualizar[] {
    const delitosPorActualizar: DelitoPorActualizar[] = [];
    // Validar los seleccionados
    this.delitosSeleccionados.forEach((delito) => {
      delitosPorActualizar.push({
        articulo: delito.articulo,
        idDelitoGenerico: delito.idDelitoGenerico,
        delitoGenerico: delito.delitoGenerico,
        idDelitoSubgenerico: delito.idDelitoSubgenerico,
        delitoSubgenerico: delito.delitoSubgenerico,
        idDelitoEspecifico: delito.idDelitoEspecifico,
        delitoEspecifico: delito.delitoEspecifico,
        esDelitoSujeto: '1',
      });
    });
    // Validar los posibles delitos que ya no se encuentren seleccionados
    this.delitosActualesSeleccionados.forEach((delito) => {
      const index = delitosPorActualizar.findIndex(
        (delitoPorActualizar) =>
          delitoPorActualizar.idDelitoGenerico === delito.idDelitoGenerico &&
          delitoPorActualizar.idDelitoSubgenerico ===
          delito.idDelitoSubgenerico &&
          delitoPorActualizar.idDelitoEspecifico === delito.idDelitoEspecifico
      );
      if (index === -1) {
        delitosPorActualizar.push({
          articulo: delito.articulo,
          idDelitoGenerico: delito.idDelitoGenerico,
          delitoGenerico: delito.delitoGenerico,
          idDelitoSubgenerico: delito.idDelitoSubgenerico,
          delitoSubgenerico: delito.delitoSubgenerico,
          idDelitoEspecifico: delito.idDelitoEspecifico,
          delitoEspecifico: delito.delitoEspecifico,
          esDelitoSujeto: '0',
        });
      }
    });

    // Validar que no se hayan deshabilitado todos los delitos
    const todosDeshabilitados = delitosPorActualizar.every(
      (delito) => delito.esDelitoSujeto === '0'
    );

    if (todosDeshabilitados) {
      // Lanzar error o advertencia
      console.error('No se puede deshabilitar todos los delitos que tenía el caso.');
      // También puedes lanzar un error en la interfaz o utilizar otro mecanismo de notificación
      return [];
    }
    console.log('delitosPorActualizar = ', delitosPorActualizar);
    
    return delitosPorActualizar;
  }

  onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.resetPage = evento.resetPage;
    //la paginación depende del total de registros listados inicialmente ya sean filtrados o no es decir con casosPorAsignarFiltrados, no depende de cada petición por pagina
    //entonces cada vez que se haga clic en cambiar las páginas se debe mostrar los otros x registros
    this.updatePagedItems();
  }

  updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.delitosFiltrados = this.delitos.slice(start, end);
  }


  mensajeError(mensaje: any, submensaje: any) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'Aceptar',
      },
    } as DynamicDialogConfig<AlertaData>);
  }

}
