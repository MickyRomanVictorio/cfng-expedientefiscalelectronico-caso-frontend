import { AutoSobreseimientoDefinitivoService } from '../../../../../../core/services/provincial/tramites/comun/juzgamiento/auto-sobreseimiento-definitivo/auto-sobreseimiento.service';
import { CommonModule, DatePipe } from '@angular/common';
import { IconAsset, IconUtil, ValidationModule } from 'dist/ngx-cfng-core-lib';

import { CmpLibModule } from 'dist/cmp-lib';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessagesModule } from 'primeng/messages';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { Router } from '@angular/router';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { capitalizedFirstWord } from '@core/utils/string';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { ESTADO_REGISTRO, RESPUESTA_MODAL } from 'ngx-cfng-core-lib';
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import {
  catchError,
  defer,
  Observable,
  of,
  Subscription,
  switchMap,
  throwError,
} from 'rxjs';

import { Expediente } from '@core/utils/expediente';
import { AutoSobreSeimientoAdd } from '@core/interfaces/comunes/AutoSobreSeimientoAdd.interface';
import { ID_TIPO_ORIGEN } from '@core/types/tipo-origen.type';
import { EncabezadoTooltipComponent } from '@core/components/modals/encabezado-tooltip/encabezado-tooltip.component';
@Component({
  selector: 'app-auto-sobreseimiento-consentido-archivo',
  standalone: true,
  imports: [
    CommonModule,
    ProgressBarModule,
    ReactiveFormsModule,
    MessagesModule,
    CalendarModule,
    FormsModule,
    RadioButtonModule,
    CmpLibModule,
    CheckboxModule,
    DateMaskModule,
    MensajeCompletarInformacionComponent,
    MensajeInteroperabilidadPjComponent,
    ValidationModule,
    DropdownModule,
    TableModule,
    PaginatorComponent,
    EncabezadoTooltipComponent,
  ],
  styleUrls: ['../retiro-acusacion.component.scss'],
  templateUrl: './auto-consentido-archivo-definitivo.component.html',
  providers: [DialogService, DatePipe, NgxCfngCoreModalDialogService],
})
export class AutoSobreseimientoConsentidoComponent implements OnInit {
  protected caso!: Expediente;
  @Output() peticionParaEjecutar = new EventEmitter<
    (datos: Object) => Observable<any>
  >();
  @Input() idCaso: string = '';
  @Input() idActoTramiteCaso: string = '';
  @Input() idEstadoTramite!: number;
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';
  public idEtapa!: string;
  protected formRegistro: FormGroup;
  protected verFormulario: boolean = false;
  public tramiteSeleccionado!: TramiteProcesal | null;
  protected fechaActual: Date = new Date();
  protected fechaIngreso: Date | null = null;
  public validacionTramite!: ValidacionTramite;
  public sujetosProcesalesFiltrados: any[] = [];
  public sujetosProcesalesFiltradosOriginal: any[] = [];
  public sujetosProcesales!: any[];
  protected listaDelitosSelected: any[] = [];
  public tooltipVisible: boolean = false;
  public totalSujetosProcesales!: number;
  protected botonesDisabled: boolean = false;
  protected readonly iconUtil = inject(IconUtil);
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
  public suscripciones: Subscription[] = [];
  private totalDelitosCaso: number = 0;
  protected tipoSobreseimientoPadre: number = 0;
  protected tituloTootip: string =
    'Registro de acusados que presentan retiro de acusación aprobados por el juez penal:';
  protected referenciaModal!: DynamicDialogRef;
  private idEstadoRegistro: number = 0;
  constructor(
    protected iconAsset: IconAsset,
    protected fb: FormBuilder,
    protected datePipe: DatePipe,
    protected dialogService: DialogService,
    protected tramiteService: TramiteService,
    private readonly gestionCasoService: GestionCasoService,
    protected readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly autoSobreseimientoDefinitivoService: AutoSobreseimientoDefinitivoService
  ) {
    this.formRegistro = this.fb.group({
      fechaNotificacion: ['', [Validators.required]],
      sujetoProcesal: ['', null],
      sujetoProcesalSelected: ['', null],
      resuelve: ['', [Validators.maxLength(200), Validators.required]],
      observacion: ['', [Validators.maxLength(200)]],
      listaDelitos: [''],
      retiroReparacionCivil: [false, null],
    });
  }

