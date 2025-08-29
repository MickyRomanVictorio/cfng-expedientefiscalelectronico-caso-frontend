import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
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
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { CmpLibModule } from 'dist/cmp-lib';
import {
  ESTADO_REGISTRO,
  getDateFromString,
  IconAsset,
  IconUtil,
  RESPUESTA_MODAL,
  ValidationModule,
} from 'dist/ngx-cfng-core-lib';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessagesModule } from 'primeng/messages';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import {
  catchError,
  firstValueFrom,
  map,
  Observable,
  Subscription,
  tap,
  throwError,
} from 'rxjs';
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import { capitalizedFirstWord } from '@core/utils/string';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { GestionAudiosComponent } from '@core/components/modals/gestion-audios/gestion-audios.component';
import { ID_TIPO_ORIGEN } from '@core/types/tipo-origen.type';
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { DataPena } from '@core/interfaces/reusables/registrar-penas/data-pena.interface';
import { RegistrarPenasComponent } from '@core/components/reutilizable/registrar-penas/registrar-penas.component';
import { TIPO_ACCION } from '@core/types/tipo-accion.type';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { MensajeGenericoComponent } from '@core/components/mensajes/mensaje-generico/mensaje-generico.component';
import { RegistrarReparacionCivilComponent } from '@core/components/reutilizable/registrar-reparacion-civil/registrar-reparacion-civil.component';
import { RegistrarPenasService } from '@core/services/reusables/otros/registrar-penas.service';
import { ID_N_TIPO_SENTENCIA } from '@core/types/tipo-sentencia';
import { DialogModule } from 'primeng/dialog';
import { ResolucionAutoResuelveTerminacionAnticipadaService } from '@core/services/provincial/tramites/comun/preparatoria/resolucion-auto-resuelve-ta.service';
import {
  ID_N_RESULTADO_TA,
  Penas,
  ResolucionAutoResuelveTA,
} from '@core/interfaces/provincial/tramites/comun/preparatoria/resolucion-auto-resuelve-ta';
import { EncabezadoModalComponent } from '@core/components/modals/encabezado-modal/encabezado-modal.component';
import { ResultadoAudienciaTerminacionAnticipadaModalComponent } from '@core/components/modals/resultado-audiencia-terminacion-anticipada-modal/resultado-audiencia-terminacion-anticipada-modal.component';
import { GenericResponse } from '@core/interfaces/comunes/GenericResponse';

