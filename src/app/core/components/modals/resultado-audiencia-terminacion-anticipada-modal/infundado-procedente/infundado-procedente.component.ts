import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { GenericResponse } from '@core/interfaces/comunes/GenericResponse';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { ID_N_RSP_APELACION } from '@core/types/efe/provincial/tramites/especial/respuesta-apelacion.type';
import { ID_N_TIPO_APELACION_SUJETO } from '@core/types/efe/provincial/tramites/especial/tipo-apelacion-sujeto.type';
import { obtenerIcono } from '@core/utils/icon';
import { CmpLibModule } from 'dist/cmp-lib';
import { ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { Message } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { MessagesModule } from 'primeng/messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ResolucionAutoResuelveTerminacionAnticipadaService } from '@core/services/provincial/tramites/comun/preparatoria/resolucion-auto-resuelve-ta.service';
import { Apelacion, ListaApelaciones, SujetoApelante } from '@core/interfaces/provincial/tramites/comun/preparatoria/resolucion-auto-resuelve-ta';
import { ApelacionFiscaliaComponent } from '../apelacion-fiscalia/apelacion-fiscalia.component';

@Component({
  selector: 'app-infundado-procedente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    CmpLibModule,
    DropdownModule,
    PaginatorComponent,
    MessagesModule,
    RadioButtonModule,
    ApelacionFiscaliaComponent
  ],
  templateUrl: './infundado-procedente.component.html',
  styleUrl: './infundado-procedente.component.scss'
})
export class InfundadoProcedenteComponent implements OnInit, OnDestroy {
 
  @Input() data!: any;
  @Input() modoLectura!: boolean;

  public subscriptions: Subscription[] = [];

  obtenerIcono = obtenerIcono;
  formTerminacionAnticipada: FormGroup;

  listaSujetosApelantes: SujetoApelante[] = [];
  listaResultadoApelaciones: any = [];
  listaApelaciones: ListaApelaciones[] = [];

  idActoTramiteCaso!: string;
  idCaso!: string;
  fiscaliaApelacionControl = new FormControl('');
  messageTA: Message[] = [];
  showMessageTA: boolean = false;
  
  public resetPage: boolean = false;
  public query: any = { limit: 3, page: 1, where: {} };
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
    private resulucionAutoResuelve: ResolucionAutoResuelveTerminacionAnticipadaService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly tramiteService: TramiteService,
    private fb: FormBuilder
  ) {
    this.formTerminacionAnticipada = this.fb.group({
      sujetoApelo: [null, [Validators.required]],
      idTipoParteSujeto: [null, [Validators.required]],
      resultadoApelacion: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    this.idActoTramiteCaso = this.data?.idActoTramiteCaso;
    this.idCaso = this.data?.idCaso;
    
    if (this.modoLectura ) {
      this.formTerminacionAnticipada.disable()
    }

    this.iniciarDatos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  iniciarDatos() {
    this.listarApelantes();
    this.listarApelacionesTerminacionAnticipada();
  }

  onChangeApelante() {
    const sujeto = this.listaSujetosApelantes.find(
      (s) =>
        s.idSujetoCaso === this.formTerminacionAnticipada.get('sujetoApelo')?.value
    );
    this.formTerminacionAnticipada.get('idTipoParteSujeto')?.setValue(sujeto?.idTipoParteSujeto);
  }

  validacionApelacionInmediatoExiste(idSujetoCaso: string): boolean {
    return this.listaApelaciones.some((item: any) =>
      item.idSujetoCaso === idSujetoCaso
    );
  }

  guardarApelacionTerminacionAnticipada() {
    let data = this.formTerminacionAnticipada.getRawValue();

    if (data.sujetoApelo === undefined || data.sujetoApelo === null) {
      this.modalDialogService.warning(
        'Validación',
        'Debe seleccionar un sujeto',
        'Aceptar'
      );
      return;
    }

    if (this.validacionApelacionInmediatoExiste(data.sujetoApelo)) {
      this.messageTA = [
        {
          severity: 'error',
          summary: '',
          detail: 'Seleccione otro sujeto en la opción quien apeló para poder generar el registro',
          icon: 'pi-info-circle icon-color'
        },
      ];
      this.showMessageTA = true;
      return;
    }

    let request: Apelacion = {
      idTipoApelacion: ID_N_TIPO_APELACION_SUJETO.TERMINACION_ANTICIPADA,
      idActoTramiteCaso: this.idActoTramiteCaso,
      idSujetoCaso: data.sujetoApelo,
      idRspInstancia: ID_N_RSP_APELACION.CONSENTIDO,
      idTipoParteSujeto: data.idTipoParteSujeto,
    };

    this.subscriptions.push(
      this.resulucionAutoResuelve.registrarApelacion(request).subscribe({
        next: (resp: GenericResponse) => {
          if (resp?.code == 200) {
            this.formTerminacionAnticipada.reset();
            this.listarApelacionesTerminacionAnticipada();
            this.modalDialogService.success(
              'Éxito',
              'Apelación registrada',
              'Aceptar'
            );
          }
        },
        error: () => {
          this.modalDialogService.error(
            'ERROR',
            'Error al intentar registrar la apelación de la fiscalía a la terminación anticipada',
            'Aceptar'
          );
        },
      })
    );
  }

  listarApelacionesTerminacionAnticipada() {
    this.listaApelaciones = [];
    this.subscriptions.push(
      this.resulucionAutoResuelve
        .listarApelaciones(
          this.idActoTramiteCaso,
          ID_N_TIPO_APELACION_SUJETO.TERMINACION_ANTICIPADA
        )
        .subscribe({
          next: (resp) => {
            if (resp?.code === 200) {
              this.listaApelaciones = resp?.data;
              this.itemPaginado.data.data = this.listaApelaciones;
              this.itemPaginado.data.total = this.listaApelaciones.length;
              this.actualizarPaginaRegistros(this.listaApelaciones, true);
            }
          },
          error: (error) => {
            this.modalDialogService.error(
              'ERROR',
              'Error al intentar listar las apelaciones realizadas de proceso inmediato',
              'Aceptar'
            );
          },
        })
    );
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.actualizarPaginaRegistros(paginacion.data, paginacion.resetPage);
  }

  actualizarPaginaRegistros(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.listaApelaciones = data.slice(start, end);
  }

  listarApelantes() {
    this.subscriptions.push(
      this.resulucionAutoResuelve.listarApelantes(this.idCaso).subscribe({
        next: (resp) => {
          this.listaSujetosApelantes = resp.data;
        },
      })
    );
  }

  eliminarRegistroApelado(id: string) {
    const dialog = this.modalDialogService.question(
      'Eliminar apelación',
      '¿Realmente quiere eliminar este registro de apelación?',
      'Eliminar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.subscriptions.push(
            this.resulucionAutoResuelve.eliminarApelacion(id).subscribe({
              next: (resp) => {
                if (resp?.code === 200) {
                  this.listarApelacionesTerminacionAnticipada();
                  this.modalDialogService.info(
                    'Éxito',
                    'Apelación eliminada correctamente',
                    'Aceptar'
                  );
                }
              },
              error: () => {
                this.modalDialogService.error(
                  'ERROR',
                  'Error al intentar eliminar la apelación',
                  'Aceptar'
                );
              },
            })
          );
        }
      },
    });
  }
}