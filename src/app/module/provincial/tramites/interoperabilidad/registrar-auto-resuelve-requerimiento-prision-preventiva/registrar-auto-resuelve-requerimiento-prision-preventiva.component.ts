import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CasoFiscal, ESTADO_REGISTRO, IconAsset, RESPUESTA_MODAL } from 'ngx-cfng-core-lib';
import { ButtonModule} from 'primeng/button';
import { MensajeCompletarInformacionComponent} from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { RadioButtonModule} from "primeng/radiobutton";
import { CheckboxModule} from "primeng/checkbox";
import { CalendarModule} from 'primeng/calendar';
import { InputTextModule} from "primeng/inputtext";
import { InputTextareaModule} from 'primeng/inputtextarea';
import { MensajeInteroperabilidadPjComponent} from "@components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component";
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService} from '@ngx-cfng-core-modal/dialog';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { DialogService } from 'primeng/dynamicdialog';
import { NgClass } from '@angular/common';
import { TramiteResponse, ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import { ID_TIPO_ORIGEN } from '@core/types/tipo-origen.type';
import { GuardarTramiteProcesalComponent} from '@components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { AutoResuelvePrisionPreventiva } from '@core/interfaces/comunes/AutoResuelvePrisionPreventivaRequest';
import { ResolucionAutoResuelvePrisionPreventivaService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-prision-preventiva.service';
import { RegistrarResultadosPrisionPreventivaComponent } from '@modules/provincial/tramites/interoperabilidad/registrar-resultados-prision-preventiva/registrar-resultados-prision-preventiva.component';
import { GestionAudiosComponent } from '@components/modals/gestion-audios/gestion-audios.component';
import { RegistroResolucionIncoacionService } from '@core/services/provincial/tramites/especiales/incoacion/registro-resolucion-incoacion.service';
import { ResultadoAudienciaPrisionPreventivaComponent } from './resultado-audiencia-prision-preventiva/resultado-audiencia-prision-preventiva.component';
import { FirmaIndividualService } from '@services/firma-digital/firma-individual.service';
import { convertStringToDate } from '@utils/date';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';

@Component({
  selector: 'app-registrar-auto-resuelve-requerimiento-prision-preventiva',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    ButtonModule,
    CheckboxModule,
    RadioButtonModule,
    CalendarModule,
    InputTextModule,
    InputTextareaModule,
    MensajeCompletarInformacionComponent,
    MensajeInteroperabilidadPjComponent,
    NgxCfngCoreModalDialogModule,
  ],
  templateUrl: './registrar-auto-resuelve-requerimiento-prision-preventiva.component.html',
  styleUrl: './registrar-auto-resuelve-requerimiento-prision-preventiva.component.scss',
  providers: [DialogService, NgxCfngCoreModalDialogService],
})
export class RegistrarAutoResuelveRequerimientoPrisionPreventivaComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idEstadoTramite!: number;
  @Input() tramiteEnModoEdicion!: boolean;
  @Input() idActoTramiteCaso!: string;
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  protected readonly iconAsset = inject(IconAsset);
  protected readonly dialogService = inject(DialogService);
  protected readonly tramiteService = inject(TramiteService);
  protected readonly casoService = inject(Casos);
  protected readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  protected readonly gestionCasoService = inject(GestionCasoService);
  protected readonly resolucionAutoResuelvePrisionPreventivaService = inject(ResolucionAutoResuelvePrisionPreventivaService);
  protected readonly registroResolucionIncoacionService = inject(RegistroResolucionIncoacionService);
  protected readonly firmaIndividualService = inject(FirmaIndividualService)
  private readonly validacionTramite!: ValidacionTramite;
  protected verFormulario: boolean = false;
  protected audiosAudienciaCorrectos: boolean = false;
  protected fechaActual: Date = new Date();
  protected fechaHecho: Date | null = null;
  protected actosProlongacion: string[] = ['000156021001110105', '000156021001110104', '000156021001110103'];
  protected actosCesacion: string[] = ['000157021001110105', '000157021001110104', '000157021001110103'];
  public casoFiscal: CasoFiscal | null = null;
  public subscriptions: Subscription[] = [];
  protected longitudMaximaObservaciones: number = 200;
  protected formularioAutoResuelvePrisionPreventiva: FormGroup = new FormGroup({
    fechaNotificacion: new FormControl('', Validators.required),
    observaciones: new FormControl('', [Validators.maxLength(this.longitudMaximaObservaciones)]),
    resultadoPrisionPreventiva: new FormControl(false, [Validators.requiredTrue]),
    resultadoAudiencia: new FormControl(null)
  });

  get tramiteEstadoRecibidoOFirmado(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO || this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO;
  }

  get formularioValido(): boolean {
    return this.formularioAutoResuelvePrisionPreventiva.valid;
  }

  get cantidadCaracteresObservacion(): number {
    return this.formularioAutoResuelvePrisionPreventiva.get('observaciones')?.value?.length ?? 0;
  }

  get idCasoPadre(): string {
    return this.gestionCasoService.casoActual.idCasoPadre ?? '';
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

  get tramiteRegistrado(): TramiteResponse {
    return this.tramiteService.tramiteRegistrado;
  }

  get esProlongacion(): boolean {
    return this.actosProlongacion.includes(this.tramiteRegistrado.idActoTramiteConfigura ?? '');
  }

  get esCesacion(): boolean {
    return this.actosCesacion.includes(this.tramiteRegistrado.idActoTramiteConfigura ?? '');
  }

  get tramiteOriginadoEnEfe(): boolean {
    return this.validacionTramite.tipoOrigenTramiteSeleccionado === ID_TIPO_ORIGEN.EFE;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion;
  }

  ngOnInit(): void {
    this.tramiteService.verIniciarTramite = false;
    this.obtenerValidacionAudiosAudiencia();
    this.infoCasoPadre();
    if (this.idActoTramiteCaso) {
      this.obtenerDetalleActoTramiteCaso();
      this.verFormulario = true;
    }
    if (this.validacionTramite.tipoOrigenTramiteSeleccionado == 5) {
      this.peticionParaEjecutar.emit(() => this.guardarFormularioEFE());
      this.cambiosFormulario();
    }
    this.subscriptions.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.tramiteEnModoEdicion = false;
            this.deshabilitarFormulario();
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private infoCasoPadre(): void {
    this.subscriptions.push(
      this.casoService.obtenerCasoFiscal(this.idCasoPadre).subscribe({
        next: (resp) => {
          this.fechaHecho = convertStringToDate(resp.fechaHecho, 'DD/MM/YYYY');
        }
      })
    );
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

  protected modalResultadosPrisionPreventiva(): void {
    const ref = this.dialogService.open(RegistrarResultadosPrisionPreventivaComponent, {
      showHeader: false,
      width: '70rem',
      closeOnEscape: false,
      data: {
        idCaso: this.idCaso,
        idCasoPadre: this.gestionCasoService.casoActual.idCasoPadre,
        idActoTramiteCaso: this.idActoTramiteCaso,
        numeroCaso: this.numeroCaso,
        tramiteEnModoEdicion: this.tramiteEnModoEdicion,
        actualizar: false,
        prolongacion: this.esProlongacion,
        cesacion: this.esCesacion,
        reo: false
      },
    });
    ref.onClose.subscribe((confirm) => {
      this.formularioAutoResuelvePrisionPreventiva.get('resultadoPrisionPreventiva')?.setValue( confirm.existeResultadosRegistrados )
    });
  }

  protected guardarFormularioEFE(): void {
    let datosForm = this.formularioAutoResuelvePrisionPreventiva.getRawValue();
    let request: AutoResuelvePrisionPreventiva = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: datosForm.fechaNotificacion,
      observaciones: datosForm.observaciones
    }

    this.subscriptions.push(
      this.resolucionAutoResuelvePrisionPreventivaService.registroParcialAutoResuelvePrisionPreventiva(request).subscribe({
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
    let datosForm = this.formularioAutoResuelvePrisionPreventiva.getRawValue();
    let request: AutoResuelvePrisionPreventiva = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: datosForm.fechaNotificacion,
      observaciones: datosForm.observaciones
    }

    this.subscriptions.push(
      this.resolucionAutoResuelvePrisionPreventivaService.registroAutoResuelvePrisionPreventiva(request).subscribe({
        next: resp => {
          this.tramiteEnModoEdicion = false;
          this.gestionCasoService.obtenerCasoFiscal(this.gestionCasoService.casoActual.idCaso);
          this.deshabilitarFormulario();
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

  private cambiosFormulario(): void {
    this.subscriptions.push(
      this.formularioAutoResuelvePrisionPreventiva.valueChanges.subscribe(() => {
        this.formularioEditado(true)
        this.habilitarGuardar(this.formularioValido)
      })
    )
  }

  private deshabilitarFormulario(): void {
    this.formularioAutoResuelvePrisionPreventiva.disable();
  }

  private obtenerDetalleActoTramiteCaso() {
    this.obtenerAutoResuelvePrisionPreventiva();
  }

  private obtenerAutoResuelvePrisionPreventiva(): void {
    this.subscriptions.push(
      this.resolucionAutoResuelvePrisionPreventivaService.obtenerAutoResuelvePrisionPreventiva(this.idActoTramiteCaso)
      .subscribe({
        next: (resp) => {
          this.establecerValoresFormulario(resp);
        },
        error: () => {
          this.modalDialogService.error('Error', 'No se puede obtener los datos', 'Aceptar');
        },
      })
    )
  }

  private establecerValoresFormulario(data: AutoResuelvePrisionPreventiva): void {
    this.formularioAutoResuelvePrisionPreventiva.patchValue({
      idActoTramiteCaso: data.idActoTramiteCaso,
      fechaNotificacion: data.fechaNotificacion,
      observaciones: data.observaciones,
      resultadoPrisionPreventiva: data.resultadoPrisionPreventiva,
      resultadoAudiencia: data.resultadoAudiencia
    });
    !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
  }

  protected modalAudiosAudiencia(): void {
    const ref = this.dialogService.open(GestionAudiosComponent, {
      showHeader: false,
      width: '80%',
      contentStyle: { padding: '0' },
      data: {
        idCaso: this.idCaso,
        tituloModal: 'Audios de la audiencia',
        idActoTramiteCaso: this.idActoTramiteCaso,
      },
    });

    ref.onClose.subscribe(() => {
      this.obtenerValidacionAudiosAudiencia();
    });
  }

  protected obtenerValidacionAudiosAudiencia(): void {
    this.audiosAudienciaCorrectos = false;
    this.subscriptions.push(
      this.registroResolucionIncoacionService
        .validarAudiosDeAudiencia(this.idActoTramiteCaso).subscribe({
          next: (resp) => {
            if(resp.data !== null && resp.data === '1'){
              this.audiosAudienciaCorrectos = true;
            }
          }
        })
    );
  }

  protected modalResultadoAudiencia(): void {
    const ref = this.dialogService.open(ResultadoAudienciaPrisionPreventivaComponent, {
      showHeader: false,
      width: '70rem',
      contentStyle: { "padding": 0 },
      closeOnEscape: false,
      data: {
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        tramiteEnModoEdicion: this.tramiteEnModoEdicion,
        tramiteEstadoRecibidoOFirmado: this.tramiteEstadoRecibidoOFirmado

      },
    });

    ref.onClose.subscribe((confirm) => {
      this.formularioAutoResuelvePrisionPreventiva.get('resultadoAudiencia')?.setValue( confirm.existeResultadosRegistrados )
    });
  }
}
