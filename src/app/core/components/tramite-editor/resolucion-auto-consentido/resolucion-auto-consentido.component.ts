import {DatePipe, NgClass} from '@angular/common';
import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {CasoFiscal,} from '@core/interfaces/comunes/casosFiscales';
import {TramiteProcesal} from '@core/interfaces/comunes/tramiteProcesal';
import {DeclaraConsentidoRequerimiento} from '@services/provincial/tramites/interoperabilidad/resolucion-auto/declara-consentido-requerimiento';
import {GuardarTramiteProcesalComponent} from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import {CalendarModule} from 'primeng/calendar';
import {DialogService} from 'primeng/dynamicdialog';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {Subscription} from 'rxjs';
import {SeleccionarConsentidoResolucionComponent} from '@components/modals/cuadernos-incidentales/seleccionar-consentido-resolucion/seleccionar-consentido-resolucion.component';
import {ESTADO_REGISTRO, IconAsset, RESPUESTA_MODAL} from 'ngx-cfng-core-lib';
import {ButtonModule} from 'primeng/button';
import {MensajeCompletarInformacionComponent} from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import {RadioButtonModule} from "primeng/radiobutton";
import {DropdownModule} from "primeng/dropdown";
import {CheckboxModule} from "primeng/checkbox";
import {InputTextModule} from "primeng/inputtext";
import {MensajeInteroperabilidadPjComponent} from "@components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component";
import {NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService} from '@ngx-cfng-core-modal/dialog';
import {GestionCasoService} from "@services/shared/gestion-caso.service";
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {AutoResuelveRequest} from "@interfaces/comunes/AutoResuelveRequerimientoRequest";
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import { ID_TIPO_ORIGEN } from '@core/types/tipo-origen.type';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
@Component({
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    RadioButtonModule,
    DropdownModule,
    CheckboxModule,
    InputTextareaModule,
    InputTextModule,
    ButtonModule,
    CalendarModule,
    CmpLibModule,
    MensajeCompletarInformacionComponent,
    MensajeInteroperabilidadPjComponent,
    NgxCfngCoreModalDialogModule,
  ],
  selector: 'app-resolucion-auto-consentido',
  templateUrl: './resolucion-auto-consentido.component.html',
  styleUrls: ['./resolucion-auto-consentido.component.scss'],
  providers: [DatePipe],
})
export class ResolucionAutoConsentidoComponent implements OnInit, OnDestroy {

  /** Se modifica código realizado por Ronald Melecio, con la finalidad de agregar flujo de tramites mixtos */

  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idEstadoTramite!: number;
  @Input() tramiteEnModoEdicion!: boolean;
  @Input() idActoTramiteCaso!: string;
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  public casoFiscal: CasoFiscal | null = null;
  public subscriptions: Subscription[] = [];
  protected verFormulario: boolean = false;
  private readonly validacionTramite!: ValidacionTramite;
  protected selectedSujetos: any = [];
  protected longitudMaximaObservaciones: number = 200;
  protected formGroup: FormGroup = new FormGroup({
    fechaNotificacion: new FormControl('', Validators.required),
    txtObservacion: new FormControl('', [Validators.maxLength(this.longitudMaximaObservaciones)])
  });

  soloLectura: boolean = false;
  public sujetosProcesales: any[] = [];
  protected cantidadSujetosTramite: number = 0;
  protected readonly iconAsset = inject(IconAsset);
  protected readonly dialogService = inject(DialogService);
  protected readonly tramiteService = inject(TramiteService);
  protected readonly resolucionAutoService = inject(DeclaraConsentidoRequerimiento);
  protected readonly datePipe = inject(DatePipe);
  protected readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  protected readonly gestionCasoService = inject(GestionCasoService);
  protected readonly firmaIndividualService = inject(FirmaIndividualService);

