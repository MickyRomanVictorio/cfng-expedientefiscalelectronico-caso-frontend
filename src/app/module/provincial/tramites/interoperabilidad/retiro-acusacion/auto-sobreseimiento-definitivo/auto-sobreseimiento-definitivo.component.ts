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
import { MensajeNotificacionService } from '@core/services/shared/mensaje.service';
@Component({
  selector: 'app-auto-sobreseimiento-definitivo',
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
  templateUrl: './auto-sobreseimiento-definitivo.component.html',
  providers: [DialogService, DatePipe, NgxCfngCoreModalDialogService],
})
export class AutoSobreseimientoDefinitivoComponent implements OnInit {
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
  protected esSobreseimientoTipoParcial: boolean = false;
  protected botonesDisabled: boolean = false;
  protected listaTipoSobreseimiento: { id: number; nombre: string }[] = [
    { id: 1464, nombre: 'Parcial' },
    { id: 1463, nombre: 'Total' },
  ];
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

  protected tituloTootip: string =
    'Registro de acusados que presentan retiro de acusación aprobados por el juez penal:';
  protected referenciaModal!: DynamicDialogRef;

  constructor(
    protected iconAsset: IconAsset,
    protected fb: FormBuilder,
    protected datePipe: DatePipe,
    protected dialogService: DialogService,
    protected tramiteService: TramiteService,
    private readonly gestionCasoService: GestionCasoService,
    protected readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly autoSobreseimientoDefinitivoService: AutoSobreseimientoDefinitivoService,
    // private mensajeService: MensajeNotificacionService
  ) {
    this.formRegistro = this.fb.group({
      fechaNotificacion: ['', [Validators.required]],
      sujetoProcesal: ['', null],
      sujetoProcesalSelected: ['', null],
      tipoSobreseimiento: ['', [Validators.required]],
      resuelve: ['', [Validators.maxLength(200), Validators.required]],
      observacion: ['', [Validators.maxLength(200)]],
      listaDelitos: [''],
      retiroReparacionCivil: [false, null],
    });
  }