@Component({
  selector: 'app-resolucion-requerimiento-terminacion-anticipada',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MessagesModule,
    CalendarModule,
    FormsModule,
    RadioButtonModule,
    CmpLibModule,
    CheckboxModule,
    DateMaskModule,
    TabViewModule,
    TableModule,
    DialogModule,
    MensajeCompletarInformacionComponent,
    MensajeGenericoComponent,
    MensajeInteroperabilidadPjComponent,
    ValidationModule,
    RegistrarPenasComponent,
    RegistrarReparacionCivilComponent,
    EncabezadoModalComponent
  ],
  providers: [DatePipe, { provide: DynamicDialogConfig, useValue: {} }, NgxCfngCoreModalDialogService, DialogService],
  templateUrl:
    './resolucion-requerimiento-terminacion-anticipada.component.html',
  styleUrl: './resolucion-requerimiento-terminacion-anticipada.component.scss',
})
export class ResolucionRequerimientoTerminacionAnticipadaComponent
  implements OnDestroy, OnInit {
  @Input() idCaso!: string;
  @Input() idEstadoTramite!: number;
  @Input() idActoTramiteCaso: string = '';
  @Input() numeroCaso!: string;
  @Input() validacionTramite!: ValidacionTramite;
  @Input() tramiteSeleccionado!: TramiteProcesal | null;
  @Input() idEtapa!: string;
  @Input() tramiteEnModoEdicion: boolean = false;

  @Output() peticionParaEjecutar = new EventEmitter<() => any>();

  public suscripciones: Subscription[] = [];
  protected formRegistro: FormGroup;
  protected formularioIncompleto: boolean = false;
  protected verFormulario: boolean = false;
  protected fechaActual: Date = new Date();
  protected fechaIngreso: Date | null = null;
  protected listaPenas: Penas[] = [];
  protected cargandoDatos: boolean = true;
  protected mostrarModalVerEditar: boolean = false;
  protected idActoTramiteDelitoSujeto: string = '';

  protected idPena: string = '';
  protected dataPena!: DataPena;

  protected tipoSentencia: number = ID_N_TIPO_SENTENCIA.CONDENATORIA;
  protected accionPena: TIPO_ACCION = TIPO_ACCION.CREAR;
  protected ACCION_CREAR = TIPO_ACCION.CREAR;
  protected ACCION_VER = TIPO_ACCION.VISUALIZAR;
  protected ACCION_EDITAR = TIPO_ACCION.EDITAR;
  protected FUNDADO = ID_N_RESULTADO_TA.FUNDADO;
  protected FUNDADO_PARTE = ID_N_RESULTADO_TA.FUNDADO_PARTE;
  protected INFUNDADO = ID_N_RESULTADO_TA.INFUNDADO;

  protected mostrarReparacionCivil: boolean = false;

  protected penasCompleto: boolean = false;
  protected reparacionCivilCompleto: boolean = false;

  protected audiosAudienciaCompletos: boolean = false;
  protected resultadosAudienciaCompletos: boolean = false;

  protected cantidadPenas: number = 0;
  protected cantidadReparaciones: number = 0;
  protected cantidadResultados: number = 0;
  protected cantidadAudios: number = 0;

  protected resultado: number = 0;

  protected modoLectura: boolean = false;

  protected referenciaModal!: DynamicDialogRef;
  protected formularioCambio: boolean = false;

  protected fb = inject(FormBuilder);
  protected iconAsset = inject(IconAsset);
  protected iconUtil = inject(IconUtil);

  protected readonly tramiteService = inject(TramiteService);
  private readonly dialogService = inject(DialogService);
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly firmaIndividualService = inject(FirmaIndividualService);
  private readonly gestionCasoService = inject(GestionCasoService);
  private readonly penasService = inject(RegistrarPenasService);
  private readonly resolucionAutoResuelveService = inject(
    ResolucionAutoResuelveTerminacionAnticipadaService
  );
  protected readonly datePipe = inject(DatePipe);

  constructor() {
    this.formRegistro = this.fb.group({
      fechaNotificacion: ['', [Validators.required]],
      resultado: ['', [Validators.required]],
      observaciones: ['', [Validators.maxLength(200)]],
    });
  }

  ngOnInit(): void {

    const fechaIngresoStr = this.gestionCasoService.expedienteActual.fechaHecho;
    this.fechaIngreso = getDateFromString(fechaIngresoStr);

    this.tramiteService.verIniciarTramite = false;

    this.dataPena = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      idCaso: this.idCaso,
    };

    if (this.validacionTramite.cantidadTramiteSeleccionado !== 0) {
      this.verFormulario = true;
      this.obtenerInformacion();
    } else {
      this.formularioEditado(true);
    }


    this.formRegistro.valueChanges.subscribe(() => {
      if (!this.cargandoDatos) {
        this.formularioIncompleto = !this.elFormularioEstaCompleto();
        this.formularioEditado(true);
        this.habilitarGuardar(true);
        this.formularioCambio = true;
      }
    });

    this.suscripciones.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.formRegistro.disable();
            this.modoLectura = true;
          }
        }
      )
    )

    //Se ejecuta al Guardar Tramite cuando es generado desde EFE
    this.peticionParaEjecutar.emit(() => this.guardarFormulario());

    if (!this.estadoPendienteCompletar && !this.estadoBorrador) {
      this.formRegistro.disable();
      this.modoLectura = true
    }

  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite);
  }

  protected activarFormulario(event: boolean) {
    this.tramiteService.verIniciarTramite = event;
  }
  protected counterReportChar(): number {
    return this.formRegistro.get('observaciones')!.value !== null
      ? this.formRegistro.get('observaciones')!.value.length
      : 0;
  }

  get tramiteOriginadoEnEfe(): boolean {
    return (
      this.validacionTramite.tipoOrigenTramiteSeleccionado ===
      ID_TIPO_ORIGEN.EFE
    );
  }

  get estadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  get estadoBorrador(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.BORRADOR;
  }

  get estadoPendienteCompletar(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.PENDIENTE_COMPLETAR;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion
      ? this.tramiteEnModoEdicion
      : this.esPosibleEditarPorEstado;
  }
  get esPosibleEditarPorEstado(): boolean {
    return !this.tramiteEstadoRecibido;
  }
  get tramiteEstadoRecibido(): boolean {
    return this.validacionTramite.idEstadoRegistro === ESTADO_REGISTRO.RECIBIDO;
  }

  get activarBotonResultadosAudiencia(): boolean {
    return (this.formRegistro.get('resultado')?.value !== this.INFUNDADO && this.penasCompleto && this.reparacionCivilCompleto) || this.formRegistro.get('resultado')?.value === this.INFUNDADO;
  }

  protected obtenerInformacion() {
    this.suscripciones.push(
      this.resolucionAutoResuelveService
        .obtenerResolucionAutoResuelve(this.idActoTramiteCaso)
        .subscribe({
          next: async (resp) => {
            if (resp?.code === 0) {
              this.cargandoDatos = true;

              this.formRegistro.get('resultado')?.setValue(resp.data.resultado);
              this.resultado = resp.data.resultado;

              this.listarPenas();

              await this.validarPenas();
              await this.validarReparacionCivil();
              await this.validarAudiosAudiencia();
              await this.validarResultadosAudiencia();

              if (resp.data.fechaNotificacion !== null) {
                const fechaISO = resp.data.fechaNotificacion.replace(' ', 'T');
                this.formRegistro.get('fechaNotificacion')?.setValue(new Date(fechaISO));
              }

              this.formRegistro.get('observaciones')?.setValue(resp.data.observaciones);

              this.formularioIncompleto = resp.data.formularioIncompleto;

              const formularioIncompletoValid = !this.elFormularioEstaCompleto()

              const requiereGuardado = this.formularioIncompleto || this.formularioIncompleto !== formularioIncompletoValid;
              this.formularioEditado(requiereGuardado);
              this.habilitarGuardar(requiereGuardado);

              this.cargandoDatos = false;
            }
          },
          error: () => {
            this.modalDialogService.error(
              'ERROR',
              'Error al intentar traer la información de la ' +
              this.nombreTramite(),
              'Aceptar'
            );
          },
        })
    );
  }

  protected resultadoOnchange() {

    if (this.cantidadPenas > 0 || this.cantidadReparaciones > 0 || this.cantidadResultados > 0 || this.cantidadAudios > 0) {
      const dialog = this.modalDialogService.warning(
        'CONFIRMAR CAMBIO DE RESULTADO',
        'Al cambiar de resultado se perderá la información ingresada de la audiencia. ¿Desea continuar?',
        'Aceptar',
        true
      );

      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.resolucionAutoResuelveService.reiniciarFormulario(this.idActoTramiteCaso).subscribe({
              next: async (resp: GenericResponse) => {
                  if(resp.code === 200){
                    this.listarPenas();

                    await this.validarPenas();
                    await this.validarReparacionCivil();
                    await this.validarResultadosAudiencia();
                    await this.validarAudiosAudiencia();
                  }else{
                    this.formRegistro.get('resultado')?.setValue(this.resultado);
                  }                  
              },
              error: ()=>{
                this.modalDialogService.error(
                  'Error',
                  'Se ha producido un error al intentar reiniciar la información de la Resolución - auto que resuelve el requerimiento',
                  'Ok'
                );
              }
            })
          }else{
            this.formRegistro.get('resultado')?.setValue(this.resultado);
          }
        },
      })
    }

  }

  private verOcultarBotonFirmar() {
    console.log("OCULTAR BOTONES")
    this.formularioIncompleto = !this.elFormularioEstaCompleto();
    if (this.formularioIncompleto) {
      this.formularioEditado(true);
      this.habilitarGuardar(true);
    } else {
      this.formularioEditado(!!this.formularioCambio);
    }
  }

  protected async respuestaFormularioPena(data: any) {

    if (data?.respuesta) {
      this.formularioCambio = true;
      this.listarPenas();
      await this.validarPenas()
      this.verOcultarBotonFirmar();
    }
    if (
      this.accionPena === TIPO_ACCION.VISUALIZAR ||
      this.accionPena === TIPO_ACCION.EDITAR
    ) {
      this.mostrarModalVerEditar = false;
    }
  }

  private listarPenas(): void {
    this.suscripciones.push(
      this.penasService.listarPenas(this.idActoTramiteCaso).subscribe({
        next: (resp: Penas[]) => {
          this.listaPenas = resp;
          this.listaPenas.every(pena => pena.idActoTramiteDelitoSujeto && pena.idActoTramiteDelitoSujeto !== null)
        },
      })
    );
  }

  protected eliminarPena(pena: any): void {
    const dialog = this.modalDialogService.question(
      'Eliminar Pena',
      'A continuación, se eliminará el registro de pena de ' +
      pena.sujeto +
      ' ¿Está seguro de realizar la siguiente acción?',
      'Aceptar',
      'Cancelar'
    );

    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.suscripciones.push(
            this.penasService
              .eliminarPena(pena.idActoTramiteDelitoSujeto, pena.idPena)
              .subscribe({
                next: async (resp) => {
                  if (resp?.code === '0') {
                    this.formularioCambio = true;
                    this.modalDialogService.info(
                      'Éxito',
                      'Pena eliminada correctamente',
                      'Aceptar'
                    );
                    this.listarPenas();
                    await this.validarPenas();
                    this.verOcultarBotonFirmar();
                  }
                },
                error: (error) => {
                  this.modalDialogService.error(
                    'ERROR',
                    'Error al intentar eliminar la pena',
                    'Aceptar'
                  );
                },
              })
          );
        }
      },
    });
  }


  private async validarPenas(): Promise<void> {
    this.penasCompleto = false;

    try {
      const resp: GenericResponse = await firstValueFrom(
        this.resolucionAutoResuelveService.validarPenas(
          this.idActoTramiteCaso,
          this.formRegistro.get('resultado')?.value
        )
      );

      this.cantidadPenas = resp.id;
      if (resp.code === 0) {
        this.penasCompleto = true;
      }
    } catch (error) {
      console.error('Error validando penas', error);
    }
  }



  protected abrirVerEditarModal(
    idActoTramiteDelitoSujeto: string,
    idPena: string,
    accion: number
  ): void {
    this.mostrarModalVerEditar = true;
    this.accionPena = accion;
    this.idActoTramiteDelitoSujeto = idActoTramiteDelitoSujeto;
    this.idPena = idPena;
  }

  protected alCerrarModalReparacionCivil = async () => {
    this.mostrarReparacionCivil = false;
    this.formularioCambio = true;
    await this.validarReparacionCivil();
    this.verOcultarBotonFirmar();
  }

  protected retornarDataModalResultadoAudiencia(): any {
    const resultado = this.formRegistro.get('resultado')?.value;

    let titulo: string = '';
    let tipo: number = 0;

    switch (resultado) {
      case this.INFUNDADO:
        titulo =
          'RESULTADOS DE AUDIENCIA DE TERMINACIÓN ANTICIPADA: <b>&nbsp;INFUNDADO / IMPROCEDENTE</b>';
        tipo = 3;
        break;
      case this.FUNDADO:
        titulo =
          'RESULTADOS DE AUDIENCIA DE TERMINACIÓN ANTICIPADA: <b>&nbsp;FUNDADO/PROCEDENTE</b>';
        tipo = 1;
        break;
      case this.FUNDADO_PARTE:
        titulo =
          'RESULTADOS DE AUDIENCIA DE TERMINACIÓN ANTICIPADA: <b>&nbsp;FUNDADO EN PARTE/PROCEDENTE EN PARTE</b>';
        tipo = 2;
        break;
    }
    return {
      titulo: titulo,
      tipo: tipo,
      data: {
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        numeroCaso: this.numeroCaso,
        idEstadoTramite: this.idEstadoTramite,
        modoLectura: this.modoLectura
      },
    };
  }

  private async validarReparacionCivil(): Promise<void> {
    this.reparacionCivilCompleto = false;

    try {
      const resp: GenericResponse = await firstValueFrom(
        this.resolucionAutoResuelveService.validarReparacionCivil(
          this.idActoTramiteCaso,
          this.formRegistro.get('resultado')?.value
        )
      );
      this.cantidadReparaciones = resp.id;
      if (resp.code === 0) {
        this.reparacionCivilCompleto = true;
      }
    } catch (error) {
      console.error('Error validando reparación civil', error);
    }
  }

  protected verResultadoAudiencia() {
    this.referenciaModal = this.dialogService.open(
      ResultadoAudienciaTerminacionAnticipadaModalComponent,
      {
        width: '70%',
        showHeader: false,
        contentStyle: { padding: '0', 'border-radius': '15px' },
        data: this.retornarDataModalResultadoAudiencia(),
      }
    );
    this.referenciaModal.onClose.subscribe(() => {
      this.validarResultadosAudiencia();
    });
  }

  private async validarResultadosAudiencia(): Promise<void> {
    this.resultadosAudienciaCompletos = false;

    try {
      const resp: GenericResponse = await firstValueFrom(
        this.resolucionAutoResuelveService.validarResultadoAudiencia(
          this.idActoTramiteCaso,
          this.formRegistro.get('resultado')?.value
        )
      );
      this.cantidadResultados = resp.id;
      if (resp.code === 0) {
        this.resultadosAudienciaCompletos = true;
      }
    } catch (error) {
      console.error('Error validando resultados de audiencia', error);
    }
  }

  protected audiosAudiencia() {
    const ref = this.dialogService.open(GestionAudiosComponent, {
      showHeader: false,
      width: '80%',
      contentStyle: { padding: '0' },
      data: {
        idCaso: this.idCaso,
        tituloModal: 'Audios de la audiencia',
        idActoTramiteCaso: this.idActoTramiteCaso,
        modoLectura: this.modoLectura
      },
    });

    ref.onClose.subscribe(() => {
      this.validarAudiosAudiencia();
    });
  }

  private async validarAudiosAudiencia(): Promise<void> {
    this.audiosAudienciaCompletos = false;

    try {
      const resp: GenericResponse = await firstValueFrom(
        this.resolucionAutoResuelveService.validarAudiosAudiencia(
          this.idActoTramiteCaso
        )
      );
      this.cantidadAudios = resp.id;
      if (resp.code === 0) {
        this.audiosAudienciaCompletos = true;
      }
    } catch (error) {
      console.error('Error validando audios de audiencia', error);
    }
  }

  protected elFormularioEstaCompleto(): boolean {
    if (
      (this.formRegistro.get('resultado')?.value === this.FUNDADO || this.formRegistro.get('resultado')?.value === this.FUNDADO_PARTE)
      && this.formRegistro.valid
      && this.penasCompleto
      && this.reparacionCivilCompleto
    ) {
      return true;
    } else if (
      this.formRegistro.get('resultado')?.value === this.INFUNDADO
      && this.formRegistro.valid
    ) {
      return true;
    } else {
      return false;
    }
  }

  protected guardarFormulario(): Observable<any> {

    this.formularioIncompleto = !this.elFormularioEstaCompleto();
    if(this.formularioIncompleto){
        this.modalDialogService.warning(
        'Cuando el resultado seleccionado es “Fundado/Procedente” o “Fundado en parte/Procedente en parte”, se requiere registrar como mínimo una pena y una reparación civil para cada sujeto procesal',
        'Verifique que cada sujeto procesal tenga asociada al menos una pena y una reparación civil',
        'Aceptar'
      );
      return throwError(() => new Error('Error de validación de campos'));
    }
    let form = this.formRegistro.getRawValue();

    const dataRequest: ResolucionAutoResuelveTA = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: this.datePipe.transform(
        form.fechaNotificacion,
        'yyyy-MM-dd'
      ),
      resultado: form.resultado,
      observaciones: form.observaciones,
      formularioIncompleto: this.formularioIncompleto,
    };

    return this.resolucionAutoResuelveService
      .guardarResolucionAutoResuelve(dataRequest)
      .pipe(
        tap(() => {
          (this.formularioIncompleto) ? this.formularioEditado(true) : this.formularioEditado(false);

          this.modalDialogService.success(
            'Datos guardado correctamente',
            'Se guardaron correctamente los datos para el trámite: <b>' +
            this.nombreTramite() +
            '</b>.',
            'Aceptar'
          );
        }),
        map(() => 'válido'),
        catchError(() => {
          this.modalDialogService.error(
            'Error',
            'No se pudo guardar la información para el trámite: <b>' +
            this.nombreTramite() +
            '</b>.',
            'Aceptar'
          );
          return throwError(() => new Error('Error al guardar'));
        })
      );
  }

  protected submit() {
    let form = this.formRegistro.getRawValue();
    this.formularioIncompleto = !this.elFormularioEstaCompleto();

    const dataRequest: ResolucionAutoResuelveTA = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: this.datePipe.transform(
        form.fechaNotificacion,
        'yyyy-MM-dd'
      ),
      resultado: form.resultado,
      observaciones: form.observaciones,
      formularioIncompleto: this.formularioIncompleto,
    };


    this.suscripciones.push(
      this.resolucionAutoResuelveService
        .guardarResolucionAutoResuelve(dataRequest)
        .subscribe({
          next: (resp) => {
            if (resp.code == 0) {
              this.modalDialogService.success(
                'Datos guardado correctamente',
                'Se guardaron correctamente los datos para el trámite: <b>' +
                this.nombreTramite() +
                '</b>.',
                'Aceptar'
              );
              this.formRegistro.disable();
              this.modoLectura = true;
              this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
              this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
            } else {
              this.modalDialogService.error(
                'Error',
                'Se ha producido un error al intentar registrar la información de la Resolución - auto que resuelve el requerimiento',
                'Ok'
              );
            }
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              'Se ha producido un error al intentar registrar la información de la Resolución - auto que resuelve el requerimiento',
              'Ok'
            );
          },
        })
    );
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
}
