import { NgClass } from '@angular/common'
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
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
import { capitalizedFirstWord, valid } from '@core/utils/string'
import { RegistrarPenasComponent } from '@core/components/reutilizable/registrar-penas/registrar-penas.component'
import { TIPO_ACCION } from '@core/types/tipo-accion.type'
import { DataPena } from '@core/interfaces/reusables/registrar-penas/data-pena.interface'
import { TableModule } from 'primeng/table'
import { CmpLibModule } from 'dist/cmp-lib'
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { DialogModule } from 'primeng/dialog'
import { ConclusionAnticipadaService } from '@core/services/provincial/tramites/interoperabilidad/conclusion-anticipada/auto-rechaza-conclusion-anticipada/conclusion-anticipada.service'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service'
import { SentenciaDeterminaConclusionAnticipada } from '@core/interfaces/provincial/tramites/interoperabilidad/conclusion-anticipada/determina-conclusion-anticipada/sentencia-determina-conclusion.interface'
import { RegistrarReparacionCivilComponent } from '@core/components/reutilizable/registrar-reparacion-civil/registrar-reparacion-civil.component'
import { EncabezadoModalComponent } from '@core/components/modals/encabezado-modal/encabezado-modal.component'
import { ValidarReparacionCivil } from '@core/interfaces/provincial/tramites/interoperabilidad/conclusion-anticipada/determina-conclusion-anticipada/validar-reparacion-civil.interface'
import { RegistrarPenasService } from '@core/services/reusables/otros/registrar-penas.service'
import { NO_GRUPO_CATALOGO } from '@core/types/grupo-catalago'
import { ContadorFooterTextareaComponent } from "@core/components/reutilizable/contador-footer-textarea/contador-footer-textarea.component";
import { GestionAudiosComponent } from '@core/components/modals/gestion-audios/gestion-audios.component'
import { RegistroResolucionIncoacionService } from '@core/services/provincial/tramites/especiales/incoacion/registro-resolucion-incoacion.service'
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component'
@Component({
  selector: 'app-sentencia-determina-conclusion-anticipada',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
    CalendarModule,
    NgClass,
    CheckboxModule,
    DropdownModule,
    RegistrarPenasComponent,
    RegistrarReparacionCivilComponent,
    TableModule,
    CmpLibModule,
    DialogModule,
    NgxCfngCoreModalDialogModule,
    EncabezadoModalComponent,
    ContadorFooterTextareaComponent,
    PaginatorComponent
],
  providers: [ 
    DialogService,
    DynamicDialogConfig,
  ],
  templateUrl: './registrar-sentencia-determina-conclusion-anticipada.component.html',
  styleUrl: './registrar-sentencia-determina-conclusion-anticipada.component.scss'
})
export class RegistrarSentenciaDeterminaConclusionAnticipadaComponent implements OnInit, OnDestroy {

  protected idCaso!: string

  protected idActoTramiteCaso!: string

  public idEtapa!: string

  public numeroCaso!: string

  protected tramiteSeleccionado: TramiteProcesal | null = null

  /**protected tramiteEnModoEdicion: boolean = false**/
  @Input() tramiteEnModoEdicion: boolean = false;

  protected idEstadoTramite!: number

  protected idEstadoRegistro!: number

  private readonly casoService = inject(Casos)

  private readonly conclusionAnticipadaService = inject(ConclusionAnticipadaService)

  private readonly constructorFormulario = inject(FormBuilder)

  private readonly dialogService = inject(DialogService)

  private readonly gestionCasoService = inject(GestionCasoService)

  private readonly maestrosService = inject(MaestroService)

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly registrarPenasService = inject(RegistrarPenasService)

  private readonly registroResolucionIncoacionService = inject(RegistroResolucionIncoacionService)

  protected readonly iconUtil = inject(IconUtil)

  private readonly tramiteService = inject(TramiteService)

  private readonly SENTENCIA_CONDENATORIA = 1334

  private readonly SENTENCIA_TOTAL_POR_PLURALIDAD: number = 1362

  private readonly suscripciones: Subscription[] = []

  protected ACCION_CREAR = TIPO_ACCION.CREAR

  protected ACCION_VER = TIPO_ACCION.VISUALIZAR

  protected ACCION_EDITAR = TIPO_ACCION.EDITAR
  
  protected formularioSetencia: any

  protected sujetosProcesales: any[] = []

  protected tiposResultado: any[] = []

  protected tiposSentencia: any[] = []

  protected tipoSentencia: number = 0

  protected dataPena!: DataPena

  protected accionPena: TIPO_ACCION = TIPO_ACCION.CREAR

