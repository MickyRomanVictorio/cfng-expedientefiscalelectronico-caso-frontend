import { Component, inject, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component'
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { MaestroService } from '@core/services/shared/maestro.service'
import { CalendarModule } from 'primeng/calendar'
import { CheckboxModule } from 'primeng/checkbox'
import { DropdownModule } from 'primeng/dropdown'
import { RadioButtonModule } from 'primeng/radiobutton'
import { firstValueFrom, Subscription } from 'rxjs'
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog'
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component'
import { ESTADO_REGISTRO, icono, IconUtil, RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib'
import { capitalizedFirstWord, valid, validString } from '@core/utils/string'
import { RegistrarPenasComponent } from '@core/components/reutilizable/registrar-penas/registrar-penas.component'
import { TIPO_ACCION } from '@core/types/tipo-accion.type'
import { DataPena } from '@core/interfaces/reusables/registrar-penas/data-pena.interface'
import { TableModule } from 'primeng/table'
import { CmpLibModule } from 'dist/cmp-lib'
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { DialogModule } from 'primeng/dialog'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { RegistrarReparacionCivilComponent } from '@core/components/reutilizable/registrar-reparacion-civil/registrar-reparacion-civil.component'
import { EncabezadoModalComponent } from '@core/components/modals/encabezado-modal/encabezado-modal.component'
import { ValidarReparacionCivil } from '@core/interfaces/provincial/tramites/interoperabilidad/conclusion-anticipada/determina-conclusion-anticipada/validar-reparacion-civil.interface'
import { AutoSentenciaCondenatoriaAbsolutoriaService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/auto-sentencia-condenatoria-absolutoria.service'
import { ContadorFooterTextareaComponent } from '@core/components/reutilizable/contador-footer-textarea/contador-footer-textarea.component'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { SujetoProcesalService } from '@core/services/provincial/sujeto-procesal/sujeto-procesal.service'
import { SentenciaCondenatoriaAbsolutoria } from '@core/interfaces/provincial/tramites/interoperabilidad/sentencia/registrar-sentencia/sentencia-condenatoria-absolutoria'
import { GestionAudiosComponent } from '@core/components/modals/gestion-audios/gestion-audios.component'
import { RegistroResolucionIncoacionService } from '@core/services/provincial/tramites/especiales/incoacion/registro-resolucion-incoacion.service'
import { ID_N_TIPO_SENTENCIA } from '@core/types/tipo-sentencia'
import { DateMaskModule } from '@core/directives/date-mask.module'

@Component({
  selector: 'app-registrar-auto-sentencia-condenatoria-absolutoria',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
    CalendarModule,
    CheckboxModule,
    DropdownModule,
    DateMaskModule,
    RegistrarPenasComponent,
    RegistrarReparacionCivilComponent,
    TableModule,
    CmpLibModule,
    DialogModule,
    NgxCfngCoreModalDialogModule,
    EncabezadoModalComponent,
    ContadorFooterTextareaComponent,
    InputTextareaModule
  ],
  providers: [
    DialogService,
    DynamicDialogConfig,
  ],
  templateUrl: './registrar-auto-sentencia-condenatoria-absolutoria.component.html',
  styleUrl: './registrar-auto-sentencia-condenatoria-absolutoria.component.scss'
})
export class RegistrarAutoSentenciaCondenatoriaAbsolutoriaComponent implements OnInit, OnDestroy {

  protected idCaso!: string

  protected idActoTramiteCaso!: string

  public idEtapa!: string

  public numeroCaso!: string

  protected tramiteSeleccionado: TramiteProcesal | null = null

  protected tramiteEnModoEdicion: boolean = false

  protected idEstadoTramite!: number

  private readonly autoSentenciaCondenatoriaAbsolutoriaService = inject(AutoSentenciaCondenatoriaAbsolutoriaService)

  private readonly fb = inject(FormBuilder)

  private readonly dialogService = inject(DialogService)

  private readonly gestionCasoService = inject(GestionCasoService)

  private readonly maestrosService = inject(MaestroService)

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly sujetoProcesalService = inject(SujetoProcesalService)

  protected registroResolucionIncoacionService = inject(RegistroResolucionIncoacionService)

  protected readonly iconUtil = inject(IconUtil)

  protected ID_N_TIPO_SENTENCIA = ID_N_TIPO_SENTENCIA

  private readonly suscripciones: Subscription[] = []

  protected ACCION_CREAR = TIPO_ACCION.CREAR

  protected ACCION_VER = TIPO_ACCION.VISUALIZAR

  protected ACCION_EDITAR = TIPO_ACCION.EDITAR

  protected formRegistro: any

  protected tiposSentencia: any[] = []

  protected dataPena!: DataPena

  protected accionPena: TIPO_ACCION = TIPO_ACCION.CREAR

  protected listaSentencias: any = []

  protected listarSujetos: any = []

  protected listarDelitos: any = []

  protected mostrarModalVerEditar: boolean = false

  protected idActoTramiteDelitoSujeto: string = ''

  protected idPena: string = ''

  protected actualizandoTramiteInterno = false

  protected existenRegistrosReparcionCivil: boolean = false

  protected reparacionCivil: boolean = false

  protected mostrarReparacionCivil: boolean = false

  protected longitudMaximaObservaciones: number = 2000

  protected audiosAudienciaCorrectos: boolean = false

  protected ocultarBotonGestionVideos: boolean = true

  ngOnInit(): void {
    if (!this.tramiteNoDespachadoMesa) {
      this.setearDataPena();
      this.inicializarFormulario();
      this.listarSentencias();
      this.obtenerTipoSentencia();
      this.obtenerDatosTramite();
      if (!this.esPosibleEditarFormulario) {
        this.deshabilitarFormulario();
      }
      this.inicializarReparacionCivil();
    }
  }

  private async inicializarReparacionCivil(): Promise<void> {
    await this.comprobarSiExistenRegistrosReparacionCivil();
    if (this.existenRegistrosReparcionCivil) {
      this.actualizandoTramiteInterno = true;
      this.formRegistro.get('reparacionCivil')?.setValue(true);
      this.actualizandoTramiteInterno = false;
    }
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(suscripcion => suscripcion.unsubscribe())
  }

  get esFormularioValido(): boolean {

    const datos = this.formRegistro.getRawValue()
    const tieneDatosRequeridos =
      datos.fechaNotificacion !== null &&
      this.listaSentencias.length > 0

    return tieneDatosRequeridos
  }

  protected get esSentenciaCondenatoria(): boolean {
    return this.formRegistro.get('idTipoSentencia').value === ID_N_TIPO_SENTENCIA.CONDENATORIA
  }
  protected get esSentenciaAbsolutoria(): boolean {
    return this.formRegistro.get('idTipoSentencia').value === ID_N_TIPO_SENTENCIA.ABSOLUTORIA
  }
  protected get esSentenciaReparacionExclusiva(): boolean {
    return this.formRegistro.get('idTipoSentencia').value === ID_N_TIPO_SENTENCIA.REPARACION_CIVIL_EXCLUSIVA
  }
  protected get tieneReparacionCivil(): boolean {
    return this.formRegistro.get('reparacionCivil').value
  }
  protected get esReparacionCivilExclusiva(): boolean {
    return this.formRegistro.get('reparacionExclusiva').value
  }

  protected cambiarTipoSentencia(value: any): void {
    if (value == ID_N_TIPO_SENTENCIA.ABSOLUTORIA || value == ID_N_TIPO_SENTENCIA.REPARACION_CIVIL_EXCLUSIVA) {
      this.listarSujetosDelitos()
      this.limpiarSujetoDelitoSentencia()
    }
  }
  protected limpiarSujetoDelitoSentencia(): void {
    this.listarDelitos = []
    this.formRegistro.get('sujetoProcesal').setValue('')
    this.formRegistro.get('delito').setValue('')
    this.formRegistro.get('observacionesSujetoDelito').setValue('')
    this.formRegistro.get('reparacionExclusiva').setValue(false)

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
    this.suscripciones.push(
      this.sujetoProcesalService.obtenerDelitosPorSujeto(idSujetoCaso).subscribe({
        next: resp => {
          this.listarDelitos = resp
        }
      })
    )
  }

  protected agregarSujetoDelitoSentencia() {
    const datos = this.formRegistro.getRawValue()
    const request = {
      idSujetoCaso: datos.sujetoProcesal,
      idDelitoSujeto: datos.delito,
      idSentencia: datos.idTipoSentencia,
      observaciones: datos.observacionesSujetoDelito
    }

    this.suscripciones.push(
      this.autoSentenciaCondenatoriaAbsolutoriaService.guardarSujetoDelitoTramite(this.idActoTramiteCaso, request).subscribe({
        next: (resp: any) => {
          if (resp?.codigo == 0) {
            this.modalDialogService.success('REGISTRO CORRECTAMENTE', 'El sujeto y el delito han sido agregados correctamente junto con la sentencia.', 'Aceptar')
            this.listarSentencias()
            this.limpiarSujetoDelitoSentencia()
          }
          else {
            const sujeto = this.listarSujetos.find((item: any) => item.idSujetoCaso === datos.sujetoProcesal).nombre;
            const delito = this.listarDelitos.find((item: any) => item.id === datos.delito).delito;
            this.modalDialogService.warning("REGISTRO DUPLICADO", `Los datos del sujeto procesal ${sujeto} con el delito ${delito} ya se encuentra registrado en otra sentencia. Por favor, verifique la información e intentelo nuevamente`, 'Aceptar');
          }
        },
        error: () => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar guardar la información del sujeto y los delitos`, 'Aceptar')
        }
      })
    )
  }

  protected eliminarSentenciaSujetoDelito(sentencia: any): void {

    const dialog = this.modalDialogService.question("Eliminar sentencia",
      "A continuación, se eliminará el registro de la sentencia de " + sentencia.sujeto + " ¿Está seguro de realizar la siguiente acción?", 'Aceptar', 'Cancelar')

    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.suscripciones.push(
            this.autoSentenciaCondenatoriaAbsolutoriaService.eliminarSujetoDelitoTramite(sentencia.idActoTramiteDelitoSujeto).subscribe({
              next: resp => {
                if (resp?.codigo === 0) {
                  this.modalDialogService.success("Éxito", 'Sentencia eliminada correctamente', 'Aceptar')
                  this.listarSentencias()
                  this.limpiarSujetoDelitoSentencia()
                }
              },
              error: (error) => {
                if (error.error.message.includes('NO ES POSIBLE ELIMINAR LA SENTENCIA YA QUE SE HA ENCONTRADO UNA REPARACIÓN CIVIL ASOCIADA')) {
                  this.modalDialogService.warning("NO SE PUEDE ELIMINAR", "Tener en cuenta que el sujeto procesal tiene una reparación civil asociada. Por favor, elimine esta información para poder eliminar la sentencia.", 'Aceptar')
                  return
                }
                this.modalDialogService.error("ERROR", "Error al intentar eliminar la sentencia", 'Aceptar')
              }
            })
          )
        }
      }
    })

  }

  get validarAgregarSujetoDelito(): boolean {
    const datos = this.formRegistro.getRawValue()
    return datos.sujetoProcesal == '' || datos.delito == '' || (validString(datos.delito)!.length > this.longitudMaximaObservaciones)
  }

  get esPosibleEditarPorEstado(): boolean {
    return !this.tramiteEstadoRecibido
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion ? this.tramiteEnModoEdicion : this.esPosibleEditarPorEstado
  }

  private inicializarFormulario(): void {
    this.formRegistro = this.fb.group({
      fechaNotificacion: [null, Validators.required],
      cuentaConAudio: [false],
      cuentaConVideo: [false],
      reparacionExclusiva: [false],
      sujetoProcesal: [''],
      delito: [''],
      observacionesSujetoDelito: [''],
      idTipoSentencia: [''],
      observaciones: [''],
      reparacionCivil: [false],
    })
  }


  private obtenerDatosTramite(): void {
    this.suscripciones.push(
      this.autoSentenciaCondenatoriaAbsolutoriaService.obtenerDatosTramite(this.idActoTramiteCaso).subscribe({
        next: (resp: SentenciaCondenatoriaAbsolutoria) => {
          if (resp) {
            this.establecerValoresFormularioRecibido(resp)
          }
        }
      })
    )
  }

  private establecerValoresFormularioRecibido(data: SentenciaCondenatoriaAbsolutoria): void {
    this.formRegistro.patchValue({
      fechaNotificacion: data.fechaNotificacion,
      cuentaConAudio: data.conAudio === '1',
      cuentaConVideo: data.conVideo === '1',
      observaciones: data.observaciones,
      reparacionCivil: data.conReparacionCivil === '1',
    })
    !this.esPosibleEditarFormulario && this.deshabilitarFormulario()
  }

  private obtenerTipoSentencia(): void {
    this.suscripciones.push(
      this.maestrosService.obtenerCatalogo('ID_N_TIPO_SENTENCIA').subscribe({
        next: resp => {
          this.tiposSentencia = resp.data
            .map((data: any) => ({ id: data.id, nombre: data.noDescripcion }))
        }
      })
    )
  }

  private setearDataPena(): void {
    this.dataPena = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso
    }
  }

  private listarSentencias(): void {
    this.suscripciones.push(
      this.autoSentenciaCondenatoriaAbsolutoriaService.listarSentencias(this.idActoTramiteCaso).subscribe({
        next: resp => {
          this.listaSentencias = resp
        }, error: () => {
          this.modalDialogService.error("ERROR", "Se ha producido un error al intentar listar las sentencias", 'Aceptar')
        }
      })
    )
  }


  private mostrarMensajeDeExito(titulo: string, descripcion: string, textoBotonConfirmar?: string): void {
    this.modalDialogService.success(
      titulo,
      descripcion,
      textoBotonConfirmar
    )
  }

  private recargarPagina(): void {
    window.location.reload()
  }

  private deshabilitarFormulario(): void {
    this.formRegistro.disable()
  }

  private async comprobarSiExistenRegistrosReparacionCivil(): Promise<ValidarReparacionCivil> {
    const respuestaReparacionCivil = await firstValueFrom(
      this.autoSentenciaCondenatoriaAbsolutoriaService.validarNoExisteReparacionCivil(this.idActoTramiteCaso)
    )
    this.existenRegistrosReparcionCivil = !respuestaReparacionCivil.noExistenRegistros
    return respuestaReparacionCivil
  }

  protected gestionarVideos(): void {
    console.log('Llamar a CUS.PRO.REU.050 - Gestionar videos')
  }

  protected gestionarAudios(): void {
    console.log('Llamar a CUS.PRO.REU.049 - Gestionar audios')
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

  protected respuestaFormularioPena(data: any) {
    data?.respuesta && this.listarSentencias()
    if (this.accionPena === TIPO_ACCION.VISUALIZAR || this.accionPena === TIPO_ACCION.EDITAR) {
      this.mostrarModalVerEditar = false
    }
  }

  protected abrirVerEditarModal(idActoTramiteDelitoSujeto: string, idPena: string, accion: number): void {

    this.mostrarModalVerEditar = true
    this.accionPena = accion
    this.idActoTramiteDelitoSujeto = idActoTramiteDelitoSujeto
    this.idPena = idPena

  }

  protected eliminarPena(pena: any): void {

    const dialog = this.modalDialogService.question("Eliminar Pena",
      "A continuación, se eliminará el registro de pena de " + pena.sujeto + " ¿Está seguro de realizar la siguiente acción?", 'Aceptar', 'Cancelar')

    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.suscripciones.push(
            this.autoSentenciaCondenatoriaAbsolutoriaService.eliminarPena(pena.idPena).subscribe({
              next: resp => {
                if (resp?.codigo === 0) {
                  this.modalDialogService.info("Éxito", 'Pena eliminada correctamente', 'Aceptar')
                  this.listarSentencias()
                }
              },
              error: (error) => {
                if (error.error.message.includes('NO ES POSIBLE ELIMINAR LA PENA YA QUE SE HA ENCONTRADO UNA REPARACIÓN CIVIL ASOCIADA')) {
                  this.modalDialogService.warning("NO SE PUEDE ELIMINAR", "Tener en cuenta que el sujeto procesal tiene una reparación civil asociada. Por favor, elimine esta información para poder eliminar la pena.", 'Aceptar')
                  return
                }
                this.modalDialogService.error("ERROR", "Error al intentar eliminar la pena", 'Aceptar')
              }
            })
          )
        }
      }
    })

  }

  protected async seleccionarReparacionCivil(valor: boolean): Promise<void> {

    if (this.actualizandoTramiteInterno) {
      return
    }
    let nuevoValor: boolean = valor

    setTimeout(() => {
      this.actualizandoTramiteInterno = true
      this.formRegistro.get('reparacionCivil').setValue(!nuevoValor)
      this.actualizandoTramiteInterno = false
    }, 0)

    const respuestaReparacionCivil: ValidarReparacionCivil = await this.comprobarSiExistenRegistrosReparacionCivil()

    if (!nuevoValor && this.existenRegistrosReparcionCivil) {
      let reparacionesCiviles: string = ''
      for (let reparacion of respuestaReparacionCivil.reparaciones) {
        reparacionesCiviles += `&#x2022 ${reparacion} <br />`
      }
      const dialog = this.modalDialogService.warning(
        'ELIMINAR REPARACIÓN CIVIL',
        `Esta acción eliminará la información registrada de las siguientes reparaciones civiles: <br />
         ${reparacionesCiviles}
         ¿Está seguro de realizar esta acción?
        `,
        'Aceptar',
        true,
        'Cancelar'
      )
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.eliminarReparacionCivilMasiva()
          }
        }
      })
      return
    }

    this.actualizandoTramiteInterno = true
    this.formRegistro.get('reparacionCivil').setValue(nuevoValor)
    this.actualizandoTramiteInterno = false
  }

  protected eliminarReparacionCivilMasiva(): void {
    this.suscripciones.push(
      this.autoSentenciaCondenatoriaAbsolutoriaService.eliminarMasivamenteReparacionCivil(this.idActoTramiteCaso).subscribe({
        next: () => {
          this.mostrarMensajeDeExito('Reparación civil eliminada', 'Se eliminó correctamente la información de las reparaciones civiles registradas.', 'Aceptar')
          this.actualizandoTramiteInterno = true
          this.formRegistro.get('reparacionCivil').setValue(false)
          this.actualizandoTramiteInterno = false
        }
      })
    )
  }

  protected registrarReparacionCivil(): void {
    this.mostrarReparacionCivil = true
  }

  protected cerrarReparacionCivil = () => {
    this.mostrarReparacionCivil = false
    this.comprobarSiExistenRegistrosReparacionCivil()
  }

  protected guardarTramite(): void {
    const dialog = this.modalDialogService.question(
      '',
      `A continuación, se procederá a guardar <b>el trámite</b> de <b>${this.nombreTramite()}</b> ¿Está seguro de realizar la siguiente acción?`,
      'Aceptar',
      'Cancelar'
    )
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.guardarSentenciaCondenatoriaAbsolutoria()
        }
      }
    })
  }

  protected guardarSentenciaCondenatoriaAbsolutoria(): void {
    const datos = this.formRegistro.getRawValue()
    const datosSentencia = {
      fechaNotificacion: datos.fechaNotificacion,
      conAudio: datos.cuentaConAudio ? '1' : '0',
      conVideo: datos.cuentaConVideo ? '1' : '0',
      observaciones: datos.observaciones
    }
    this.suscripciones.push(
      this.autoSentenciaCondenatoriaAbsolutoriaService.guardarTramite(
        this.idActoTramiteCaso,
        datosSentencia
      ).subscribe({
        next: () => {
          this.tramiteEnModoEdicion = false
          this.idEstadoTramite = ESTADO_REGISTRO.RECIBIDO
          this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
          this.deshabilitarFormulario()
          this.formRegistro.get('idTipoSentencia')?.setValue('');

          this.modalDialogService.success('', `Se registró la información de la <b>${this.nombreTramite()}</b> .`, 'Aceptar')
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

  protected abrirModalVideosAudiencia(): void {
    const ref = this.dialogService.open(GestionAudiosComponent, {
      showHeader: false,
      width: '80%',
      contentStyle: { padding: '0' },
      data: {
        idCaso: this.idCaso,
        tituloModal: 'Audios de la audiencia',
        idActoTramiteCaso: this.idActoTramiteCaso,
        modoLectura: this.tramiteEstadoRecibido
      },
    });

    ref.onClose.subscribe(() => {
      this.obtenerValidacionAudiosAudiencia();
    });
  }
  protected obtenerValidacionAudiosAudiencia() {
    this.audiosAudienciaCorrectos = false;
    this.suscripciones.push(
      this.registroResolucionIncoacionService
        .validarAudiosDeAudiencia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            if (resp.data !== null && resp.data === '1') {
              this.audiosAudienciaCorrectos = true;
            }
          }
        })
    );
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
  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }
  protected validarColumnasTabla(data: any): string {
    return valid(data) ? data : '-';
  }
}