  ngOnInit() {
    this.caso = this.gestionCasoService.casoActual;
    if (this.estadoRecibido) {
      this.formRegistro.disable();
      this.botonesDisabled = true;
    }
    if (this.validacionTramite.cantidadTramiteSeleccionado !== 0) {
      this.verFormulario = true;
      this.loadListaSujetosProcesales(6);
      this.obtenerDatosFormulario();
    }
    //  this.formularioValido;
    this.formRegistro.valueChanges.subscribe((val) => {
      this.habilitarGuardar(this.formularioValidoGuardar());
    });
    this.peticionParaEjecutar.emit(() => this.guardarFormulario());
  }
  toggleTooltip: () => void = () => {
    this.tooltipVisible = !this.tooltipVisible;
  };
  showTooltip(): void {
    if (!this.tooltipVisible) {
      this.tooltipVisible = true;
    }
  }
  get tieneActoTramiteCasoDocumento(): boolean {
    return Boolean(this.idActoTramiteCaso);
  }
  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoRegistro === ESTADO_REGISTRO.RECIBIDO;
  }
  get permitirGuardar(): boolean {
    return this.formularioValidoGuardar();
    //return this.idEstadoTramite === ESTADO_REGISTRO.PENDIENTE_COMPLETAR;
  }
  onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.actualizarPaginaRegistros();
  }
  formularioValidoGuardar(): boolean {
    let validarTipoSobreseimiento = this.sujetosProcesalesFiltrados.length > 0;

    return this.formRegistro.valid && validarTipoSobreseimiento;
  }
  updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;

    this.sujetosProcesalesFiltrados = [
      ...this.sujetosProcesalesFiltrados.slice(start, end),
    ];
  }

  get tramiteOriginadoEnEfe(): boolean {
    return (
      this.validacionTramite.tipoOrigenTramiteSeleccionado ===
      ID_TIPO_ORIGEN.EFE
    );
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite);
  }
  protected activarFormulario(event: boolean) {
    this.tramiteService.verIniciarTramite = event;
  }
  get estadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }
  protected otroTramite() {
    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      showHeader: false,

      data: {
        tipo: 2,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idEtapa: this.idEtapa,
      },
    });

    ref.onClose.subscribe((confirm) => {
      if (confirm === RESPUESTA_MODAL.OK) window.location.reload();
    });
  }
  protected counterReportChar(nombreValor: string): number {
    return this.formRegistro.get(nombreValor)!.value !== null
      ? this.formRegistro.get(nombreValor)!.value.length
      : 0;
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((subscription) => subscription.unsubscribe());
  }
  validarSujetosProcesalesEnTabla(result: any): any[] {
    return result.filter((sujeto: any) => {
      // Obtener los delitos del sujeto actual
      const delitosSujeto = sujeto.delitos.map(
        (delito: any) => delito.idDelitoEspecifico
      );

      // Obtener todos los delitos registrados en sujetosProcesalesFiltrados
      const delitosFiltrados = result
        .filter(
          (sujeto: any) => sujeto.idActoTramiteCaso == this.idActoTramiteCaso
        ) // Filtrar sujetos que cumplen la condición
        .flatMap((filtrado: any) =>
          filtrado.delitos.map((delito: any) => delito.idDelitoEspecifico)
        );
      // Verificar si todos los delitos del sujeto están en delitosFiltrados
      return delitosSujeto.every(
        (idDelito: number) => !delitosFiltrados.includes(idDelito)
      );
    });
  }
  protected onSelectSujetoDelito(event: any) {
    const delitoSeleccionado = this.listaDelitosSelected.find(
      (delito) => delito.idDelitoEspecifico === event.value
    );
    this.formRegistro
      .get('retiroReparacionCivil')
      ?.setValue(
        delitoSeleccionado.retiroReparacionCivil == '1' ? true : false
      );
  }
  loadListaSujetosProcesales(idTipoSujeto: number = 0) {
    const idCaso = this.caso.idCaso;
    this.suscripciones.push(
      this.autoSobreseimientoDefinitivoService
        .obternerListaSujetosProcesales(
          idCaso,
          idTipoSujeto,
          this.idActoTramiteCaso
        )
        .subscribe((result: any) => {
          this.sujetosProcesales = result;
          this.sujetosProcesales = this.sujetosProcesales
            .filter(
              (sujeto: any) =>
                sujeto.idActoTramiteCaso !== this.idActoTramiteCaso &&
                sujeto.idActoTramiteCasoPadre !== '0'
            )
            .map((sujeto: any) => {
              // Obtener los idDelitoEspecifico con flConsentido === '1'
              const delitosConsentidos = sujeto.delitos
                .filter((delito: any) => delito.flConsentido === '1')
                .map((delito: any) => delito.idDelitoEspecifico);

              return {
                ...sujeto,
                delitos: sujeto.delitos.filter(
                  (delito: any) =>
                    delito.idActoTramiteDelitoSujeto !== '0' &&
                    delito.flConsentido === '0' &&
                    delito.flRechazado === '0' &&
                    delito.idActoTramiteCasoPadre !== '0' &&
                    !delitosConsentidos.includes(delito.idDelitoEspecifico) // Excluir delitos ya consentidos
                ),
              };
            })
            .filter((sujeto: any) => sujeto.delitos.length > 0) // Eliminar sujetos sin delitos
            .reduce((acc: any[], current: any) => {
              const existingSujeto = acc.find(
                (s) => s.idSujetoCaso === current.idSujetoCaso
              );

              if (existingSujeto) {
                // Combinar delitos evitando duplicados (usando idActoTramiteDelitoSujeto)
                const delitosUnicos = [
                  ...existingSujeto.delitos,
                  ...current.delitos,
                ].filter(
                  (delito, index, self) =>
                    index ===
                    self.findIndex(
                      (d) =>
                        d.idActoTramiteDelitoSujeto ===
                        delito.idActoTramiteDelitoSujeto
                    )
                );

                existingSujeto.delitos = delitosUnicos;
              } else {
                // Si no existe, agregamos el sujeto tal cual
                acc.push(current);
              }

              return acc;
            }, []);

          this.sujetosProcesalesFiltrados = result.filter(
            (sujeto: any) => sujeto.idActoTramiteCaso == this.idActoTramiteCaso
          );

          this.sujetosProcesalesFiltrados =
            this.sujetosProcesalesFiltrados.flatMap((sujeto: any) => {
              return sujeto.delitos
                .filter(
                  (delito: any) =>
                    delito.idActoTramiteSujeto === sujeto.idActoTramiteSujeto &&
                    delito.idActoTramiteDelitoSujeto != '0' &&
                    delito.flConsentido == '1'
                ) // Filtrar delitos válidos
                .map((delito: any) => ({
                  ...sujeto, // Copiar las propiedades del sujeto
                  delito: `${delito.noDelitoGenerico}/ ${delito.noDelitoSubgenerico}/ ${delito.noDelitoEspecifico}`, // Asignar el valor del delito             
                  idDelitoEspecifico: delito.idDelitoEspecifico, // Agregar id del delito
                  idActoTramiteDelitoSujeto: delito.idActoTramiteDelitoSujeto, // Agregar idActoTramiteDelitoSujeto
                  retiroReparacionCivil:
                    delito.retiroReparacionCivil === '1' ? true : false,
                }));
            });
          this.totalSujetosProcesales = this.sujetosProcesales.length;
          this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
          this.itemPaginado.data.total = this.totalSujetosProcesales =
            this.sujetosProcesalesFiltrados.length;
          this.sujetosProcesalesFiltradosOriginal =
            this.sujetosProcesalesFiltrados;
          this.actualizarPaginaRegistros();
        })
    );
  }
  actualizarPaginaRegistros() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.query = { ...this.query };
    this.sujetosProcesalesFiltrados =
      this.sujetosProcesalesFiltradosOriginal.slice(start, end);
  }
  agregarEliminarSujetosDelitos(data: AutoSobreSeimientoAdd) {
    const eliminarDelito = data.flagAgregarDelito === 0;
    this.suscripciones.push(
      this.autoSobreseimientoDefinitivoService
        .agregarEliminarSujetosDelitos(this.idActoTramiteCaso, data)
        .subscribe({
          next: (data) => {
            if (eliminarDelito) {
              this.modalDialogService.success(
                '',
                'Se eliminó correctamente',
                'Cerrar'
              );
            }
          },
          error: (err) => {
            console.error(
              'Error al agregar o eliminar sujetos y delitos:',
              err
            );
          },
        })
    );
  }

  protected onSelectSujetoProcesal(event: any): void {
    this.formRegistro.get('listaDelitos')?.reset();
    const sujetoSeleccionado = this.sujetosProcesales.find(
      (sujeto) => sujeto.idSujetoCaso === event.value
    );

    if (sujetoSeleccionado) {
      // Setear el nombre del sujeto procesal en el input deshabilitado
      this.formRegistro
        .get('sujetoProcesalSelected')
        ?.setValue(sujetoSeleccionado.nombreSujeto);

      const delitosEnTabla = this.sujetosProcesalesFiltrados
        .filter((item) => item.nombreSujeto === sujetoSeleccionado.nombreSujeto)
        .flatMap((item) => item.delito);

      // Mostrar en el ComboBox solo los delitos que no estén en la tabla
      if (delitosEnTabla.length > 0) {
        this.listaDelitosSelected = [
          ...sujetoSeleccionado.delitos
            .filter(
              (delito: any) =>
                !delitosEnTabla.includes(delito.noDelitoEspecifico)
            )
            .map((delito: any) => ({
              ...delito,
             noDelitoEspecifico: `${delito.noDelitoGenerico}/ ${delito.noDelitoSubgenerico}/ ${delito.noDelitoEspecifico}`,
              idSujetoCaso: sujetoSeleccionado.idSujetoCaso, // Agregar idSujetoCaso
            })),
        ];
      } else {
        this.listaDelitosSelected = [
          ...sujetoSeleccionado.delitos.map((delito: any) => ({
            ...delito,
            noDelitoEspecifico: `${delito.noDelitoGenerico}/ ${delito.noDelitoSubgenerico}/ ${delito.noDelitoEspecifico}`,
            idSujetoCaso: sujetoSeleccionado.idSujetoCaso, // Agregar idSujetoCaso
          })),
        ];
      }
    }
  }

  protected agregarSujetoProcesalTabla(event: any) {
    // Validar que el input de sujetoProcesal no esté vacío
    const sujetoProcesal = this.formRegistro.get(
      'sujetoProcesalSelected'
    )?.value;
    if (!sujetoProcesal) {
      this.modalDialogService.error(
        'Error',
        'Debe seleccionar un sujeto procesal.',
        'Aceptar'
      );
      return;
    }

    // Validar que el combo de listaDelitosSelected tenga un valor seleccionado
    const idDelitoEspecifico = this.formRegistro.get('listaDelitos')?.value;

    const delitoTexto = this.listaDelitosSelected.find(
      (delito) => delito.idDelitoEspecifico === idDelitoEspecifico
    )?.noDelitoEspecifico;
    if (!idDelitoEspecifico) {
      this.modalDialogService.error(
        'Error',
        'Debe seleccionar al menos un delito.',
        'Aceptar'
      );
      return;
    }

    // Buscar el sujeto procesal seleccionado en la lista de sujetosProcesales
    const sujetoSeleccionado = this.sujetosProcesales.find(
      (sujeto) => sujeto.nombreSujeto === sujetoProcesal
    );

    if (sujetoSeleccionado) {
      const data: AutoSobreSeimientoAdd = {
        retiroReparacionCivil: this.formRegistro.get('retiroReparacionCivil')
          ?.value
          ? '1'
          : '0',
        idActoTramiteCaso: this.idActoTramiteCaso,
        idSujetoCaso: sujetoSeleccionado.idSujetoCaso,
        idDelito: idDelitoEspecifico,
        idTipoParteSujeto: sujetoSeleccionado.idTipoParteSujeto,
        flagAgregarDelito: 1, // Cambiar a 1 para agregar el delito
        flConsentido: '1',
      };
      this.agregarEliminarSujetosDelitos(data); // Llamar al servicio para agregar el delito
      // Agregar el sujeto procesal a la lista sujetosProcesalesFiltrados
      const nuevoRegistro = {
        ...sujetoSeleccionado,
        delito: delitoTexto,
        idDelitoEspecifico: idDelitoEspecifico,
        retiroReparacionCivil: this.formRegistro.get('retiroReparacionCivil')
          ?.value,
      };

      // Crear una nueva referencia del array para que Angular detecte el cambio
      this.sujetosProcesalesFiltrados = [
        ...this.sujetosProcesalesFiltrados,
        nuevoRegistro,
      ];
      this.sujetosProcesalesFiltradosOriginal = [
        ...this.sujetosProcesalesFiltradosOriginal,
        nuevoRegistro,
      ];
      this.listaDelitosSelected = [
        ...this.listaDelitosSelected.filter(
          (delito: any) => delito.idDelitoEspecifico !== idDelitoEspecifico
          // (delito: any) => !delitoTexto.includes(delito.noDelitoEspecifico)
        ),
      ];
      const totalDelitosSujeto = this.listaDelitosSelected.length;
      if (totalDelitosSujeto === 0) {
        this.formRegistro.get('sujetoProcesalSelected')?.reset();
        this.sujetosProcesales = [
          ...this.sujetosProcesales.filter(
            (sujeto) => sujeto.idSujetoCaso !== sujetoSeleccionado.idSujetoCaso
          ),
        ];
      }
      // Calcular la página donde quedó el nuevo registro
      const total = this.sujetosProcesalesFiltradosOriginal.length;
      const pageSize = this.query.limit;
      this.query.page = Math.ceil(total / pageSize);

      // Actualizar la paginación para mostrar la página correcta
      this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
      this.itemPaginado.data.total = this.totalSujetosProcesales = total;
      this.actualizarPaginaRegistros();
      this.formRegistro.get('listaDelitos')?.reset();
      this.formRegistro.get('retiroReparacionCivil')?.reset();
      // this.formRegistro.get('sujetoProcesal')?.reset();
      this.habilitarGuardar(this.formularioValidoGuardar());
      //  this.formularioValido;
    }
  }

  protected eliminarSujetoProcesalDeTabla(item: any, index: number): void {
    // Obtener el registro a eliminar
    const registroEliminado = this.sujetosProcesalesFiltrados[index];
    const data: AutoSobreSeimientoAdd = {
      retiroReparacionCivil: registroEliminado.retiroReparacionCivil
        ? '1'
        : '0',
      idActoTramiteCaso: this.idActoTramiteCaso,
      idSujetoCaso: registroEliminado.idSujetoCaso,
      idDelito: registroEliminado.idDelitoEspecifico,
      idTipoParteSujeto: registroEliminado.idTipoParteSujeto,
      flagAgregarDelito: 0, // Cambiar a 1 para agregar el delito
      flConsentido: '0',
    };

    this.agregarEliminarSujetosDelitos(data);

    const idSujetoCasoEleminado =
      this.formRegistro.get('sujetoProcesal')?.value;

    // Devolver los delitos del registro eliminado a la lista original
    const sujetoExistente = this.sujetosProcesales.find(
      (sujeto) => sujeto.idSujetoCaso === registroEliminado.idSujetoCaso
    );
    const delitoNombreEliminado = registroEliminado.delito;
    delete registroEliminado.delito;
    if (sujetoExistente) {
      // Si el sujeto ya existe, agregar el delito eliminado a su lista de delitos

      // Devolver los delitos del registro eliminado a la lista original
      if (registroEliminado.idSujetoCaso == idSujetoCasoEleminado) {
        this.listaDelitosSelected = [
          ...this.listaDelitosSelected,
          {
            noDelitoEspecifico: delitoNombreEliminado,
            idDelitoEspecifico: registroEliminado.idDelitoEspecifico,
            idActoTramiteDelitoSujeto:
              registroEliminado.idActoTramiteDelitoSujeto ?? '0',
            idActoTramiteSujeto: registroEliminado.idActoTramiteSujeto,
            retiroReparacionCivil: registroEliminado.retiroReparacionCivil,
            flConsentido: registroEliminado.flConsentido ?? '0',
            flRechazado: registroEliminado.flRechazado ?? '0',
          },
        ];
      } else {
        sujetoExistente.delitos = [
          ...(sujetoExistente.delitos || []),
          {
            noDelitoEspecifico: delitoNombreEliminado,
            idDelitoEspecifico: registroEliminado.idDelitoEspecifico,
            idActoTramiteDelitoSujeto:
              registroEliminado.idActoTramiteDelitoSujeto ?? '0',
            idActoTramiteSujeto: registroEliminado.idActoTramiteSujeto,
            retiroReparacionCivil: registroEliminado.retiroReparacionCivil,
            flConsentido: registroEliminado.flConsentido ?? '0',
            flRechazado: registroEliminado.flRechazado ?? '0',
            // agrega aquí otras propiedades necesarias
          },
        ];
      }
    } else {
      // Si no existe, agregar el sujeto procesal con el delito eliminado
      delete registroEliminado.delitos;
      this.listaDelitosSelected = [
        ...this.listaDelitosSelected,
        {
          noDelitoEspecifico: delitoNombreEliminado,
          idDelitoEspecifico: registroEliminado.idDelitoEspecifico,
          idActoTramiteDelitoSujeto:
            registroEliminado.idActoTramiteDelitoSujeto ?? '0',
          idActoTramiteSujeto: registroEliminado.idActoTramiteSujeto,
          retiroReparacionCivil: registroEliminado.retiroReparacionCivil,
          flConsentido: registroEliminado.flConsentido ?? '0',
          flRechazado: registroEliminado.flRechazado ?? '0',
        },
      ];
      this.sujetosProcesales = [
        ...this.sujetosProcesales,
        {
          ...registroEliminado,
          delitos: [
            {
              noDelitoEspecifico: delitoNombreEliminado,
              idDelitoEspecifico: registroEliminado.idDelitoEspecifico,
              idActoTramiteDelitoSujeto:
                registroEliminado.idActoTramiteDelitoSujeto ?? '0',
              idActoTramiteSujeto: registroEliminado.idActoTramiteSujeto,
              retiroReparacionCivil: registroEliminado.retiroReparacionCivil,
              flConsentido: registroEliminado.flConsentido ?? '0',
              flRechazado: registroEliminado.flRechazado ?? '0',

              // agrega aquí otras propiedades necesarias
            },
          ],
        },
      ];
    }

    // Eliminar el registro de la tabla
    this.sujetosProcesalesFiltrados = this.sujetosProcesalesFiltrados.filter(
      (_, i) => i !== index
    );

    this.sujetosProcesalesFiltradosOriginal =
      this.sujetosProcesalesFiltradosOriginal.filter(
        (item: any) =>
          item.idActoTramiteSujeto !== registroEliminado.idActoTramiteSujeto ||
          item.idDelitoEspecifico !== registroEliminado.idDelitoEspecifico
      );

    this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
    this.itemPaginado.data.total = this.totalSujetosProcesales =
      this.sujetosProcesalesFiltradosOriginal.length;
    // --- Lógica para saltar a la página anterior si la actual queda vacía ---
    const start = (this.query.page - 1) * this.query.limit;
    if (
      this.sujetosProcesalesFiltradosOriginal.length > 0 &&
      start >= this.sujetosProcesalesFiltradosOriginal.length &&
      this.query.page > 1
    ) {
      this.query.page--;
    }
    this.actualizarPaginaRegistros();

    this.habilitarGuardar(this.formularioValidoGuardar());
    // this.modalDialogService.success('Éxito', 'Sujeto procesal eliminado correctamente.', 'Aceptar');
  }
