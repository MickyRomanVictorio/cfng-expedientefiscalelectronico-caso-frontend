import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import {textoTiempoSegundos, tiempoSegundos} from '@pipes/tiempo.pipe';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Tab } from '@interfaces/comunes/tab';
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
import { TabViewModule } from 'primeng/tabview';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { obtenerIcono } from '@utils/icon';
import { PaginatorModule } from 'primeng/paginator';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AlertaModalComponent } from '../../alerta-modal/alerta-modal.component';
import { AlertaData } from '@interfaces/comunes/alert';
import { AlertaService } from '@services/shared/alerta.service';
import { Alerta } from '@interfaces/comunes/alerta';
import { BandejaAlerta, EstadoAlerta } from 'ngx-cfng-core-lib';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  standalone: true,
  providers: [DialogService],
  selector: 'bandejaalerta-caso-modal',
  templateUrl: './bandejaalerta-caso-modal.component.html',
  styleUrls: ['./bandejaalerta-caso-modal.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DropdownModule,
        InputTextareaModule,
        CmpLibModule,
        CheckboxModule,
        tiempoSegundos,
        ButtonModule,
        CalendarModule,
        RadioButtonModule,
        TabsViewComponent,
        TabViewModule,
        MenuModule,
        PaginatorModule,
        PaginatorComponent,
        textoTiempoSegundos,
    ],
})
export class BandejaAlertaCasoModalComponent implements OnInit, OnDestroy {
  @ViewChild(PaginatorComponent) paginatorComponent1!: PaginatorComponent;
  public subscriptions: Subscription[] = [];
  public listaTipoAlerta = ['Plazos', 'Genericas'];
  public nombreAlerta: String = '';

  public tabs: Tab[] = [
    {
      titulo: 'Plazos',
      ancho: 210,
    },
    {
      titulo: 'Genéricas',
      ancho: 210,
    },
  ];

  public indexActivo: number = 1;

  items: (data: Alerta) => MenuItem[] = (data: Alerta) => [];

  first: number = 0;
  rows: number = 10;
  ref: DynamicDialogRef | undefined;

  private timeout?: number;

  listaAlertasPlazoPendientes: Alerta[] = [];
  listaAlertasPlazoAtendidos: Alerta[] = [];
  listaAlertasGenericaPendientes: Alerta[] = [];
  listaAlertasGenericaAtendidos: Alerta[] = [];

  listaFiltradaAlertasPlazoPendientes: Alerta[] = [];
  listaFiltradaAlertasPlazoPendientes2: Alerta[] = [];

  listaFiltradaAlertasPlazoAtendidos: Alerta[] = [];
  listaFiltradaAlertasPlazoAtendidos2: Alerta[] = [];

  listaFiltradaAlertasGenericaPendientes: Alerta[] = [];
  listaFiltradaAlertasGenericaPendientes2: Alerta[] = [];

  listaFiltradaAlertasGenericaAtendidos: Alerta[] = [];
  listaFiltradaAlertasGenericaAtendidos2: Alerta[] = [];

  // activeIndexBandeja: number = 0;
  activeIndexEstado: number = 0;
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
  resetPaginatorKey: number | undefined;
  shouldResetPage: boolean = false;

  constructor(
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.indexActivo =
      Number(this.route.snapshot.queryParamMap.get('tipo-alerta')) || 0;
  }