  protected listaPenas: any = []

  protected listaPenasFiltrado: any = [];

  protected mostrarModalVerEditar: boolean = false

  protected idActoTramiteDelitoSujeto: string = ''

  protected idPena: string = ''

  protected actualizandoInternamente = false

  protected existenRegistrosReparcionCivil: boolean = false

  protected reparacionCivil: boolean = false

  protected mostrarReparacionCivil: boolean = false
  
  protected longitudMaximaObservaciones: number = 200;

  protected audiosAudienciaCorrectos: boolean = false

  protected ocultarBotonGestionVideos: boolean = true;

  protected flagregistrar: boolean = false;

  protected query: any = { limit: 10, page: 1, where: {} };
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

ngOnInit(): void {
  this.tramiteService.verIniciarTramite = false;
  this.setearDataPena();
  this.formularioSetencia = this.construirFormulario();
  this.obtenerValidacionAudiosAudiencia();
  this.listarPenas();
  this.obtenerTipoResultadosSentencia();
  this.obtenerTipoSentencia();
  this.obtenerSujetosProcesales();

  if (this.tieneActoTramiteCasoDocumento) {
    this.obtenerDetalleActoTramiteCaso();
  }
  if (!this.esPosibleEditarFormulario) {
    this.bloquearFormulario(true);
  }

  this.formularioSetencia.get('idTipoSentencia')?.disable();
  this.inicializarDatosAsincronos();
}

private async inicializarDatosAsincronos(): Promise<void> {
  await this.comprobarSiExistenRegistrosReparacionCivil();
  if (this.existenRegistrosReparcionCivil) {
    this.actualizandoInternamente = true;
    this.formularioSetencia.get('reparacionCivil')?.setValue(true);
    this.actualizandoInternamente = false;
  }
}

  ngOnDestroy(): void {
    this.suscripciones.forEach( suscripcion => suscripcion.unsubscribe() )
  }

  protected bloquearFormulario(bloquear: boolean) {
    this.flagregistrar = bloquear;
    bloquear ? this.formularioSetencia.disable() : this.formularioSetencia.enable();
  }

  protected activarFormulario(event: boolean) {
    this.tramiteService.verIniciarTramite = event;
  }

  get esFormularioValido(): boolean {

    const datos = this.formularioSetencia.getRawValue() 
    const idsPenas = new Set(this.listaPenas.map((pena: any) => pena.idSujetoCaso))
  
    const tieneDatosRequeridos = 
      datos.resultado !== null &&
      datos.fechaNotificacion !== null &&
      datos.idTipoSentencia !== null &&
      this.listaPenas.length > 0
  
    const esSentenciaTotalPorPluralidad =
      datos.resultado === this.SENTENCIA_TOTAL_POR_PLURALIDAD &&
      this.sujetosProcesales.every(sujeto => idsPenas.has(sujeto.id))
  
    const esOtroTipoDeSentencia = datos.resultado !== this.SENTENCIA_TOTAL_POR_PLURALIDAD
  
    return tieneDatosRequeridos && (esSentenciaTotalPorPluralidad || esOtroTipoDeSentencia)
  }

  get esSentenciaCondenatoria(): boolean {
    return this.formularioSetencia.get('idTipoSentencia').value === this.SENTENCIA_CONDENATORIA
  }

  get tieneReparacionCivil(): boolean {
    return this.formularioSetencia.get('reparacionCivil').value
  }

  get esPosibleEditarPorEstado(): boolean {
    return !this.tramiteEstadoRecibido
  }

  get esPosibleEditarFormulario(): boolean {
    if (this.tramiteEstadoRecibido) {
      return false;
    }
    return this.tramiteEnModoEdicion ? this.tramiteEnModoEdicion : (this.flagregistrar ? false : this.esPosibleEditarPorEstado)
  }

  get obtenerObservacionContador(): number {
    const observacion = this.formularioSetencia.get('observaciones')?.value
    return observacion ? observacion.length : 0
  }

  private construirFormulario(): FormGroup {
    return this.constructorFormulario.group({
      resultado: [ this.SENTENCIA_TOTAL_POR_PLURALIDAD, Validators.required ],
      fechaNotificacion: [ null, Validators.required ],
      cuentaConAudio: [ false ],
      cuentaConVideo: [ false ],
      observaciones: [ '' , [Validators.maxLength(this.longitudMaximaObservaciones)]],
      idTipoSentencia: [ this.SENTENCIA_CONDENATORIA, Validators.required ],
      reparacionCivil: [ false ],
    })
  }

