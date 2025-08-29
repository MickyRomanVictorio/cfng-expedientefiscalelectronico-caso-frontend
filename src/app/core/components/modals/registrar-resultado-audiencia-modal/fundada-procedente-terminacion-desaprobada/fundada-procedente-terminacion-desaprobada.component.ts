import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CmpLibModule } from 'dist/cmp-lib';
import { ButtonModule } from 'primeng/button';
import { obtenerIcono } from '@core/utils/icon';
import { DropdownModule } from 'primeng/dropdown';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Message, SelectItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ApelacionesResultadosService } from '@core/services/provincial/tramites/especiales/registrar-resultado-audiencia/fundada-procedente/apelaciones-resultados.service';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import { MaestroService } from '@core/services/shared/maestro.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Constants, ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';
import { TableModule } from 'primeng/table';
import { Combo } from '@core/interfaces/comunes/combo';
import { ID_N_RSP_APELACION } from '@core/types/efe/provincial/tramites/especial/respuesta-apelacion.type';
import { ApelacionFiscalia } from '@core/interfaces/provincial/tramites/fundado-procedente/apelacion-fiscalia';
import { ComboString } from '@core/interfaces/comunes/comboString';
import {
  GenericResponse,
  GenericResponseModel,
} from '@core/interfaces/comunes/GenericResponse';
import { ApelacionRequest } from '@core/interfaces/provincial/tramites/fundado-procedente/apelacion';
import { ID_N_TIPO_APELACION_SUJETO } from '@core/types/efe/provincial/tramites/especial/tipo-apelacion-sujeto.type';
import { SujetoApelanteIncoacion } from '@core/interfaces/provincial/tramites/fundado-procedente/sujeto-apelante';
import { SujetoCasoResultado } from '@core/interfaces/provincial/tramites/fundado-procedente/sujeto-caso-resultado';
import { PaginatorComponent } from "../../../generales/paginator/paginator.component";
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { MessagesModule } from 'primeng/messages';
import { validateMessageService } from '@core/services/provincial/tramites/validateMessage.service';
import { TramiteService } from '@services/provincial/tramites/tramite.service';


@Component({
  selector: 'app-fundada-procedente-terminacion-desaprobada',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    CmpLibModule,
    DropdownModule,
    PaginatorComponent,
    MessagesModule
],
  templateUrl: './fundada-procedente-terminacion-desaprobada.component.html',
  styleUrl: './fundada-procedente-terminacion-desaprobada.component.scss',
})
export class FundadaProcedenteTerminacionDesaprobadaComponent implements OnInit, OnDestroy {
  @Input() data!: any;
  public subscriptions: Subscription[] = [];
  ID_DENIEGA_APELACION: number = ID_N_RSP_APELACION.DENIEGA;
  ID_CONCEDE_APELACION: number = ID_N_RSP_APELACION.CONCEDE;
  obtenerIcono = obtenerIcono;
  formApelacionFiscalia: FormGroup;
  formTerminacionAnticipada: FormGroup;
  verMensajeApelacion: boolean = false;

