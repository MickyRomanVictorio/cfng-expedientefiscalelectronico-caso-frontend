import { AutoConcedeApelacionQuejaService } from './../../../../../core/services/provincial/cuadernos-incidentales/auto-concede-apelacion-queja/auto-concede-apelacion-queja.service';
import { NgClass, NgIf } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
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
import { delay, Subscription } from 'rxjs';
import { MensajeInteroperabilidadPjComponent } from '@components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { MensajeCompletarInformacionComponent } from '@components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { TramiteProcesal } from '@interfaces/comunes/tramiteProcesal';
import { ESTADO_REGISTRO, IconAsset, RESPUESTA_MODAL } from 'ngx-cfng-core-lib';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import { RegistrarAutoConcedeApelacionQuejaModalComponent } from './registrar-auto-concede-apelacion-por-queja-modal/registrar-auto-concede-apelacion-queja-modal.component';
import { ExpedienteMaskModule } from '@core/directives/expediente-mask.module';
import { InputTextModule } from 'primeng/inputtext';
import { ResolucionAutoResuelveRequerimientoService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service';
import { SujetosProcesalesPestanas } from '@core/interfaces/reusables/sujeto-procesal/sujetos-procesales-pestanas.interface';
import { Router } from '@angular/router';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';

@Component({
  selector: 'app-auto-concede-apelacion-por-queja',
  standalone: true,
  templateUrl: './auto-concede-apelacion-por-queja.component.html',
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
    InputTextModule,
  ],
  providers: [DialogService, MensajeNotificacionService],
  styleUrls: ['./auto-concede-apelacion-por-queja.component.scss'],
})
export class AutoConcedeApelacionPorQuejaComponent implements OnInit {
  @Input() idCaso: string = '';
  @Input() idActoTramiteCaso: string = '';
  @Input() idEstadoTramite!: number;
  @Input() numeroCaso: string = '';
  @Input() idActoTramiteProcesalEnlace: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null; //
  @Input() idDocumento: string[] = []; //
  @Input() tramiteEnModoEdicion: boolean = false;

  private idsSujeto: string[] = ['000172'];
  protected razon = new FormControl('', [Validators.required]);
  protected refModal!: DynamicDialogRef;
  private readonly subscriptions: Subscription[] = [];
  protected fiscalias: any[] = [];
  protected maxlengthObservaciones: number = 200;
  protected formulario!: FormGroup;
  protected sujetosProcesales: SujetosProcesalesPestanas[] = [];
  protected selectedSujetos: any = [];
  protected nivelApelacion: string = '';
  protected longitudMaximaObservaciones: number = 200;
  protected esPestanaElevada: boolean = false;
  protected esSoloLectura: boolean = false;
  protected validadorDesdeModal: boolean = false;
  protected validarElevacion: boolean = false;
  protected readonly iconAsset = inject(IconAsset);
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  protected flCheckModal: boolean = false;

  constructor(
    private readonly dialogService: DialogService,
    private readonly formBuilder: FormBuilder,
    private readonly autoResuelveCalificacionApelacionService: AutoResuelveCalificacionApelacionService,
    private readonly autoConcedeApelacionQuejaService: AutoConcedeApelacionQuejaService,
    private readonly mensajeService: MensajeNotificacionService,
    private readonly consultaCasosSharedService: ConsultaCasosSharedService,
    private readonly resolucionAutoResuelveRequerimientoService: ResolucionAutoResuelveRequerimientoService,
      private readonly router: Router,
          private readonly gestionCasoService: GestionCasoService,
           private readonly tramiteService: TramiteService
  ) {}

