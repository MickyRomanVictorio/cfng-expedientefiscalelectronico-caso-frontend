import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BuscarTramitesRequest } from '@interfaces/reusables/buscar-tramites/buscar-tramites-request.interface';
import { Tramites } from '@interfaces/reusables/buscar-tramites/buscar-tramites.interface';
import { ReusableBuscarTramites } from '@services/reusables/reusable-buscar-tramites.service';
import { MaestroService } from '@services/shared/maestro.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription, catchError, of } from 'rxjs';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { EncabezadoModalComponent } from '../encabezado-modal/encabezado-modal.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';

@Component({
  selector: 'app-buscar-tramites-modal',
  standalone: true,
  imports: [
    CommonModule,
    EncabezadoModalComponent,
    FormsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    AlertaModalComponent,
    DropdownModule,
    ToastModule,
    PaginatorComponent,
  ],
  providers: [DialogService],
  templateUrl: './buscar-tramites-modal.component.html',
  styleUrls: ['./buscar-tramites-modal.component.scss'],
})
export class BuscarTramitesModalComponent implements OnInit {
  public listProcesos: any = [
    { id: 1, nombre: 'COMÚN' },
    { id: 2, nombre: 'ESPECIAL' },
  ];
  public listSubtipos: any = [];
  public listActos: any = [];
  public listEtapas: any = [];

  lisTramites: Tramites[] = [];
  lisTramitesFiltrados: Tramites[] = [];

  public subscriptions: Subscription[] = [];

  public tipo: number;
  public nroCaso: string;
  public idCaso: string;
  public proceso: number;
  public subtipo: string;
  public etapa: string;

  form!: FormGroup;

  //paginación
  protected query: any = { limit: 10, page: 1, where: {} }
  protected resetPage: boolean = false;
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  constructor(
    public referenciaModal: DynamicDialogRef,
    private dialogConfig: DynamicDialogConfig,
    private dialogService: DialogService,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private buscarTramitesService: ReusableBuscarTramites,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {
    this.tipo = this.dialogConfig.data.tipo;
    this.nroCaso = this.dialogConfig.data.nroCaso;
    this.idCaso = this.dialogConfig.data.idCaso;
    this.proceso = this.dialogConfig.data.proceso;
    this.subtipo = this.dialogConfig.data.subtipo;
    this.etapa = this.dialogConfig.data.etapa;
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      proceso: [null, Validators.required],
      subtipo: [null, Validators.required],
      etapa: [null, Validators.required],
      acto: [null],
      tramite: [null],
    });

