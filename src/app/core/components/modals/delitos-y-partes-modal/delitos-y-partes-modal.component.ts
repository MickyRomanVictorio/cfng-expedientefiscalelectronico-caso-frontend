import { UsuarioAuth } from './../../../models/usuario-auth.model';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { AlertaData } from '@interfaces/comunes/alert';
import { SujetoProcesal } from '@interfaces/reusables/delitos-y-partes/delitos-y-partes.interface';
import { ReusablesConsultaService } from '@services/reusables/reusables-consulta.service';
import { RESPUESTA_HTTP, TIPO_SUJETO_PROCESAL, } from 'ngx-cfng-core-lib';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { DialogService, DynamicDialogConfig, DynamicDialogRef, } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { AgregarDelitosModalComponent } from '../agregar-delitos-modal/agregar-delitos-modal.component';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { EncabezadoModalComponent } from '../encabezado-modal/encabezado-modal.component';
import { UsuarioAuthService } from '@core/services/auth/usuario.service.ts.service';

@Component({
  standalone: true,
  selector: 'app-delitos-y-partes-modal',
  templateUrl: './delitos-y-partes-modal.component.html',
  styleUrls: ['./delitos-y-partes-modal.component.scss'],
  imports: [
    CommonModule,
    EncabezadoModalComponent,
    TableModule,
    CapitalizePipe,
    PaginatorComponent,
  ],
})
export class DelitosYPartesModalComponent implements OnInit, OnDestroy {
  public DENUNCIADO = TIPO_SUJETO_PROCESAL.DENUNCIADO;

  public numeroCaso: string;
  public flagAnulado: number;
  public sujetosProcesales: SujetoProcesal[] = [];
  public sujetosProcesalesFiltrados: SujetoProcesal[] = [];
  public delitosCaso: string[] = [];
  private subscriptions: Subscription[] = [];

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
    protected readonly usuarioAuthService: UsuarioAuthService,
    public referenciaModal: DynamicDialogRef,
    private configuracion: DynamicDialogConfig,
    private dialogService: DialogService,
    private reusablesConsultaService: ReusablesConsultaService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.numeroCaso = this.configuracion.data?.numeroCaso;
    this.flagAnulado = this.configuracion.data?.flagAnulado;
  }

  ngOnInit() {
    this.dialogElement = this.document.body.querySelector('.p-dialog-content');
    if (this.dialogElement) {
      this.renderer.addClass(this.dialogElement, 'hidden');
    }
    this.obtenerDelitosYPartes();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private obtenerDelitosYPartes(): void {
    console.log("el numero de caso es", this.numeroCaso)
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.reusablesConsultaService
        .obtenerDelitosYPartes(this.numeroCaso)
        .subscribe({
          next: (resp) => {
            this.sujetosProcesales = resp;
            this.sujetosProcesalesFiltrados = resp;

            this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
            this.itemPaginado.data.total = this.sujetosProcesales.length;
            this.obtenerDelitosDelCaso();
            this.isRendered = true;
            this.renderer.removeClass(this.dialogElement, 'hidden');
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  private obtenerDelitosDelCaso(): void {
    let delitos: any[] = [];
    this.sujetosProcesales.forEach((sujeto) => {
      const sujetoDelitos = sujeto.delitos ? sujeto.delitos.split('||') : [];
      sujetoDelitos.forEach((delito) => delitos.push(delito));
    });
    const delitosUnicosDelCaso: Set<string> = new Set(delitos);
    this.delitosCaso = Array.from(delitosUnicosDelCaso);
  }

  public tipificarDelitos(
    idSujetoProcesal: string,
    nombreSujeto: string,
    delitos: string
  ): void {
    console.log(
      'idSujetoProcesal=' +
      idSujetoProcesal +
      ', nombreSujeto=' +
      nombreSujeto +
      ', delitos=' +
      delitos
    );
    const agregarDelitosRef = this.dialogService.open(
      AgregarDelitosModalComponent,
      {
        showHeader: false,
        width: '95%',
        contentStyle: { overflow: 'auto' },
        data: {
          numeroCaso: this.numeroCaso,
          idSujetoProcesal,
          delitosActuales: delitos ? delitos : '',
        },
      }
    );

    agregarDelitosRef.onClose.subscribe({
      next: (resp) => {
        if (resp !== undefined && resp === RESPUESTA_HTTP.OK) {
          this.dialogService.open(AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: `Delitos actualizados correctamente`,
              description: `Se actualizó los delitos para el sujeto ${nombreSujeto}`,
              confirmButtonText: 'Aceptar',
            },
          } as DynamicDialogConfig<AlertaData>);
          this.obtenerDelitosYPartes();
        }
      },
    });
  }

  onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = this.sujetosProcesales.slice(start, end);
  }
}