  ngOnInit() {
    this.formulario = this.formBuilder.group({
      fechaNotificacion: [null, Validators.required],
      nroExpediente: new FormControl(null, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(27),
        Validators.pattern(/^\d{5}-\d{4}-\d-\d{4}-[A-Z]{2}-[A-Z]{2}-\d{2}$/),
      ]),
      codFiscaliaSuperior: [null, null],
      observaciones: ['', [Validators.maxLength(this.maxlengthObservaciones)]],
    });
    this.nivelApelacion = this.numeroCaso.endsWith('0') ? 'proceso' : 'sujeto';
    this.obtenerDatosResolucion();
    this.getFiscalSuperiorAElevar();
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
  protected eventoRegistrarResolucion() {
    if (this.formularioValido) {
      const data: any = {
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        fechaNotificacion: this.formulario.get('fechaNotificacion')!.value,
        numeroExpediente: this.formulario.get('nroExpediente')!.value,
        observaciones: this.formulario.get('observaciones')!.value,
        codFiscaliaSuperior: this.formulario.get('codFiscaliaSuperior')!.value,
      };
      this.subscriptions.push(
        this.autoConcedeApelacionQuejaService
          .registrarResolucion(data)
          .subscribe({
            next: (resp) => {
              if (resp.code === '0') {
                this.formulario.disable();
               // this.esSoloLectura = true;
                this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO;
                this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
                this.validarElevacion = true;
                this.mensajeService.verMensajeNotificacion(
                  'REGISTRO CORRECTAMENTE',
                  `Se registró correctamente la información de la <strong>${this.tramiteSeleccionado?.nombreTramite}.</strong>`,
                  'success'
                );

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

  protected async eventoElevarIncidenteAFiscalSuperior() {
   await this.obtenerSujetosProcesales();
    const nombreFiscalSuperior = this.fiscalias.find(
      (e) => e.id === this.formulario.get('codFiscaliaSuperior')!.value
    )?.nombre;
    const nombreSujetosProcesales: string = this.generateListHTML();
    const descripcion = `Esta acción realiza la elevación del ${this.tipoCaso} a la ${nombreFiscalSuperior} junto con una nueva pestaña de apelación que ha sido creada con el número de expediente: ${this.numeroCaso} en la sección de: “Apelaciones”. Por favor, no olvide que al realizar esta acción, solo la nueva pestaña de apelación pasará a modo lectura y no podrá acceder a él hasta que le sea devuelto. Tener en cuenta que el/los sujeto(s) procesal(es) a quien(es) se le(s) concedió la apelación es/son: ${nombreSujetosProcesales}.
\n<b>'¿Está seguro de realizar este trámite?'</b>`;
    this.refModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `ELEVAR EL CUADERNO INCIDENTAL A FISCAL SUPERIOR`,
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
            observaciones: this.formulario.get('observaciones')!.value,
            listSujetos: this.selectedSujetos,
          };
          this.subscriptions.push(
            this.autoConcedeApelacionQuejaService
              .registrarElevacion(data)
              .pipe(delay(1000))
              .subscribe({
                next: (resp) => {
                  if (resp.code === '0') {
                    this.esPestanaElevada = true;
                    this.validarElevacion = false;
                    this.esSoloLectura = true;
                    this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
                    this.consultaCasosSharedService.showTab(true);
                    this.modalDialogService.success(
                      'ELEVACIÓN A FISCAL SUPERIOR CORRECTA',
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
  redireccionar(){
    this.router.navigate([
      '/app/administracion-casos/consultar-casos-fiscales/preliminar/cuaderno-incidental',
      this.idCaso,
      'apelaciones',
    ]).then(() => {
      window.location.reload();
    });
  }
  private obtenerSujetosProcesales(): Promise<void>  {
    this.selectedSujetos = [];
    return new Promise((resolve) => {
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 1)
        .subscribe({
          next: (resp) => {
            this.selectedSujetos = resp.filter(
              (e: any) => e.flConcedeApelacion == '1' && e.idActoTramiteCasoGuardado == this.idActoTramiteCaso
            );
        resolve();
          },
          error: () => {
            this.selectedSujetos = [];
          },
        })
    );  })
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
    let sujetoElevacion = this.selectedSujetos.filter(
      (e: any) => e.flConcedeApelacion == '1'
    );
    sujetoElevacion?.forEach((item: { nombreCompleto: any }) => {
      html += `<li>${item.nombreCompleto}</li>`;
    });
    html += '</ul>';
    return html;
  }

  private obtenerDatosResolucion() {
    if(!this.idActoTramiteCaso) {
      return;
    }
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
            this.flCheckModal = data.flCheckModal=== 1;
            this.validarElevacion = data.flElevacion===1;
            !this.esPosibleEditarFormulario && this.deshabilitarFormulario();

          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  private deshabilitarFormulario(): void {
    this.formulario.disable();
  }

  get tieneActoTramiteCasoDocumento(): boolean {
    return Boolean(this.idActoTramiteCaso);
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  public openModalSujetos(): void {
    const ref = this.dialogService.open(
      RegistrarAutoConcedeApelacionQuejaModalComponent,
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
          soloLectura: !this.tramiteEnModoEdicion || this.esSoloLectura || this.validarElevacion,
        },
      }
    );

    ref.onClose.subscribe((data) => {
      if (data) {
        this.flCheckModal = data.flCheckModal;
      }
      if(!this.validarElevacion){
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
      control.setValidators(this.flCheckModal ? [Validators.required] : null);
      if(this.validadorDesdeModal){
        control.reset(null);
      }
      control.updateValueAndValidity();
      this.formulario.updateValueAndValidity();
    }
  }
  get esElevacionSuperior() {
    return this.flCheckModal;
  }
  protected get idActo(): string {
    return this.tramiteService.validacionTramite.idActoSeleccionado;
  }



}
