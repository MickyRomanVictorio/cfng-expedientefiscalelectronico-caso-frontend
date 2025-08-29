import { valid } from './../../../../../core/utils/string';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { ContadorFooterTextareaComponent } from '@core/components/reutilizable/contador-footer-textarea/contador-footer-textarea.component';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { DropdownArrowNavModule } from '@core/directives/dropdown-arrow-nav.module';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { SentenciaConsentida, SujetosDelitosConsentidos, SujetosDelitosSenteciasConsentidasId } from '@core/interfaces/provincial/tramites/interoperabilidad/sentencia/consentir-sentencia/sentencia-consentida';
import { SujetoProcesalService } from '@core/services/provincial/sujeto-procesal/sujeto-procesal.service';
import { AutoSentenciaCondenatoriaAbsolutoriaService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/auto-sentencia-condenatoria-absolutoria.service';
import { AutoSentenciaConsentidaService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/auto-sentencia-consentida.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { ID_N_TIPO_SENTENCIA } from '@core/types/tipo-sentencia';
import { convertStringToDate } from '@core/utils/date';
import { capitalizedFirstWord } from '@core/utils/string';
import { CmpLibModule } from 'dist/cmp-lib';
import { ESTADO_REGISTRO, icono, IconUtil, RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import dayjs from 'dayjs';

@Component({
  selector: 'app-registrar-auto-declara-consentida-sentencia',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CmpLibModule,
    CalendarModule,
    CheckboxModule,
    DropdownModule,
    NgxCfngCoreModalDialogModule,
    ContadorFooterTextareaComponent,
    InputTextareaModule,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
    DateMaskModule,
    DropdownArrowNavModule
  ],
  providers: [
    DialogService,
  ],
  templateUrl: './registrar-auto-declara-consentida-sentencia.component.html',
  styleUrl: './registrar-auto-declara-consentida-sentencia.component.scss'
})
export class RegistrarAutoDeclaraConsentidaSentenciaComponent {

  protected idCaso!: string

  protected idActoTramiteCaso!: string

  public idEtapa!: string

  public numeroCaso!: string

  protected tramiteSeleccionado: TramiteProcesal | null = null

  protected tramiteEnModoEdicion: boolean = false

  protected idEstadoTramite!: number

  private readonly suscripciones: Subscription[] = []

  private readonly fb = inject(FormBuilder)

  protected readonly iconUtil = inject(IconUtil)

  private readonly dialogService = inject(DialogService)

  private readonly autoSentenciaCondenatoriaAbsolutoriaService = inject(AutoSentenciaCondenatoriaAbsolutoriaService)

  private readonly autoSentenciaConsentidaService = inject(AutoSentenciaConsentidaService)

  private readonly sujetoProcesalService = inject(SujetoProcesalService)

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly gestionCasoService = inject(GestionCasoService)

  protected ID_N_TIPO_SENTENCIA = ID_N_TIPO_SENTENCIA

  protected formRegistro: any

  protected longitudMaximaObservaciones: number = 3000

  protected listarSujetos: any = []

  protected listarDelitos: any = []

  protected listaSujetosConsentidos: SujetosDelitosConsentidos[] = []

  protected fechaActual: Date | null = null

  protected fechaHecho: Date | null = null

  ngOnInit(): void {
    if (!this.tramiteNoDespachadoMesa) {
      this.inicializarFormulario()
      this.fechaActual = dayjs().startOf('day').toDate()
      this.fechaHecho = dayjs(this.gestionCasoService.casoActual.fechaHecho, 'DD/MM/YYYY')
      .subtract(1, 'day')
      .toDate()
      this.listarSujetosDelitos()
      this.obtenerDatosTramite();
      if (!this.esPosibleEditarFormulario) {
        this.deshabilitarFormulario();
      }
    }
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(suscripcion => suscripcion.unsubscribe())
  }
  private obtenerDatosTramite(): void {
    this.suscripciones.push(
      this.autoSentenciaConsentidaService.obtenerDatosTramite(this.idActoTramiteCaso).subscribe({
        next: (resp: SentenciaConsentida) => {
          if (resp.listaSujetosConsentidos.length > 0) {
            this.formRegistro.get('observaciones')?.setValue(resp.observaciones)
            this.formRegistro.get('fechaNotificacion')?.setValue(convertStringToDate(resp.fechaNotificacion))
            this.listaSujetosConsentidos = resp.listaSujetosConsentidos
          }
        },
        error: () => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar obtener la información del trámite`, 'Aceptar')
        }
      })
    )
  }
  private listarSujetosDelitos(): void {
    this.suscripciones.push(
      this.autoSentenciaCondenatoriaAbsolutoriaService.listarSujetosDelitos(this.idCaso).subscribe({
        next: resp => {
          this.listarSujetos = resp
        }
      })
    )
  }
  protected cambiarSujetoProcesal(idSujetoCaso: string): void {
    this.listarDelitos = []
    this.formRegistro.get('delito').setValue('')
    this.suscripciones.push(
      this.sujetoProcesalService.obtenerDelitosPorSujeto(idSujetoCaso).subscribe({
        next: resp => {
          this.listarDelitos = resp
        }
      })
    )
  }
  protected agregarSentencias() {
    const form = this.formRegistro.value
    this.suscripciones.push(
      this.autoSentenciaConsentidaService.listarSujetosDelitosSentenciados(this.idCaso, form.sujetoProcesal, form.delito).subscribe({
        next: resp => {
          const sentenciasAgregadas = resp as SujetosDelitosConsentidos[];
          this.agregarSentenciasUnicas(sentenciasAgregadas);
        },
        error: () => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar agregar la información del sujeto y los delitos`, 'Aceptar')
        }
      })
    )
  }
  protected agregarSentenciasUnicas(sentenciasAgregadas: SujetosDelitosConsentidos[] = []): void {
    if (!Array.isArray(sentenciasAgregadas) || sentenciasAgregadas.length === 0) {
      this.modalDialogService.warning("Advertencia", "El sujeto procesal seleccionado y el delito indicado no cuentan con ninguna sentencia registrada", 'Aceptar')
      return;
    }
    const trioKey = (x: SujetosDelitosConsentidos) =>
      `${x.idSujetoCaso}|${x.idDelitoSujeto}|${x.idTipoSentencia}`;

    const penaKey = (x: SujetosDelitosConsentidos) =>
      `${x.idSujetoCaso}|${x.idDelitoSujeto}|${x.idTipoSentencia}|${x.idPena}`;

    const sentenciaSet = new Set(this.listaSujetosConsentidos.map(trioKey));
    const condenatoriaSet = new Set(
      this.listaSujetosConsentidos
        .filter(x => x.idTipoSentencia === ID_N_TIPO_SENTENCIA.CONDENATORIA)
        .map(penaKey)
    );

    const nuevos: SujetosDelitosConsentidos[] = [];
    let duplicados = 0;

    for (const it of sentenciasAgregadas) {
      if (!it) continue;

      if (it.idTipoSentencia === ID_N_TIPO_SENTENCIA.CONDENATORIA) {
        const k = penaKey(it);
        if (condenatoriaSet.has(k)) {
          duplicados++;
          continue;
        }
        nuevos.push(it);
        condenatoriaSet.add(k);
        sentenciaSet.add(trioKey(it));
      } else {
        const k = trioKey(it);
        if (sentenciaSet.has(k)) {
          duplicados++;
          continue;
        }
        nuevos.push(it);
        sentenciaSet.add(k);
      }
    }
    if (nuevos.length === 0) {
      const sentencia = sentenciasAgregadas[0];
      const mensaje =
        sentenciasAgregadas.length === 1
          ? `El sujeto procesal <b>${sentencia.sujeto}</b>, el delito <b>${sentencia.delito}</b> y la sentencia <b>${this.formatearSentenciaTexto(sentencia.tipoSentencia)}</b> ya han sido agregados para consentir.`
          : `Todas las penas de la sentencia condenatoria para el sujeto procesal <b>${sentencia.sujeto}</b> y el delito <b>${sentencia.delito}</b> ya han sido agregadas para consentir.`;

      this.modalDialogService.warning("Advertencia", mensaje, "Aceptar");
      return;
    }
    this.listaSujetosConsentidos = [...this.listaSujetosConsentidos, ...nuevos]
    //this.resetearAgregarSujeto()

  }

  protected resetearAgregarSujeto() {
    this.listarDelitos = []
    const campos = [
      'sujetoProcesal',
      'delito',
    ];
    campos.forEach(campo => {
      const control = this.formRegistro.get(campo);
      if (control) {
        control.setValue('');
        control.markAsPristine();
        control.markAsUntouched();
        control.updateValueAndValidity();
      }
    })
  }

  protected eliminarSujetoConsentido(index: number): void {
    if (index >= 0 && index < this.listaSujetosConsentidos.length) {
      this.listaSujetosConsentidos = this.listaSujetosConsentidos.filter(
        (_, i) => i !== index
      );
        this.modalDialogService.success(
          '',
          'Se eliminó correctamente',
          'Aceptar'
        );
    }
  }


  protected guardarTramite(): void {
    const requestSujetosConsentidos: SujetosDelitosSenteciasConsentidasId[] =
      this.listaSujetosConsentidos.map(({
        idActoTramiteDelitoSujeto, idPena, idSujetoCaso, idDelitoSujeto, idTipoSentencia
      }) => ({
        idActoTramiteDelitoSujeto,
        idPena,
        idSujetoCaso,
        idDelitoSujeto,
        idTipoSentencia
      }));

    this.suscripciones.push(
      this.autoSentenciaConsentidaService.validarSujetosSentenciasConsentidas(this.idCaso, { listaSujetosParaConsentir: requestSujetosConsentidos }).subscribe({
        next: resp => {
          const resultado = resp as number
          let mensaje = ""

          if (resultado == 0) {
            mensaje = "A continuación se registrará sentencia consentida total (todos los sentenciados), esta confirmación concluye la etapa JUZGAMIENTO y el caso pasará a la bandeja de concluidos, después no podrá revertir el cambio.<br><b>Nota:</b> Para las sentencias condenatorias, absolutorias con reparación civil ó reparación civil exclusiva se creará cuadernos de ejecución (Módulo SEGUIMIENTO DE EJECUCIÒN)<br>¿Está seguro de realizar este trámite?"
          }
          else if (resultado == 1) {
            mensaje = "A continuación se procederá a registrar sentencia consentida parcial<br><b>Nota:</b> Para las sentencias condenatorias, absolutorias con reparación civil o reparación civil exclusiva se creará cuadernos de ejecución (Módulo SEGUIMIENTO DE EJECUCIÓN)<br>¿Está seguro de realizar este trámite?"
          }
          else {
            mensaje = "Los delitos , sujetos y sentencias agregados no coinciden con el trámite anterior Registro - Sentencia"
          }

          if (resultado == 0 || resultado == 1) {
            const dialog = this.modalDialogService.question("Confirmar", mensaje, 'Aceptar', 'Cancelar')
            dialog.subscribe({
              next: (resp: CfeDialogRespuesta) => {
                if (resp === CfeDialogRespuesta.Confirmado) {
                  this.guardarSentenciasConsentidas(requestSujetosConsentidos)
                }
              }
            })
          }
          else {
            this.modalDialogService.error("Error", mensaje, 'Aceptar')
          }
        },
        error: () => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar validar la información de los sujetos y delitos consentidos`, 'Aceptar')
        }
      })
    )
  }

  guardarSentenciasConsentidas(requestSujetosConsentidos: SujetosDelitosSenteciasConsentidasId[]) {
    const form = this.formRegistro.value
    const request = {
      fechaNotificacion: form.fechaNotificacion,
      observaciones: form.observaciones,
      listaSujetosParaConsentir: requestSujetosConsentidos

    } as SentenciaConsentida;
    this.suscripciones.push(
      this.autoSentenciaConsentidaService.guardarTramite(
        this.idActoTramiteCaso,
        request
      ).subscribe({
        next: () => {
          this.modalDialogService.success('', `Se registró correctamente la información de la <b>${this.nombreTramite()}</b> .`, 'Aceptar')
          this.tramiteEnModoEdicion = false
          this.resetearAgregarSujeto()
          this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO
          this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
          this.deshabilitarFormulario()
        },
        error: () => {
          this.modalDialogService.error(
            'Error',
            'Se ha producido un error al guardar los los datos del trámite',
            'Aceptar'
          );
        }
      })
    )
  }

  private inicializarFormulario(): void {
    this.formRegistro = this.fb.group({
      fechaNotificacion: [null, [Validators.required]],
      sujetoProcesal: ['', [Validators.required]],
      delito: ['', [Validators.required]],
      observaciones: ['']
    })
  }
  private deshabilitarFormulario(): void {
    this.formRegistro.disable()
  }

  protected abrirModalSeleccionarTramite(): void {

    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      showHeader: false,
      data: {
        tipo: 2,
        idCaso: this.idCaso,
        idEtapa: this.idEtapa,
        idActoTramiteCaso: this.idActoTramiteCaso,
      }
    })

    ref.onClose.subscribe((confirm) => {
      if (confirm === RESPUESTA_MODAL.OK) this.recargarPagina()
    })

  }

  private recargarPagina(): void {
    window.location.reload()
  }

  protected get agregarSujetosDelitosSentenciados(): boolean {
    return this.formRegistro.get('sujetoProcesal').valid && this.formRegistro.get('delito').valid
  }

  protected formatearSentenciaTexto(texto: string): string {
    return texto.replace(/SENTENCIA(?: DE)?/gi, '').trim()
  }
  protected get esFormularioValido(): boolean {

    const datos = this.formRegistro.getRawValue()
    const tieneDatosRequeridos =
      datos.fechaNotificacion !== null &&
      this.listaSujetosConsentidos.length > 0

    return tieneDatosRequeridos
  }

  protected icono(name: string): string {
    return icono(name);
  }
  protected get tramiteNoDespachadoMesa(): boolean {
    return !this.tieneActoTramiteCasoDocumento && !this.tramiteEstadoRecibido
  }

  protected get tieneActoTramiteCasoDocumento(): boolean {
    return !(this.idActoTramiteCaso == null || this.idActoTramiteCaso == '')
  }

  protected get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
  }
  get esPosibleEditarPorEstado(): boolean {
    return !this.tramiteEstadoRecibido
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion ? this.tramiteEnModoEdicion : this.esPosibleEditarPorEstado
  }
  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }

  protected validarColumnasTabla(data: any): string {
    return valid(data) ? data : '-';
  }
  protected validarObservacion(input: string): boolean {
    return valid(this.formRegistro.get(input)?.value)
  }
}