  ngOnInit(): void {
    this.soloLectura = !this.tramiteEnModoEdicion
    this.tramiteService.verIniciarTramite = false;
    if (this.idActoTramiteCaso) this.verFormulario = true;
    if (this.validacionTramite.tipoOrigenTramiteSeleccionado == 5) {
      this.peticionParaEjecutar.emit(() => this.guardarFormularioEFE());
      this.cambiosFormulario();
    } else {
      this.isDisabledForm();
    }
    this.obtenerDatosFormulario();

    this.subscriptions.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.soloLectura = true;
            this.formGroup.disable()
          }
        }
      )
    )

    if(this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO || this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO){
      this.formGroup.disable()
    }

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private cambiosFormulario(): void {
    this.subscriptions.push(
      this.formGroup.valueChanges.subscribe(() => {
        this.formularioEditado(true)
        if ( this.validarForm ) {
          this.habilitarGuardar(true)
        } else  {
          this.habilitarGuardar(false)
        }
      })
    )
  }

  /** VALIDACION DE FORMULARIO **/

  isDisabledForm(): void {
    if (!this.tramiteEnModoEdicion && (this.estadoRecibido || !this.esTramiteCorrecto || this.soloLectura)) {
      this.formGroup.get('fechaNotificacion')!.disable();
      this.formGroup.get('txtObservacion')!.disable();
      this.soloLectura = true;
    } else {
      this.formGroup.get('fechaNotificacion')!.enable();
      this.formGroup.get('txtObservacion')!.enable();
    }
  }

  get validarForm(): boolean {
    return this.formGroup.valid && this.selectedSujetos?.length > 0;
  }

  /** GESTION DE ESTADOS **/

  get estadoRecibido(): boolean {
    return this.idEstadoTramite !== null && this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
  }

  get esTramiteCorrecto(): boolean {
    return this.idActoTramiteCaso !== null;
  }

  get cantidadCaracteresObservacion(): number {
    return this.formGroup.get('txtObservacion')?.value?.length ?? 0;
  }

  /** LLAMADA A DATOS **/

  public obtenerDatosFormulario(): void {
    this.subscriptions.push(
      this.resolucionAutoService
        .obtenerAutoRequerimiento(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            resp.fechaNotificacion ? this.formGroup.get('fechaNotificacion')!.setValue(new Date(resp.fechaNotificacion)) : null;
            resp.observacion ? this.formGroup.get('txtObservacion')!.setValue(resp.observacion) : null;
            this.cantidadSujetosTramite = resp.cantidadSujetosTramite
            if ( this.validarForm  ) {
              this.formularioEditado(false)
              this.habilitarFirmar(true)
            }
          },
          error: (error) => {
            console.error(error);
          },
        })
    );
  }

  protected guardarFormularioEFE(): void {
    let datosForm = this.formGroup.getRawValue();
    let request: AutoResuelveRequest = {
      operacion: 0,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: this.datePipe.transform(datosForm.fechaNotificacion, 'dd/MM/yyyy')!,
      observacion: datosForm.txtObservacion,
      listSujetos: this.selectedSujetos
    }

    this.subscriptions.push(
      this.resolucionAutoService.registrarTramiteEFE(request).subscribe({
        next: resp => {
          this.formularioEditado(false)
          this.habilitarFirmar(true)
          this.modalDialogService.success(
            'Datos guardado correctamente',
            'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
            'Aceptar'
          );
        },
        error: (error) => {
          this.modalDialogService.error(
            'Error en el servicio',
            error.error.message,
            'Aceptar'
          );
        }
      })
    );
  }

  protected guardarFormularioMesa(): void {
    let datosForm = this.formGroup.getRawValue();
    let request: AutoResuelveRequest = {
      operacion: 0,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: this.datePipe.transform(datosForm.fechaNotificacion, 'dd/MM/yyyy')!,
      observacion: datosForm.txtObservacion,
      listSujetos: this.selectedSujetos
    }

    this.subscriptions.push(
      this.resolucionAutoService.registrarTramite(request).subscribe({
        next: resp => {
          this.gestionCasoService.obtenerCasoFiscal(this.gestionCasoService.casoActual.idCaso);
          this.soloLectura = true;
          this.formGroup.disable()
          this.modalDialogService.success(
            'Datos guardado correctamente',
            'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
            'Aceptar'
          );
        },
        error: (error) => {
          this.modalDialogService.error(
            'Error en el servicio',
            error.error.message,
            'Aceptar'
          );
        }
      })
    );
  }

  /** LLAMADA A COMPONENTES EXTERNOS **/
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

  public openModalSujetos(): void {
    const ref = this.dialogService.open(SeleccionarConsentidoResolucionComponent, {
      showHeader: false,
      closeOnEscape: false,
      data: {
        numeroCaso: this.numeroCaso,
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        listSujetosProcesales: this.selectedSujetos,
        soloLectura: this.soloLectura,
        idEstadoTramite: this.idEstadoTramite
      },
    });

    ref.onClose.subscribe((data) => {
      this.formularioEditado(true)
      this.selectedSujetos = data
      this.cantidadSujetosTramite = this.selectedSujetos.length ?? this.cantidadSujetosTramite;
      if ( this.validarForm ) this.habilitarGuardar(true)
    });
  }

  protected activarFormulario(event: boolean) {
    this.tramiteService.verIniciarTramite = event;
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected habilitarFirmar(valor: boolean) {
    this.tramiteService.habilitarFirmar = valor;
  }

  get tramiteOriginadoEnEfe(): boolean {
    return this.validacionTramite.tipoOrigenTramiteSeleccionado === ID_TIPO_ORIGEN.EFE;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion;
  }

}