  listaSujetosApelantes: SujetoApelanteIncoacion[] = [];
  listaResultadoApelaciones: any = [];
  listaApelacionFiscalia: Combo[] = [
    {
      id: 0,
      nombre: 'NO',
    },
    {
      id: ID_N_RSP_APELACION.CONCEDE,
      nombre: 'CONCEDE APELACIÓN',
    },
    {
      id: ID_N_RSP_APELACION.DENIEGA,
      nombre: 'DENIEGA APELACIÓN',
    },
  ];
  listaQueja: ComboString[] = [
    { nombre: 'NO', id: '0' },
    { nombre: 'SI', id: '1' },
  ];
  listaApelaciones: SujetoCasoResultado[] = [];
  idActoTramiteCaso!: string;
  idCaso!: string;
  codDependencia!: string;
  fiscaliasPronvinciales: SelectItem[] = [];
  validGuardarFiscaliaSuperior: boolean = false;
  fiscaliaApelacionControl = new FormControl('');
  codDependenciaApelacion: string = '';
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
    private apelacionesResultadosService: ApelacionesResultadosService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly validateMessageService: validateMessageService,
    private readonly tramiteService: TramiteService,
    private maestrosService: MaestroService,
    private fb: FormBuilder
  ) {
    this.formApelacionFiscalia = this.fb.group({
      resultadoApelacion: [null, [Validators.required]],
      queja: [null],
    });
    this.formTerminacionAnticipada = this.fb.group({
      sujetoApelo: [null, [Validators.required]],
      idTipoParteSujeto: [null, [Validators.required]],
      resultadoApelacion: [null, [Validators.required]],
      queja: [null],
    });
    const helper = new JwtHelperService();
    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);
    const decodedToken = helper.decodeToken(token.token);
    this.codDependencia = decodedToken.usuario.codDependencia;
  }

  ngOnInit() {
    this.idActoTramiteCaso = this.data?.idActoTramiteCaso;
    this.idCaso = this.data?.idCaso;
    this.iniciarDatos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected get modoLectura(): boolean {
    return this.tramiteEnModoVisor || this.tramiteEstadoFirmadoRecibido;
  }

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }

  get tramiteEstadoFirmadoRecibido(): boolean {
    return this.data.idEstadoTramite === ESTADO_REGISTRO.FIRMADO || this.data.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  iniciarDatos() {
    this.formApelacionFiscalia.get('resultadoApelacion')?.setValue(0);
    this.formApelacionFiscalia.get('queja')?.setValue('0');
    this.formTerminacionAnticipada.get('queja')?.setValue('0');
    this.fiscaliaApelacionControl.disable();

    this.listarApelantes();//lista de apelantes
    this.listarResultadoApelacionesCombo();//(CONCEDE APELACIÓN Y DENIEGA APELACIÓN) maestros
    this.listarApelacionesTerminacionAnticipada();//lista de apelaciones grilla
    this.obtenerApelacionFiscalia();//OBTIENE (resultadoApelacion y queja)
    this.obtenerFiscaliasXEntidad();//OBTIENE LAS FISCALIAS SUPERIOR POR ENTIDAD
    this.obtenerfiscaliaElevacion();
  }

  obtenerApelacionFiscalia() {
    this.subscriptions.push(
      this.apelacionesResultadosService
        .obtenerApelacionDeLaFiscalia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: GenericResponseModel<ApelacionFiscalia>) => {
            if (resp?.code == 200 && resp.data !== null) {
              this.formApelacionFiscalia.get('resultadoApelacion')?.setValue(resp.data.idRspInstancia);
              this.formApelacionFiscalia.get('queja')?.setValue(resp.data.flagRspQueja);
            }
          },
          error: () => {
            this.modalDialogService.error(
              'ERROR',
              'Error al intentar obtener la apelación de la fiscalía a la terminación anticipada',
              'Aceptar'
            );
          },
        })
    );
  }

  onChangeResultadoApelacionFiscalia() {
    this.verMensajeApelacion = false;
    let data = this.formApelacionFiscalia.getRawValue();

    if (
      data.resultadoApelacion !== null &&
      data.resultadoApelacion === ID_N_RSP_APELACION.DENIEGA
    ) {
      this.formApelacionFiscalia.get('queja')?.setValue('0');
      data = this.formApelacionFiscalia.getRawValue();
    }

    if (data.resultadoApelacion !== null) {
      let request: ApelacionFiscalia = {
        idActoTramiteCaso: this.idActoTramiteCaso,
        idRspInstancia: data.resultadoApelacion === 0 ? null : data.resultadoApelacion,
        flagRspQueja: data.resultadoApelacion === ID_N_RSP_APELACION.CONCEDE ? null : data.queja,
      };
      this.guardarResultadoApelacion(request);
    }
  }

  onChangeQuejaApelacionFiscalia() {
    this.verMensajeApelacion = false;
    let data = this.formApelacionFiscalia.getRawValue();
    if (
      data.resultadoApelacion === ID_N_RSP_APELACION.DENIEGA &&
      data.queja &&
      data.queja !== null
    ) {
      let request: ApelacionFiscalia = {
        idActoTramiteCaso: this.idActoTramiteCaso,
        idRspInstancia: data.resultadoApelacion,
        flagRspQueja: data.queja,
      };
      this.guardarResultadoApelacion(request);
    }
  }

  guardarResultadoApelacion(request: ApelacionFiscalia) {
    this.subscriptions.push(
      this.apelacionesResultadosService
        .registrarApelacionDeLaFiscalia(request)
        .subscribe({
          next: (resp: GenericResponse) => {
            if (resp?.code == 200) {
              this.verMensajeApelacion = true;
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

  onChangeApelante() {
    const sujeto = this.listaSujetosApelantes.find(
      (s) =>
        s.idSujetoCaso === this.formTerminacionAnticipada.get('sujetoApelo')?.value
    );
    this.formTerminacionAnticipada.get('idTipoParteSujeto')?.setValue(sujeto?.idTipoParteSujeto);
  }

  onChangeQuienApelo() {
    let data = this.formTerminacionAnticipada.getRawValue();

    if (
      data.resultadoApelacion &&
      data.resultadoApelacion !== null &&
      data.resultadoApelacion === ID_N_RSP_APELACION.DENIEGA
    ) {
      this.formTerminacionAnticipada.get('queja')?.setValue('0');
    }
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

    if (
      data.resultadoApelacion === undefined ||
      data.resultadoApelacion === null
    ) {
      this.modalDialogService.warning(
        'Validación',
        'Debe seleccionar un resultado de apelación',
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

    let request: ApelacionRequest = {
      idTipoApelacion: ID_N_TIPO_APELACION_SUJETO.TERMINACION_ANTICIPADA,
      idActoTramiteCaso: this.idActoTramiteCaso,
      idSujetoCaso: data.sujetoApelo,
      idRspInstancia: data.resultadoApelacion,
      flagRspQueja:
        data.resultadoApelacion === ID_N_RSP_APELACION.CONCEDE
          ? null
          : data.queja,
      idTipoParteSujeto: data.idTipoParteSujeto,
    };

    this.subscriptions.push(
      this.apelacionesResultadosService.registrarApelacion(request).subscribe({
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
      this.apelacionesResultadosService
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
              this.validarApelacionConcede();
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

  validarApelacionConcede() {
    const tieneApelacionConcedida = this.listaApelaciones.some(
      (s) => s.idResultadoApelacion === ID_N_RSP_APELACION.CONCEDE
    );
    if (tieneApelacionConcedida) {
      this.fiscaliaApelacionControl.enable();
      this.fiscaliaApelacionControl.setValue(this.codDependenciaApelacion);
      this.validarMessageValidateFiscaliaSuperior(this.codDependenciaApelacion);
    } else {
      this.validGuardarFiscaliaSuperior = false;
      this.fiscaliaApelacionControl.setValue(null);
      this.fiscaliaApelacionControl.disable();
      this.validarMessageValidateFiscaliaSuperior('0');
    }
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
      this.apelacionesResultadosService.listarApelantes(this.idCaso).subscribe({
        next: (resp) => {
          this.listaSujetosApelantes = resp.data;
        },
      })
    );
  }

  listarResultadoApelacionesCombo() {
    this.subscriptions.push(
      this.apelacionesResultadosService.resultadoApelaciones().subscribe({
        next: (resp) => {
          this.listaResultadoApelaciones = resp.data.filter(
            (item: any) => item.id !== ID_N_RSP_APELACION.CONSENTIDO
          );
        },
      })
    );
  }

  obtenerFiscaliasXEntidad() {
    this.subscriptions.push(
      this.maestrosService
        .obtenerFiscaliaXDependencia(this.codDependencia)
        .subscribe({
          next: (resp) => {
            this.fiscaliasPronvinciales = resp.data.map(
              (item: { id: any; nombre: any }) => ({
                value: item.id,
                label: item.nombre,
              })
            );
          },
          error: () => {
            this.modalDialogService.error(
              'ERROR',
              'Error al intentar obtener la fiscalía superior a donde se eleva la apelación',
              'Aceptar'
            );
          },
        })
    );
  }

  guardarFiscaliaSuperior(value: any) {
    this.validGuardarFiscaliaSuperior = false;

      const request = {
        idActoTramiteCaso: this.idActoTramiteCaso,
        codigoDependecia: value,
      };
      this.subscriptions.push(
        this.apelacionesResultadosService
          .registrarApelacionFiscalia(request)
          .subscribe({
            next: (resp) => {
              this.validGuardarFiscaliaSuperior = resp?.code === 200 && value !== null;
              this.codDependenciaApelacion = value;
              this.validarMessageValidateFiscaliaSuperior(this.codDependenciaApelacion);
            },
            error: () => {
              this.modalDialogService.error(
                'ERROR',
                'Error al intentar elevar la apelación',
                'Aceptar'
              );
            },
          })
      );

  }

  validarMessageValidateFiscaliaSuperior(codigo: string): void {
    this.validateMessageService.cambiarValidacion(codigo === '');
  }

  obtenerfiscaliaElevacion() {
    this.subscriptions.push(
      this.apelacionesResultadosService
        .obtenerApelacionFiscalia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            if (resp.code === 200 && resp.data.codigoDependecia !== null) {
              this.codDependenciaApelacion = resp.data.codigoDependecia;
              this.fiscaliaApelacionControl.setValue(resp.data.codigoDependecia);
            }
            this.validarMessageValidateFiscaliaSuperior(resp.data.codigoDependecia);
          },
          error: () => {
            this.modalDialogService.error(
              'ERROR',
              'Error al intentar obtener la fiscalia superior al que fue elevado',
              'Aceptar'
            );
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
            this.apelacionesResultadosService.eliminarApelacion(id).subscribe({
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