    if (this.tipo === 1) {
      if (
        this.proceso !== null &&
        this.proceso != 0 &&
        this.subtipo !== null &&
        this.etapa !== null
      ) {
        this.actualizarFormulario();
      } else {
        this.mostrarErrorModal('No se pudo obtener la información del caso');
      }
    }
  }

  async actualizarFormulario() {
    try {
      this.spinner.show();
      this.form.disable();
      this.form.get('proceso')!.setValue(this.proceso, { emitEvent: false });
      await this.obtenerSubtipos(this.proceso);
      this.form.get('subtipo')!.setValue(this.subtipo, { emitEvent: false });
      await this.obtenerEtapas(this.proceso, this.subtipo);
      this.form.get('etapa')!.setValue(this.etapa, { emitEvent: false });
      await this.obtenerActosProcesales(this.etapa);
      this.form.get('acto')!.enable();
      this.form.get('tramite')!.enable();
      this.spinner.hide();
    } catch (error) {
      console.error('Error al actualizar el formulario', error);
      this.spinner.hide();
    }
  }

  onChangeProceso(proceso: number) {
    this.listSubtipos = [];
    this.lisTramitesFiltrados = [];
    if (proceso !== null) {
      this.obtenerSubtipos(proceso);
    }
  }

  obtenerSubtipos(proceso: number): Promise<void> {
    this.spinner.show();
    return new Promise((resolve, reject) => {
      this.maestroService
        .obtenerSubtipoProcesos(proceso)
        .pipe(
          catchError((error) => {
            this.spinner.hide();
            console.log(error);
            reject(error);
            return of([]);
          })
        )
        .subscribe((resp) => {
          this.spinner.hide();
          this.listSubtipos = resp?.data || [];
          resolve();
        });
    });
  }

  onChangeSubtipo(subtipo: string) {
    this.listEtapas = [];
    this.listActos = [];
    this.lisTramitesFiltrados = [];
    let proceso = this.form.get('proceso')!.value;
    if (proceso !== null && subtipo !== null) {
      this.obtenerEtapas(proceso, subtipo);
    }
  }

  obtenerEtapas(proceso: number, subtipo: string): Promise<void> {
    this.spinner.show();
    return new Promise((resolve, reject) => {
      this.maestroService
        .obtenerEtapas(proceso, subtipo)
        .pipe(
          catchError((error) => {
            this.spinner.hide();
            console.log(error);
            reject(error);
            return of([]);
          })
        )
        .subscribe((resp) => {
          this.spinner.hide();
          this.listEtapas = resp?.data || [];
          resolve();
        });
    });
  }

  onChangeEtapa(etapa: string) {
    this.listActos = [];
    this.lisTramitesFiltrados = [];
    if (etapa !== null) {
      this.obtenerActosProcesales(etapa);
      this.buscarTramites();
    }
  }

  obtenerActosProcesales(etapa: string): Promise<void> {
    this.spinner.show();
    return new Promise((resolve, reject) => {
      this.maestroService
        .obtenerActosProcesales(etapa)
        .pipe(
          catchError((error) => {
            this.spinner.hide();
            console.log(error);
            reject(error);
            return of([]);
          })
        )
        .subscribe((resp) => {
          this.spinner.hide();
          this.listActos = resp?.data || [];
          resolve();
        });
    });
  }

  onChangeActo(actoId: string) {
    this.form.get('tramite')!.reset();
    this.buscarTramites();
  }

  showToast(severity: any, summary: any, detail: any) {
    this.messageService.add({ severity, summary, detail });
  }

  onInput(): void {
    const inputValue = this.form.get('tramite')!.value;
    /**if (inputValue) {**/
      
      /**this.lisTramitesFiltrados = this.lisTramites.filter((tramite) =>
        tramite.nombreTramite.toLowerCase().includes(inputValue.toLowerCase())
      );**/

      this.lisTramitesFiltrados= this.lisTramites.filter((item) =>
        Object.values(item).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
            fieldValue
              ?.toString()
              ?.toLowerCase()
              .includes(inputValue?.toLowerCase())
        )
      );

      this.itemPaginado.data.data = this.lisTramitesFiltrados
      this.itemPaginado.data.total = this.lisTramitesFiltrados.length;
      this.updatePagedItems(this.lisTramitesFiltrados, true);

    /** } else {
        console.log('lisTramites = ', this.lisTramites.length)
      this.lisTramitesFiltrados = this.lisTramites;
    }**/
  }

  buscarTramites() {
    this.spinner.show();
    let datos = this.form.getRawValue();

    if (datos.proceso === null || datos.proceso === undefined) {
      this.mostrarErrorModal('Por favor seleccione el tipo proceso');
      this.spinner.hide();
      return;
    }

    if (datos.subtipo === null || datos.subtipo === undefined) {
      this.mostrarErrorModal('Por favor seleccione el subtipo proceso');
      this.spinner.hide();
      return;
    }

    if (datos.etapa === null || datos.etapa === undefined) {
      this.mostrarErrorModal('Por favor seleccione la etapa');
      this.spinner.hide();
      return;
    }

    let request: BuscarTramitesRequest = {
      tipo: this.tipo,
      idCaso: this.idCaso,
      idProceso: datos.proceso,
      idSubtipo: datos.subtipo,
      idEtapa: datos.etapa,
      idActoProcesal: datos.acto,
    };

    this.subscriptions.push(
      this.buscarTramitesService.buscarTramites(request).subscribe({
        next: (resp) => {
          this.lisTramites = resp;
          this.lisTramitesFiltrados = resp;
          this.itemPaginado.data.data = this.lisTramitesFiltrados;
          this.itemPaginado.data.total = this.lisTramitesFiltrados.length;
          this.updatePagedItems(this.lisTramitesFiltrados, false);
          this.spinner.hide();
        },
        error: (error) => {
          console.log(error);
          this.spinner.hide();
        },
      })
    );
  }

  private mostrarErrorModal(mensaje: string): void {
    const ref = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: 'Error',
        description: mensaje,
        confirmButtonText: 'Aceptar',
        confirm: false,
      },
    });
  }

  seleccionarTramite(tramite: Tramites) {
    this.referenciaModal.close(tramite);
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.updatePagedItems(paginacion.data, paginacion.resetPage)
  }

  indexPag(index: number) {
    const data = (this.query.page - 1) * this.query.limit;
    return index + data + 1;
  }

  updatePagedItems(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.lisTramitesFiltrados = data.slice(start, end);
  }
}