  private obtenerDetalleActoTramiteCaso(): void {
    this.casoService.actoTramiteDetalleCaso( this.idActoTramiteCaso )
      .subscribe({
        next: (resp: any) => {
          this.idEstadoRegistro = resp.idEstadoTramite
          this.obtenerDatosTramite();
        }
    })
  }

  private obtenerDatosTramite() {
    if ( this.tramiteEstadoRecibido ) {
      this.obtenerSentenciaDeterminaConclusionAnticipada()
    }
  }

  private obtenerSentenciaDeterminaConclusionAnticipada(): void {
    this.suscripciones.push(
      this.conclusionAnticipadaService.obtenerSentenciaDeterminaConclusionAnticipada( this.idActoTramiteCaso ).subscribe({
        next: (resp: SentenciaDeterminaConclusionAnticipada) => {
          this.establecerValoresFormularioRecibido( resp )
        }
      })
    )
  }

  private establecerValoresFormularioRecibido(data: SentenciaDeterminaConclusionAnticipada): void {
    this.formularioSetencia.patchValue({
      resultado: data.idResultado,
      fechaNotificacion: data.fechaNotificacion,
      cuentaConAudio: data.conAudio === '1',
      cuentaConVideo: data.conVideo === '1',
      idTipoSentencia: data.idTipoSentencia,
      observaciones: data.observaciones,
      reparacionCivil: data.conReparacionCivil === '1',
    })
    /**!this.esPosibleEditarFormulario && this.deshabilitarFormulario()**/
  }

  private obtenerTipoResultadosSentencia(): void {
    this.suscripciones.push(
      this.maestrosService.obtenerCatalogo(NO_GRUPO_CATALOGO.SENTENCIA_CONCLUSION_ANTICIPADA).subscribe({
        next: resp => {
          this.tiposResultado = resp.data.map((data: any) => ({ codigo: data.id, nombre: capitalizedFirstWord(data.noDescripcion) }))
        }
      })
    )
  }