protected submit() {
  const datos = this.formRegistro.getRawValue();
  if (
    datos.tipoSobreseimiento === 1464 &&
    this.sujetosProcesales.length == 0
  ) {
    this.modalDialogService.error(
      'Error',
      'El formulario no es válido. Usted ha seleccionado y agregado todos los Sujetos y delitos Por favor, el tipo de Sobreseimiento es Total',
      'Aceptar'
    );
    return;
  }

  // Consulta el mensaje antes de mostrar el modal de confirmación
  this.autoSobreseimientoDefinitivoService
    .obtenerMensajeConsentido(this.idActoTramiteCaso)
    .subscribe((resp: any) => {
      if(resp.code && resp.code !== '0') {
        this.modalDialogService.error(
          'Error',
          resp.message || 'Ocurrió un error al obtener el mensaje de consentimiento.',
          'Aceptar'
        );
        return;
      }
      let mensajeExtra=' ¿Está seguro de realizar la siguiente acción?';
       if (resp?.message && resp.message !== '') {
        mensajeExtra = `<br><br>${resp.message}`;
      }
      let mensajeModal =
        `A continuación, se procederá a <b>crear el trámite</b> de  <b>resolución -  auto que declara consentido y dispone el archivo definitivo</b>.`+ mensajeExtra;

      this.modalDialogService
        .warning(
          '',
          mensajeModal,
          'Continuar',
          true,
          'Cancelar'
        )
        .subscribe((respuesta: string) => {
          if (respuesta === 'confirmado') {
            this.suscripciones.push(
              this.autoSobreseimientoDefinitivoService
                .guardarFormulario({
                  idActoTramiteCaso: this.idActoTramiteCaso,
                  ...datos,
                })
                .subscribe({
                  next: (resp) => {
                    this.botonesDisabled = true;
                    this.formRegistro.disable();
                    this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
                    this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
                    this.modalDialogService.success(
                      'Éxito',
                      'Se ha registrado correctamente la información de la Resolución - auto que declaca consentido  y dispone el archivo definitivo. '   ,
                      'Aceptar'
                    );
                  },
                  error: () => {
                    this.modalDialogService.error(
                      'Error',
                      'Se ha producido un error al intentar registrar la información de la Resolución - auto que declaca consentido  y dispone el archivo definitivo',
                      'Ok'
                    );
                  },
                })
            );
          }
        });
    });
}
  validarTodosDelitosSeleccionados(): boolean {
    return true;
  }
  guardarFormulario(): Observable<any> {
    const datos = this.formRegistro.getRawValue();
    if (
      datos.tipoSobreseimiento === 1464 &&
      this.sujetosProcesales.length == 0
    ) {
      this.modalDialogService.error(
        'Error',
        'El formulario no es válido. Usted ha seleccionado y agregado todos los Sujetos y delitos Por favor, el tipo de Sobreseimiento es Total',
        'Aceptar'
      );
      return of(null);
    }
    return defer(() =>
      this.modalDialogService
        .warning(
          'Confirmar Guardar Tramite',
          `<b>¿Está seguro que desea guardar?</b>.
          `,
          'Continuar',
          true,
          'Cancelar'
        )
        .pipe(
          switchMap((resp) => {
            if (resp === 'cancelado') {
              this.tramiteService.formularioEditado = true;
              return of(null); // o throwError si quieres cortar el flujo
            } else {
              this.tramiteService.formularioEditado = false;
              return this.autoSobreseimientoDefinitivoService.guardarFormulario(
                {
                  idActoTramiteCaso: this.idActoTramiteCaso,
                  ...datos,
                }
              );
            }
          }),
          catchError((error) => {
            this.modalDialogService.error(
              'Pronunciamiento',
              error?.error?.message && error.status === 422
                ? error.error.message
                : 'Ocurrió un error al intentar guardar los datos.',
              'Aceptar'
            );
            return throwError(
              () =>
                new Error(
                  'Ocurrió un error al intentar guardar la disposición. Por favor intente de nuevo'
                )
            );
          })
        )
    );
  }

  private obtenerDatosFormulario(): void {
    this.suscripciones.push(
      this.autoSobreseimientoDefinitivoService
        .obtenerDatosFormulario(this.idActoTramiteCaso)
        .subscribe({
          next: (data) => {
            this.tipoSobreseimientoPadre = data.tipoSobreseimientoPadre;
            this.formRegistro.patchValue({
              fechaNotificacion: data.fechaNotificacion,
              tipoSobreseimiento: data.tipoSobreseimiento,
              resuelve: data.resuelve,
              observacion: data.observacion,
              sujetosProcesalesFiltrados: data.sujetosProcesalesFiltrados,
            });
            this.habilitarGuardar(this.formularioValidoGuardar());
          },
          error: (err) => {
            console.error('Error al obtener el formulario:', err);
          },
        })
    );
  }
}
