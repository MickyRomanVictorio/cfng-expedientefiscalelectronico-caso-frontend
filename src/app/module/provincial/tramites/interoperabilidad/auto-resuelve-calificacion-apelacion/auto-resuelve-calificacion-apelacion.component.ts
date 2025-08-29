import { NgClass, NgIf } from '@angular/common';
import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { GuardarTramiteProcesalComponent } from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { DateMaskModule } from '@directives/date-mask.module';
import { AlertaData } from '@interfaces/comunes/alert';
import { ConsultaCasosSharedService } from '@services/provincial/consulta-casos/consulta-casos-shared.service';
import { AutoResuelveCalificacionApelacionService } from '@services/provincial/cuadernos-incidentales/auto-resuelve-calificacion-apelacion/auto-resuelve-calificacion-apelacion.service';
import { MensajeNotificacionService } from '@services/shared/mensaje.service';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { Subscription } from 'rxjs';
import { MensajeInteroperabilidadPjComponent } from '@components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { MensajeCompletarInformacionComponent } from '@components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { TramiteProcesal } from '@interfaces/comunes/tramiteProcesal';
import { ESTADO_REGISTRO, IconAsset, RESPUESTA_MODAL } from 'ngx-cfng-core-lib';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import { RegistrarAutoResuelveCalificacionModalComponent } from '@modules/provincial/tramites/interoperabilidad/auto-resuelve-calificacion-apelacion/registrar-auto-resuelve-calificacion-superior/registrar-auto-resuelve-calificacion-modal.component';
import { ExpedienteMaskModule } from '@core/directives/expediente-mask.module';
import { InputTextModule } from 'primeng/inputtext';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { GenericResponse } from '@core/interfaces/comunes/GenericResponse';
import { Router } from '@angular/router';
import { TramiteService } from '@services/provincial/tramites/tramite.service';