  private obtenerTipoSentencia(): void {
    this.suscripciones.push(
      this.maestrosService.obtenerCatalogo(NO_GRUPO_CATALOGO.TIPO_SENTENCIA).subscribe({
        next: resp => {
          //Solo debe filtrarse la sentencia condenatoria
          this.tiposSentencia = resp.data
          .map((data: any) => ({ id: data.id, nombre: data.noDescripcion }))
          .filter((sentencia: any) => sentencia.id === this.SENTENCIA_CONDENATORIA)
          this.tipoSentencia = this.SENTENCIA_CONDENATORIA
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

  private listarPenas(): void {
    this.suscripciones.push(
      this.conclusionAnticipadaService.obtenerPenasRegistradas(this.idActoTramiteCaso).subscribe({
        next: resp => {
          this.listaPenas = resp
          this.listaPenasFiltrado = resp.data;
          this.itemPaginado.data.data = this.listaPenasFiltrado;
          this.itemPaginado.data.total = this.listaPenas.length;
          this.updatePagedItems();
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

  private async comprobarSiExistenRegistrosReparacionCivil(): Promise<ValidarReparacionCivil> {
    const respuestaReparacionCivil = await firstValueFrom(
      this.conclusionAnticipadaService.validarNoExisteReparacionCivil(this.idActoTramiteCaso)
    )
    this.existenRegistrosReparcionCivil = !respuestaReparacionCivil.noExistenRegistros
    return respuestaReparacionCivil
  }

  private obtenerSujetosProcesales(): void {
    this.suscripciones.push(
      this.registrarPenasService.listarSujetos( this.idCaso ).subscribe({
        next: resp => {
          this.sujetosProcesales = resp
        }
      })
    )
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
    data?.respuesta && this.listarPenas()
    if ( this.accionPena === TIPO_ACCION.VISUALIZAR || this.accionPena === TIPO_ACCION.EDITAR ) {
      this.mostrarModalVerEditar = false
    }
  }

  protected abrirVerEditarModal( idActoTramiteDelitoSujeto: string, idPena: string, accion: number ): void {

    this.mostrarModalVerEditar = true
    this.accionPena = accion
    this.idActoTramiteDelitoSujeto = idActoTramiteDelitoSujeto
    this.idPena = idPena

  }

  protected eliminarPena( pena: any ): void {

    const dialog = this.modalDialogService.question("Eliminar Pena", 
      "A continuación, se eliminará el registro de pena de " + pena.sujeto + " ¿Está seguro de realizar la siguiente acción?", 'Aceptar', 'Cancelar')

    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.suscripciones.push(
            this.conclusionAnticipadaService.eliminarPena( pena.idActoTramiteDelitoSujeto ).subscribe({
              next: resp => {
                if (resp?.code === "0") {
                  this.modalDialogService.info("Éxito", 'Pena eliminada correctamente', 'Aceptar')
                  this.listarPenas();
                }
              },
              error: ( error ) => {
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

  protected async alDarClicEnReparacionCivil(valor: boolean): Promise<void> {

    if (this.actualizandoInternamente) {
      return
    }
    let nuevoValor: boolean = valor

    setTimeout(() => {
      this.actualizandoInternamente = true
      this.formularioSetencia.get('reparacionCivil').setValue(!nuevoValor)
      this.actualizandoInternamente = false
    }, 0)

    const respuestaReparacionCivil: ValidarReparacionCivil = await this.comprobarSiExistenRegistrosReparacionCivil()

    if (!nuevoValor && this.existenRegistrosReparcionCivil) {
      let reparacionesCiviles: string = ''
      for ( let reparacion of respuestaReparacionCivil.reparaciones ) {
        reparacionesCiviles += `&#x2022 ${ reparacion } <br />`
      }
      const dialog = this.modalDialogService.warning(
        'ELIMINAR REPARACIÓN CIVIL', 
        `Esta acción eliminará la información registrada de las siguientes reparaciones civiles: <br />
         ${ reparacionesCiviles }
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

    this.actualizandoInternamente = true
    this.formularioSetencia.get('reparacionCivil').setValue(nuevoValor)
    this.actualizandoInternamente = false
  }

  protected eliminarReparacionCivilMasiva(): void {
    this.suscripciones.push(
      this.conclusionAnticipadaService.eliminarMasivamenteReparacionCivil(this.idActoTramiteCaso).subscribe({
        next: () => {
          this.mostrarMensajeDeExito('Reparación civil eliminada', 'Se eliminó correctamente la información de las reparaciones civiles registradas.', 'Aceptar')
          this.actualizandoInternamente = true
          this.formularioSetencia.get('reparacionCivil').setValue(false)
          this.actualizandoInternamente = false
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

  protected preguntarGuardadoSentenciaDeterminaConclusionAnticipada(): void {
    const dialog = this.modalDialogService.question(
      '', 
      `A continuación, se procederá a guardar <b>el trámite</b> de <b>Resolución - sentencia que determina conclusión anticipada.</b> ¿Está seguro de realizar la siguiente acción?`,
      'Aceptar',
      'Cancelar'
    )
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.guardadoSentenciaDeterminaConclusionAnticipada()
        }
      }
    })
  }

  protected guardadoSentenciaDeterminaConclusionAnticipada(): void {
    const datos = this.formularioSetencia.getRawValue()
    const datosSentencia = {
      idResultado: datos.resultado,
      fechaNotificacion: datos.fechaNotificacion,
      /**conAudio: datos.cuentaConAudio ? '1' : '0',**/
      conAudio: this.audiosAudienciaCorrectos ? '1' : '0',
      /**conVideo: datos.cuentaConVideo ? '1' : '0',**/
      conVideo: this.ocultarBotonGestionVideos ? '0' : '1',
      observaciones: datos.observaciones,
      idTipoSentencia: datos.idTipoSentencia,
    }
    this.suscripciones.push(
      this.conclusionAnticipadaService.guardarSentenciaDeterminaConclusionAnticipada(
        this.idActoTramiteCaso,
        datosSentencia       
      ).subscribe({
        next: () => {
          this.tramiteEnModoEdicion = false; 
          this.idEstadoRegistro = ESTADO_REGISTRO.RECIBIDO
          this.gestionCasoService.obtenerCasoFiscal( this.idCaso )
          //this.deshabilitarFormulario()
          this.bloquearFormulario(true);
          this.modalDialogService.success('', 'Se registró la información de la <b>Resolución -  sentencia que determina conclusión anticipada</b>.', 'Aceptar')
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
    if(this.idActoTramiteCaso!=null){
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

  protected validarObservacion(input: string): boolean {
    return valid(this.formularioSetencia.get(input)?.value)
  }

  protected get multimediaSeleccionado(): boolean {
    return ['cuentaConAudio', 'cuentaConVideo'].some(
      campo => this.formularioSetencia.get(campo)?.value
    );
  }

  mostrarBotonGuardar(): boolean {
    return this.tramiteEstadoRecibido ? false : !this.flagregistrar;
  }

  protected icono(name: string): string {
      return icono(name);
  }

  protected eventoOnPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  private updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.listaPenasFiltrado = this.listaPenas.slice(start, end);
  }

}