  ngOnInit() {
    this.caso = this.gestionCasoService.casoActual;
    this.tramiteService.verIniciarTramite = false;
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
      this.habilitarGuardar(
        this.formularioValidoGuardar(
          this.formRegistro.get('tipoSobreseimiento')?.value
        )
      );
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
  actualizarPaginaRegistros() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.query= { ...this.query};
    this.sujetosProcesalesFiltrados = this.sujetosProcesalesFiltradosOriginal.slice(start, end);
  }
  onPaginate(evento: any) {
   
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.actualizarPaginaRegistros();
    // this.updatePagedItems();
  }
  formularioValidoGuardar(tipo: number): boolean {
    let validarTipoSobreseimiento =
      tipo === 1464 && this.sujetosProcesalesFiltrados.length > 0;
    if (tipo === 1463 && this.sujetosProcesales.length == 0) {
      validarTipoSobreseimiento = true;
    }

    return this.formRegistro.valid && validarTipoSobreseimiento;
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
  protected activarFormulario(event: any) {

    this.tramiteService.verIniciarTramite = event.checked;
  }
  get estadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  get permitirGuardar(): boolean {
    return this.formularioValidoGuardar(
      this.formRegistro.get('tipoSobreseimiento')?.value
    );
    //return this.idEstadoTramite === ESTADO_REGISTRO.PENDIENTE_COMPLETAR;
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
      return (
        sujeto.delitos &&
        sujeto.delitos.some(
          (delito: any) => delito.idActoTramiteDelitoSujeto == '0'
        )
      );
    });
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
            .map((sujeto: any) => {
              // Obtener los idDelitoEspecifico con flConsentido === '1'
              const delitosConsentidos = sujeto.delitos
                .filter((delito: any) => delito.flRechazado === '1' || delito.idActoTramiteDelitoSujeto !== '0')
                .map((delito: any) => delito.idDelitoEspecifico);

              return {
                ...sujeto,
                delitos: sujeto.delitos.filter(
                  (delito: any) =>
                    delito.idActoTramiteDelitoSujeto == '0'
                    && !delitosConsentidos.includes(delito.idDelitoEspecifico) // Excluir delitos ya rechazado
                ),
              };
            }).filter((sujeto: any) => sujeto.delitos.length > 0)
            .reduce((acc: any[], current: any) => {
              const existingSujeto = acc.find(s => s.idSujetoCaso === current.idSujetoCaso);

              if (existingSujeto) {
                // Combinar delitos evitando duplicados (usando idActoTramiteDelitoSujeto)
                const delitosUnicos = [...existingSujeto.delitos, ...current.delitos]
                  .filter((delito, index, self) =>
                    index === self.findIndex(d =>
                      d.idActoTramiteDelitoSujeto === delito.idActoTramiteDelitoSujeto
                    )
                  );

                existingSujeto.delitos = delitosUnicos;
              } else {
                // Si no existe, agregamos el sujeto tal cual
                acc.push(current);
              }

              return acc;
            }, []);
          this.totalDelitosCaso = result.reduce((acc: number, sujeto: any) => {
            return (
              acc +
              sujeto.delitos.filter(
                (delito: any) => delito.idDelitoEspecifico > 0
              ).length
            );
          }, 0);
          this.sujetosProcesalesFiltrados = result.filter(
            (sujeto: any) => sujeto.idActoTramiteCaso == this.idActoTramiteCaso
          );
          // Filtrar los delitos de los sujetos procesales
          this.sujetosProcesalesFiltrados = this.sujetosProcesalesFiltrados.flatMap((sujeto: any) => {
            return sujeto.delitos
              .filter((delito: any) =>
                delito.idActoTramiteSujeto === sujeto.idActoTramiteSujeto &&
                delito.idActoTramiteDelitoSujeto !== '0' &&
                delito.flConsentido === '0' &&
                delito.flRechazado === '0'// &&
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
          this.sujetosProcesalesFiltradosOriginal = this.sujetosProcesalesFiltrados;
          this.actualizarPaginaRegistros();
          this.habilitarGuardar(
            this.formularioValidoGuardar(
              this.formRegistro.get('tipoSobreseimiento')?.value
            )
          );
        })
    );
  }

  agregarEliminarSujetosDelitos(data: AutoSobreSeimientoAdd) {
    const eliminarDelito = data.flagAgregarDelito === 0;
    this.suscripciones.push(
      this.autoSobreseimientoDefinitivoService
        .agregarEliminarSujetosDelitos(this.idActoTramiteCaso, data)
        .subscribe({
          next: (data) => {
            this.actualizarPaginaRegistros();
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

  protected onSelectTipoSobreseimiento(event: any): void {
    if (event.value === 1464) {
      this.esSobreseimientoTipoParcial = true;
    }
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
       this.sujetosProcesalesFiltradosOriginal = [...this.sujetosProcesalesFiltradosOriginal, nuevoRegistro];

      this.listaDelitosSelected = [
        ...this.listaDelitosSelected.filter(
          (delito: any) => delito.idDelitoEspecifico !== idDelitoEspecifico
          // (delito: any) => !delitoTexto.includes(delito.noDelitoEspecifico)
        ),
      ];
      const totalDelitosSujeto = this.listaDelitosSelected.length;
      if (totalDelitosSujeto === 0) {
        // this.formRegistro.get('sujetoProcesal')?.reset();
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
      /*        this.actualizarPaginaRegistros(
              this.sujetosProcesalesFiltrados,
              true
            ); */
      this.formRegistro.get('listaDelitos')?.reset();
      this.formRegistro.get('retiroReparacionCivil')?.reset();
      this.habilitarGuardar(
        this.formularioValidoGuardar(
          this.formRegistro.get('tipoSobreseimiento')?.value
        )
      );
      //  this.formularioValido;
    }
  }

  protected eliminarSujetoProcesalDeTabla(item: any, index: number): void {
    if (this.botonesDisabled) {
      this.modalDialogService.error(
        'Error',
        'No se puede eliminar el sujeto procesal porque el trámite está en estado recibido.',
        'Aceptar'
      );
      return;
    }

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
    };

    this.agregarEliminarSujetosDelitos(data);

    const idSujetoCasoEleminado =
      this.formRegistro.get('sujetoProcesal')?.value;

    // Devolver los delitos del registro eliminado a la lista original
    const sujetoExistente = this.sujetosProcesales.find(
      (sujeto) =>
        sujeto.idSujetoCaso === registroEliminado.idSujetoCaso
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
            idActoTramiteDelitoSujeto: registroEliminado.idActoTramiteDelitoSujeto?? '0',
            idActoTramiteSujeto: registroEliminado.idActoTramiteSujeto,
            retiroReparacionCivil: registroEliminado.retiroReparacionCivil,
            flConsentido: registroEliminado.flConsentido?? '0',
            flRechazado: registroEliminado.flRechazado?? '0',
          },
        ];
      } else {
        sujetoExistente.delitos = [
          ...(sujetoExistente.delitos || []),
          {
            noDelitoEspecifico: delitoNombreEliminado,
            idDelitoEspecifico: registroEliminado.idDelitoEspecifico,
            idActoTramiteDelitoSujeto: registroEliminado.idActoTramiteDelitoSujeto?? '0',
            idActoTramiteSujeto: registroEliminado.idActoTramiteSujeto,
            retiroReparacionCivil: registroEliminado.retiroReparacionCivil,
            flConsentido: registroEliminado.flConsentido?? '0',
            flRechazado: registroEliminado.flRechazado?? '0',
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
            idActoTramiteDelitoSujeto: registroEliminado.idActoTramiteDelitoSujeto?? '0',
            idActoTramiteSujeto: registroEliminado.idActoTramiteSujeto,
            retiroReparacionCivil: registroEliminado.retiroReparacionCivil,
            flConsentido: registroEliminado.flConsentido?? '0',
            flRechazado: registroEliminado.flRechazado?? '0',
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
              idActoTramiteDelitoSujeto: registroEliminado.idActoTramiteDelitoSujeto?? '0',
              idActoTramiteSujeto: registroEliminado.idActoTramiteSujeto,
              retiroReparacionCivil: registroEliminado.retiroReparacionCivil,
              flConsentido: registroEliminado.flConsentido?? '0',
              flRechazado: registroEliminado.flRechazado?? '0',

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
    this.sujetosProcesalesFiltradosOriginal = this.sujetosProcesalesFiltradosOriginal.filter(
     (item: any) => item.idActoTramiteSujeto !== registroEliminado.idActoTramiteSujeto || item.idDelitoEspecifico !== registroEliminado.idDelitoEspecifico
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

    const tipoSobreseimiento =
      this.formRegistro.get('tipoSobreseimiento')?.value;
    this.habilitarGuardar(this.formularioValidoGuardar(tipoSobreseimiento));
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
    this.modalDialogService
      .warning(
        '',
        `A continuación, se procederá a <b>crear el trámite</b> de  <b>resolución - auto de sobreseimiento definitivo</b>. ¿Está seguro de realizar la siguiente acción?`,
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
                  //   this.alertaDocumentoGuardado(resp);
                  this.formRegistro.disable();
                  this.botonesDisabled = true;
                  this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
                  this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
                  this.modalDialogService.success(
                    'Éxito',
                    'Se ha registrado correctamente la información de la Resolución - auto Sobreseimiento Definitivo',
                    'Aceptar'
                  );
                },
                error: () => {
                  this.modalDialogService.error(
                    'Error',
                    'Se ha producido un error al intentar registrar la información de la Resolución - auto que resuelve el requerimiento de incoación de proceso inmediato',
                    'Ok'
                  );
                },
              })
          );
        }
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
                  faltaFirma: '1',
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
            this.formRegistro.patchValue({
              fechaNotificacion: data.fechaNotificacion,
              tipoSobreseimiento: data.tipoSobreseimiento,
              resuelve: data.resuelve,
              observacion: data.observacion,
              sujetosProcesalesFiltrados: data.sujetosProcesalesFiltrados,
            });
            this.habilitarGuardar(
              this.formularioValidoGuardar(data.tipoSobreseimiento)
            );
          },
          error: (err) => {
            console.error('Error al obtener el formulario:', err);
          },
        })
    );
  }
}