@Component({
  selector: 'app-auto-resuelve-calificacion-apelacion',
  standalone: true,
  templateUrl: './auto-resuelve-calificacion-apelacion.component.html',
  imports: [
    MessagesModule,
    CalendarModule,
    DateMaskModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    InputMaskModule,
    DropdownModule,
    InputTextareaModule,
    NgIf,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
    NgxCfngCoreModalDialogModule,
    NgClass,
    ExpedienteMaskModule,
    InputTextModule
  ],
  providers: [DialogService, MensajeNotificacionService],
  styleUrls: ['./auto-resuelve-calificacion-apelacion.component.scss'],
})
export class AutoResuelveCalificacionApelacionComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() idActoTramiteCaso: string = '';
  @Input() idEstadoTramite!: number;
  @Input() numeroCaso: string = '';
  @Input() idActoTramiteProcesalEnlace: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null; //
  @Input() idDocumento: string[] = []; //
  @Input() tramiteEnModoEdicion: boolean = false;

  //TODO validación temporal con uso de id de acto para saber si son a nivel de sujeto
  private idsSujeto: string[] = ['000172'];
  protected razon = new FormControl('', [Validators.required]);
  protected refModal!: DynamicDialogRef;
  private readonly subscriptions: Subscription[] = [];
  protected fiscalias: any[] = [];
  protected maxlengthObservaciones: number = 200;
  protected formulario!: FormGroup;
  protected sujetosProcesales: any[] = [];
  protected tramiteGuardado: boolean = false;
  protected flCheckModal: boolean = false;
  protected selectedSujetos: any = [];
  protected longitudMaximaObservaciones: number = 200;
  protected esPestanaElevada: boolean = false;
  protected esSoloLectura: boolean = false;
  protected nivelApelacion: string = '';
  protected readonly iconAsset = inject(IconAsset);
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  protected flElevacionSuperior: boolean = false;
  private sujetosElevar: any = [];

  constructor(
    private readonly dialogService: DialogService,
    private readonly formBuilder: FormBuilder,
    private readonly tramiteService: TramiteService,
    private readonly autoResuelveCalificacionApelacionService: AutoResuelveCalificacionApelacionService,
    private readonly consultaCasosSharedService: ConsultaCasosSharedService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.formulario = this.formBuilder.group({
      fechaNotificacion: [null, Validators.required],
      nroExpediente: new FormControl(null, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(27),
        Validators.pattern(/^\d{5}-\d{4}-\d-\d{4}-[A-Z]{2}-[A-Z]{2}-\d{2}$/)
      ]),
   //   nroExpediente: [null, Validators.required],
      codFiscaliaSuperior: [null, null],
      observaciones: ['', [Validators.maxLength(this.maxlengthObservaciones)]],
    });
    this.nivelApelacion = this.numeroCaso.endsWith('0') ? 'proceso' : 'sujeto';
    this.obtenerDatosResolucion();
    this.getFiscalSuperiorAElevar();
    this.agregarQuitarValidador();
  }

  ngOnDestroy() {
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    // Cerrar el modal si está abierto
    if (this.refModal) {
      this.refModal.close();
    }

    // Limpiar el formulario
    this.formulario.reset();

    // Limpiar otras propiedades
    this.sujetosProcesales = [];
    this.selectedSujetos = [];
    this.fiscalias = [];
    this.sujetosElevar = [];
  }

  protected get idActo(): string {
    return this.tramiteService.validacionTramite.idActoSeleccionado;
  }

  protected get esSujeto(): boolean {
    return this.nivelApelacion === 'sujeto' || this.idsSujeto.includes(this.idActo);
  }

  protected get tipoCaso(): string {
    return this.esSujeto ? 'cuaderno incidental' : 'caso';
  }

  protected get tipoBoton(): string {
    return this.esSujeto ? 'incidente' : 'caso';
  }

  protected eventoRegistrarResolucion() {
    if (this.formularioValido) {
      const data: any = {
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        fechaNotificacion: this.formulario.get('fechaNotificacion')!.value,
        numeroExpediente: this.formulario.get('nroExpediente')!.value,
        codFiscaliaSuperior: this.formulario.get('codFiscaliaSuperior')!.value,
        observaciones: this.formulario.get('observaciones')!.value
      };
      this.subscriptions.push(
        this.autoResuelveCalificacionApelacionService
          .registrarResolucion(data)
          .subscribe({
            next: (resp: GenericResponse) => {
              if (resp.code == 0) {
                this.formulario.disable();
                this.esSoloLectura = true;
                this.tramiteGuardado = true;
                this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
                this.modalDialogService.success(
                  'REGISTRO CORRECTO',
                  `Se registró correctamente la información de la <strong>${this.tramiteSeleccionado?.nombreTramite}.</strong>`,
                  'Aceptar'
                ).subscribe(() => {
                  if(!this.flElevacionSuperior){
                    this.redireccionar();
                  }
                });
              }
            },
            error: (error) => {
              this.modalDialogService.error(
                'ERROR EN EL SERVICIO',
                error.error.message,
                'Aceptar'
              );
            },
          })
      );
    } else {
      this.markAllAsTouched();
    }
  }

  redireccionar(){
    this.router.navigate([
      '/app/administracion-casos/consultar-casos-fiscales/preliminar/cuaderno-incidental',
      this.idCaso,
      'acto-procesal'
    ]).then(() => {
      window.location.reload();
    });
  }

  protected async eventoElevarIncidenteAFiscalSuperior() {
    await this.validarElevar();
    const nombreFiscalSuperior = this.fiscalias.find(
      (e) => e.id === this.formulario.get('codFiscaliaSuperior')!.value
    )?.nombre;
    const nombreSujetosProcesales: string = this.generateListHTML();
    const titulo = this.esSujeto ? 'ELEVAR EL CUADERNO INCIDENTAL A FISCAL SUPERIOR' : 'ELEVAR CASO A FISCAL SUPERIOR';
    const descripcion = `Esta acción realiza la elevación del ${this.tipoCaso} a la ${nombreFiscalSuperior} junto con una nueva pestaña de apelación que ha sido creada con el número de expediente: ${this.numeroCaso} en la sección de: "Apelaciones". Por favor, no olvide que al realizar esta acción, solo la nueva pestaña de apelación pasará a modo lectura y no podrá acceder a él hasta que le sea devuelto. Tener en cuenta que el/los sujeto(s) procesal(es) a quien(es) se le(s) concedió la apelación es/son: ${nombreSujetosProcesales}.
\n<b>'¿Está seguro de realizar este trámite?'</b>`;
    this.refModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: titulo,
        description: descripcion,
        confirmButtonText: 'Aceptar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          const data: any = {
            idCaso: this.idCaso,
            idActoTramiteCaso: this.idActoTramiteCaso,
            fechaNotificacion: this.formulario.get('fechaNotificacion')!.value,
            numeroExpediente: this.formulario.get('nroExpediente')!.value,
            codFiscaliaSuperior: this.formulario.get('codFiscaliaSuperior')!.value,
            observaciones: this.formulario.get('observaciones')!.value
          };
          this.subscriptions.push(
            this.autoResuelveCalificacionApelacionService
              .registrarElevacion(data)
              .subscribe({
                next: (resp) => {
                  if (resp.code === '0') {
                    this.esPestanaElevada = true;
                    this.consultaCasosSharedService.showTab(true);
                    this.modalDialogService.success(
                      'REGISTRO CORRECTO',
                      `El ${this.tipoCaso} fue elevado correctamente junto con la nueva pestaña de apelación con el número de expediente: ${this.numeroCaso}, recuerde que no tendrá acceso hasta que sea devuelto.`,
                      'Aceptar'
                    ).subscribe(() => {
                      this.redireccionar();
                    });
                  }
                },
                error: (error) => {
                  console.log(error);
                },
              })
          );
        }
      },
    });
  }

  protected openModalSelectTramite() {
    this.dialogService.open(GuardarTramiteProcesalComponent, {
      width: '800px',
      showHeader: false,
      data: {
        tipo: 1,
        idCaso: this.idCaso,
        idEtapa: this.idEtapa,
        idActoProcesal: 0,
      },
    } as DynamicDialogConfig);
  }

  private markAllAsTouched() {
    Object.keys(this.formulario.controls).forEach((controlName) => {
      this.formulario.get(controlName)!.markAsTouched();
    });
  }

  private generateListHTML(): string {
    let html = '<ul>';
    console.log(this.sujetosElevar);
    this.sujetosElevar?.forEach((item: string) => {
      html += `<li>${item}</li>`;
    });
    html += '</ul>';
    return html;
  }

  private obtenerDatosResolucion() {
    this.subscriptions.push(
      this.autoResuelveCalificacionApelacionService
        .obtenerDatosResolucion(this.idActoTramiteCaso)
        .subscribe({
          next: (data) => {
            const fechaNoti = data.fechaNotificacion
              ? data.fechaNotificacion.split('T')[0]
              : null;
            this.formulario.patchValue({
              fechaNotificacion: fechaNoti,
              nroExpediente: data.numeroExpediente,
              codFiscaliaSuperior: data.codFiscaliaSuperior,
              observaciones: data.observaciones,
            });
            !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
            this.flCheckModal = data.flCheckModal == 1;
            this.flElevacionSuperior = data.flElevacion == 1;
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  private validarElevar(): Promise<void> {
    return new Promise((resolve) => {
      this.subscriptions.push(
        this.autoResuelveCalificacionApelacionService.validaElevar(this.idActoTramiteCaso).subscribe({
          next: (data: any) => {
            this.sujetosElevar = data;
            resolve();
          }
        })
      );
    });
  }

  private deshabilitarFormulario(): void {
    this.formulario.disable();
    this.esSoloLectura = true;
  }

  private getFiscalSuperiorAElevar(): void {
    this.subscriptions.push(
      this.autoResuelveCalificacionApelacionService
        .listarFiscaliasSuperiores(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.fiscalias = resp;
          },
          error: () => {
            this.fiscalias = [];
          },
        })
    );
  }

  get tieneActoTramiteCasoDocumento(): boolean {
    return Boolean(this.idActoTramiteCaso);
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  public openModalSujetos(): void {
    const ref = this.dialogService.open(
      RegistrarAutoResuelveCalificacionModalComponent,
      {
        showHeader: false,
        data: {
          numeroCaso: this.numeroCaso,
          idCaso: this.idCaso,
          idActoTramiteCaso: this.idActoTramiteCaso,
          idEstadoTramite: this.idEstadoTramite,
          idTramite: '',
          idActoProcesal: '',
          listSujetosProcesales: this.selectedSujetos,
          soloLectura: !this.tramiteEnModoEdicion || this.esSoloLectura,
          emitirValidaciones: (data: any) => {
            this.flCheckModal = data.flCheckModal;
            this.flElevacionSuperior = data.flElevacionSuperior;
            this.agregarQuitarValidador();
          }
        },
      }
    );

    ref.onClose.subscribe((data) => {
      if(data){
        this.flCheckModal = data.flCheckModal;
        this.flElevacionSuperior = data.flElevacionSuperior;
        this.agregarQuitarValidador();
      }

    });
  }

  get cantidadCaracteresObservacion(): number {
    return this.formulario.get('observaciones')?.value?.length ?? 0;
  }

  protected modalActualizarActoYTramite(): void {
    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      showHeader: false,
      data: {
        tipo: 2,
        idCaso: this.idCaso,
        idEtapa: this.idEtapa,
        idActoTramiteCaso: this.idActoTramiteCaso,
      },
    });
    ref.onClose.subscribe((confirm) => {
      if (confirm === RESPUESTA_MODAL.OK) this.recargarPagina();
    });
  }

  private recargarPagina(): void {
    window.location.reload();
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion;
  }

  get formularioValido(): boolean {
    return (
      this.formulario.valid &&
      this.flCheckModal
    );
  }

  protected confirmarRegistroTramite(): void {
    const dialog = this.modalDialogService.question(
      '',
      `A continuación, se procederá a <strong>crear el trámite</strong> de <strong>${this.tramiteSeleccionado?.nombreTramite}</strong>. ¿Está seguro de realizar la siguiente acción?`,
      'Aceptar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.eventoRegistrarResolucion();
        }
      },
    });
  }

  agregarQuitarValidador() {

    const control = this.formulario.get('codFiscaliaSuperior');
    if (control) {
      control.setValidators(this.flElevacionSuperior ? [Validators.required] : null);
      control.reset(null);
      control.updateValueAndValidity();
      this.formulario.updateValueAndValidity();
    }
  }

}