  async ngOnInit() {
    this.items = (data: Alerta) => [
      {
        label: 'Marcar como solucionada',
        icon: '',
        command: () => {
          this.ref = this.dialogService.open(AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'warning',
              title: `Confirma solucionar la alerta?`,
              description: ``,
              confirmButtonText: 'Confirmar',
              confirm: true,
            },
          } as DynamicDialogConfig<AlertaData>);

          this.ref.onClose.subscribe({
            next: (resp) => {
              if (resp === 'confirm') {
                data.estado = 'SOLUCIONADO';
                this.actualizarAlertas(data);
              }
            },
          });
        },
      },
    ];
    this.obtenerAlertas();
  }

  obtenerAlertas() {
    this.subscriptions.push(
      this.alertaService.obtenerAlertas().subscribe({
        next: (response: Alerta[]) => {
          //
          this.listaAlertasPlazoPendientes = response.filter(
            (a) =>
              // a?.tipo === TipoAlerta.A_SOLUCIONAR &&
              a?.estado === EstadoAlerta.PENDIENTE &&
              a?.bandeja === BandejaAlerta.PLAZOS
          ); //
          this.listaAlertasPlazoAtendidos = response.filter(
            (a) =>
              //a?.tipo === TipoAlerta.A_SOLUCIONAR &&
              a?.estado === EstadoAlerta.SOLUCIONADO &&
              a?.bandeja === BandejaAlerta.PLAZOS
          );
          this.listaAlertasGenericaPendientes = response.filter(
            (a) =>
              //a?.tipo === TipoAlerta.REGULARES &&
              a?.estado === EstadoAlerta.PENDIENTE &&
              a?.bandeja === BandejaAlerta.GENERICAS
          ); //
          this.listaAlertasGenericaAtendidos = response.filter(
            (a) =>
              //a?.tipo === TipoAlerta.REGULARES &&
              a?.estado === EstadoAlerta.SOLUCIONADO &&
              a?.bandeja === BandejaAlerta.GENERICAS
          );

          this.listaFiltradaAlertasPlazoPendientes =
            this.listaAlertasPlazoPendientes;
          this.listaFiltradaAlertasPlazoAtendidos =
            this.listaAlertasPlazoAtendidos;
          this.listaFiltradaAlertasGenericaPendientes =
            this.listaAlertasGenericaPendientes;
          this.listaFiltradaAlertasGenericaAtendidos =
            this.listaAlertasGenericaAtendidos;

          console.log(
            this.listaAlertasPlazoPendientes,
            this.listaAlertasPlazoAtendidos,
            this.listaAlertasGenericaPendientes,
            this.listaAlertasGenericaAtendidos
          );

          this.handleChangeBandeja(0);
        },
        error: (err) => {
          console.error('Error obtenerAlertas:', err);
        },
      })
    );
  }

  actualizarAlertas(alerta: Alerta) {
    this.subscriptions.push(
      this.alertaService.actualizarAlerta(alerta).subscribe(
        (respuesta) => {
          console.log('Alerta actualizada con éxito:', respuesta);
          this.obtenerAlertas();
        },
        (error) => {
          console.error('Error al actualizar la alerta:', error);
        }
      )
    );
  }

  onInput(input: any, opc: Number): void {
    let valor = input.target.value;
    valor = valor.replace(/[^0-9-]/g, '');
    input.target.value = valor;
    this.obtenerDatosFiltrados(valor, opc);
  }

  obtenerDatosFiltrados(value: any, opc: any) {
    this.shouldResetPage = true;

    // Fuerza la detección de cambios (si es necesario)
    setTimeout(() => {
      this.shouldResetPage = false; // Resetear para futuras interacciones
    });

    this.query.page = 1;

    // Si el paginador existe, actualizar su estado
    if (this.paginatorComponent1) {
      this.paginatorComponent1.currentPage = 1;
      this.paginatorComponent1.paginateTable();
    }

    if (opc === 1) {
      this.listaFiltradaAlertasPlazoPendientes =
        this.listaAlertasPlazoPendientes.filter((item) =>
          Object.values(item).some((fieldValue: any) =>
            fieldValue?.toString()?.toLowerCase().includes(value?.toLowerCase())
          )
        );
      this.itemPaginado.data.data = this.listaFiltradaAlertasPlazoPendientes;
      this.itemPaginado.data.total =
        this.listaFiltradaAlertasPlazoPendientes.length;
      const start = (this.query.page - 1) * this.query.limit;
      const end = start + this.query.limit;
      this.listaFiltradaAlertasPlazoPendientes2 =
        this.listaFiltradaAlertasPlazoPendientes.slice(start, end);
    } else if (opc === 2) {
      this.listaFiltradaAlertasPlazoAtendidos =
        this.listaAlertasPlazoAtendidos.filter((item) =>
          Object.values(item).some(
            (fieldValue: any) =>
              (typeof fieldValue === 'string' ||
                typeof fieldValue === 'number') &&
              fieldValue
                ?.toString()
                ?.toLowerCase()
                .includes(value?.toLowerCase())
          )
        );
      this.itemPaginado.data.data = this.listaFiltradaAlertasPlazoAtendidos;
      this.itemPaginado.data.total =
        this.listaFiltradaAlertasPlazoAtendidos.length;
      const start = (this.query.page - 1) * this.query.limit;
      const end = start + this.query.limit;
      this.listaFiltradaAlertasPlazoAtendidos2 =
        this.listaFiltradaAlertasPlazoAtendidos.slice(start, end);
    } else if (opc === 3) {
      this.listaFiltradaAlertasGenericaPendientes =
        this.listaAlertasGenericaPendientes.filter((item) =>
          Object.values(item).some(
            (fieldValue: any) =>
              (typeof fieldValue === 'string' ||
                typeof fieldValue === 'number') &&
              fieldValue
                ?.toString()
                ?.toLowerCase()
                .includes(value?.toLowerCase())
          )
        );
      this.itemPaginado.data.data = this.listaFiltradaAlertasGenericaPendientes;
      this.itemPaginado.data.total =
        this.listaFiltradaAlertasGenericaPendientes.length;
      const start = (this.query.page - 1) * this.query.limit;
      const end = start + this.query.limit;
      this.listaFiltradaAlertasGenericaPendientes2 =
        this.listaFiltradaAlertasGenericaPendientes.slice(start, end);
    } else if (opc === 4) {
      this.listaFiltradaAlertasGenericaAtendidos =
        this.listaAlertasGenericaAtendidos.filter((item) =>
          Object.values(item).some(
            (fieldValue: any) =>
              (typeof fieldValue === 'string' ||
                typeof fieldValue === 'number') &&
              fieldValue
                ?.toString()
                ?.toLowerCase()
                .includes(value?.toLowerCase())
          )
        );
      this.itemPaginado.data.data = this.listaFiltradaAlertasGenericaAtendidos;
      this.itemPaginado.data.total =
        this.listaFiltradaAlertasGenericaAtendidos.length;
      const start = (this.query.page - 1) * this.query.limit;
      const end = start + this.query.limit;
      this.listaFiltradaAlertasGenericaAtendidos2 =
        this.listaFiltradaAlertasGenericaAtendidos.slice(start, end);
      this.onPaginate({ page: 1, limit: this.query.limit });
    }
    this.updatePagedItems();
    this.resetPaginatorKey = Date.now();
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  getLabelById(value: any, list: any[]): string {
    const selectedItem = list.find((item) => item.value === value);
    return selectedItem ? selectedItem.label : '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  // onPageChange(event) {
  //   this.first = event.first;
  //   this.rows = event.rows;
  // }

  onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;

    //la paginación depende del total de registros listados inicialmente ya sean filtrados o no es decir con casosPorAsignarFiltrados, no depende de cada petición por pagina
    //entonces cada vez que se haga clic en cambiar las páginas se debe mostrar los otros x registros
    this.updatePagedItems();
  }

  updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;

    // console.log(this.indexActivo, this.activeIndexEstado);

    if (this.indexActivo === 0) {
      if (this.activeIndexEstado === 0) {
        this.listaFiltradaAlertasPlazoPendientes2 =
          this.listaFiltradaAlertasPlazoPendientes.slice(start, end);
      } else if (this.activeIndexEstado === 1) {
        this.listaFiltradaAlertasPlazoAtendidos2 =
          this.listaFiltradaAlertasPlazoAtendidos.slice(start, end);
      }
    } else if (this.indexActivo === 1) {
      if (this.activeIndexEstado === 0) {
        this.listaFiltradaAlertasGenericaPendientes2 =
          this.listaFiltradaAlertasGenericaPendientes.slice(start, end);
      } else if (this.activeIndexEstado === 1) {
        this.listaFiltradaAlertasGenericaAtendidos2 =
          this.listaFiltradaAlertasGenericaAtendidos.slice(start, end);
      }
    }
    // this.sujetosProcesalesFiltrados = this.sujetosProcesales.slice(start, end);
  }

  handleChangeBandeja(e: any) {
    console.log('e', e);
    this.activeIndexEstado = 0;
    this.handleListPaginator();
  }

  handleChangeEstado(e: any) {
    this.activeIndexEstado = e.index;
    this.handleListPaginator();
  }

  private handleListPaginator() {
    if (this.indexActivo === 0) {
      if (this.activeIndexEstado === 0) {
        this.itemPaginado.data.data = this.listaFiltradaAlertasPlazoPendientes;
        this.itemPaginado.data.total =
          this.listaFiltradaAlertasPlazoPendientes.length;
      } else if (this.activeIndexEstado === 1) {
        this.itemPaginado.data.data = this.listaFiltradaAlertasPlazoAtendidos;
        this.itemPaginado.data.total =
          this.listaFiltradaAlertasPlazoAtendidos.length;
      }
    } else if (this.indexActivo === 1) {
      if (this.activeIndexEstado === 0) {
        this.itemPaginado.data.data =
          this.listaFiltradaAlertasGenericaPendientes;
        this.itemPaginado.data.total =
          this.listaFiltradaAlertasGenericaPendientes.length;
      } else if (this.activeIndexEstado === 1) {
        this.itemPaginado.data.data =
          this.listaFiltradaAlertasGenericaAtendidos;
        this.itemPaginado.data.total =
          this.listaFiltradaAlertasGenericaAtendidos.length;
      }
    }

    this.updatePagedItems();
  }

  async irAlerta(alerta: any) {
    if(alerta.tipo && alerta.tipo === 'INFORMATIVA'){
      this.actualizarAlertas(alerta);
    }
    if (alerta.url && alerta.url.length > 0) {
      await this.router.navigate([alerta.url]);
      window.location.reload();
    } else {
    }
  }
}
