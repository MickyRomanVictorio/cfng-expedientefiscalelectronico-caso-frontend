import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core'
import { CommonModule } from '@angular/common'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { catchError, firstValueFrom, map, Observable, Subscription, tap, throwError, timeout } from 'rxjs'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms'
import { InputTextModule } from 'primeng/inputtext'
import { CheckboxModule } from 'primeng/checkbox'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { obtenerIcono } from '@utils/icon'
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer'
import { getValidString, TIPO_OFICIO, TRAMITES, validOnlyNumberOnPaste, validOnlyNumbers, TIPO_COPIA, RESPUESTA_MODAL, ESTADO_REGISTRO } from 'ngx-cfng-core-lib'
import { DropdownModule } from 'primeng/dropdown'
import { RadioButtonModule } from 'primeng/radiobutton'
import { archivoFileToB64, base64ToFile, formatoPesoArchivo} from "@utils/file"
import { InputTextareaModule } from "primeng/inputtextarea"
import { TableModule } from "primeng/table"
import {
  VisorPdfCargoComponent
} from "@components/registrar-presentacion-disposiciones/visor-pdf-cargo/visor-pdf-cargo.component"
import { AdjuntoData } from "@components/generales/visor-pdf-frame/adjunto-data.interface"
import { DomSanitizer } from "@angular/platform-browser"
import { NgxSpinnerService } from "ngx-spinner"
import { Catalogo } from "@interfaces/comunes/catalogo"
import { DatosFirma } from "@interfaces/reusables/firma-digital/datos-firma.interface"
import { CfeDialogRespuesta , NgxCfngCoreModalDialogService} from '@ngx-cfng-core-modal/dialog'
import { BACKEND } from "@environments/environment"
import { FirmaIndividualService } from "@services/firma-digital/firma-individual.service"
import { RepositorioDocumentoService } from "@services/generales/repositorio-documento.service"
import { FirmaDigitalClienteComponent, FirmaDigitalClienteService, FirmaInterface} from 'ngx-cfng-core-firma-digital'
import { MaestroService } from "@services/shared/maestro.service"
import { SLUG_SIGN } from "@constants/mesa-unica-despacho"
import { TramitesGenericosService } from "@services/provincial/tramites/genericos/tramites-genericos.service"
import { SujetoProcesal, TramiteGenerico } from "@interfaces/provincial/tramites/genericos/tramite-generico.interface"
import { CasoStorageService } from "@services/shared/caso-storage.service"
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component'
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { ID_TIPO_ORIGEN } from '@core/types/tipo-origen.type'
import { MultiSelectModule } from 'primeng/multiselect'
import { BusquedaRucComponent } from '@core/components/modals/busqueda-ruc/busqueda-ruc.component'
import { DialogService } from 'primeng/dynamicdialog'
import { ButtonModule } from 'primeng/button'
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { capitalizedFirstWord } from '@core/utils/string'

const {
  ACTA,
  DECLARACION,
  OFICIO,
  RAZON,
  PROVIDENCIA,
  CONSTANCIA,
  DISPOSICIÓN,
  ESCRITO,
  INFORME,
  REQUERIMIENTO,
  REMITE_DOCUMENTO,
  RECIBE_DOCUMENTO,
  RESULTADO_DE_OFICIO,
} = TRAMITES

@Component({
  selector: 'app-genericos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    CheckboxModule,
    CmpLibModule,
    NgxExtendedPdfViewerModule,
    DropdownModule,
    RadioButtonModule,
    InputTextareaModule,
    TableModule,
    VisorPdfCargoComponent,
    FirmaDigitalClienteComponent,
    MensajeCompletarInformacionComponent,
    MultiSelectModule,
    ButtonModule
  ],
  templateUrl: './genericos.component.html',
  styleUrls: ['./genericos.component.scss'],
  providers: [ NgxCfngCoreModalDialogService, FirmaDigitalClienteService ]
})
export class GenericosComponent implements OnInit, OnDestroy, OnChanges {

  @Input() idCaso: string = ''
  @Input() etapa: string = ''
  @Input() idEtapa: string = ''
  @Input() tramiteSeleccionado: TramiteProcesal | null = null
  @Input() idActoTramiteCaso: string = ''
  @Input() files: any[] = []
  @Input() deshabilitado: boolean = false
  @Input() tramiteEnModoEdicion: boolean = false

  @Output() peticionParaEjecutar = new EventEmitter<() => any>()

  protected TRAMITES = TRAMITES
  protected obtenerIcono = obtenerIcono
  protected genericosFormulario!: FormGroup
  protected sujetosProcesales: SujetoProcesal[] = []
  protected mostrarFormularioAlterno: boolean = false
  protected extenderActoInvestigacion: boolean = false
  protected mostrarActoInvestigacion: boolean = false
  protected maximoCaracteresObservacion = 1000
  protected contadorCaracteresObservacion = 0
  private idEstadoRegistro: number = 0

  protected documentoCargado: boolean = false
  protected documentoAdjunto!: AdjuntoData
  protected tipoCopias: Catalogo[] = []
  protected tipoCopiaSeleccionada: Catalogo | null = null
  protected esFirmadoGuardado: boolean = false
  protected documentos: any[] = []

  private readonly suscripciones: Subscription[] = []
  private datosFirma!: DatosFirma
  private nombreDocumentoCargado!: string

  protected readonly formatoPesoArchivo = formatoPesoArchivo
  private datosFormulario: TramiteGenerico = {}
  private datosFormularioGuardado: TramiteGenerico = {}
  protected tipoOficios: any[] = []

  public TIPO_OFICIO = TIPO_OFICIO

  constructor(
    private readonly formulario: FormBuilder,
    private readonly sanitizer: DomSanitizer,
    private readonly spinner: NgxSpinnerService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly firmaIndividualService: FirmaIndividualService,
    private readonly firmaDigitalClienteService: FirmaDigitalClienteService,
    private readonly repositorioDocumentoService: RepositorioDocumentoService,
    private readonly maestroService: MaestroService,
    private readonly tramitesGenericosService: TramitesGenericosService,
    private readonly casoStorageService: CasoStorageService,
    private readonly tramiteService: TramiteService,
    private readonly dialogService: DialogService,
    private readonly casoService: Casos,
    private readonly gestionCasoService: GestionCasoService,
  ) {
  }

  ngOnInit(): void {

    this.inicializarFormularioGenericos()

    this.peticionParaEjecutar.emit( () => this.guardarFormularioConFirma() )

    this.esTramiteEnlazado && this.obtenerDetalleActoTramiteCaso()

    this.mostrarActoInvestigacion = this.tramiteSeleccionado?.idTramite === TRAMITES.OFICIO

    this.obtenerDatosGuardadosFormulario()

    this.evaluarCambiosEnFormulario()

    this.esDeclaracion && this.obtenerSujetosProcesales()

    this.esOficio && this.obtenerTipoOficios()

    this.suscripciones.push(
      this.firmaDigitalClienteService.processSignClient.subscribe(
        (data: any) => {
          this.procesoFirma(data);
        }
      )
    );

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deshabilitado']) {
      if (this.deshabilitado) {
        this.deshabilitarFormulario()
      }
    }
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(suscripcion => suscripcion.unsubscribe())
  }

  get esTramiteEnlazado(): boolean {
    return this.tramiteService.validacionTramite.tipoOrigenTramiteSeleccionado !== ID_TIPO_ORIGEN.EFE
  }

  get esFormularioValido(): boolean {
    const data = this.genericosFormulario.getRawValue()
    return (
      this.tramiteSeleccionado?.idTramite === ACTA &&
      getValidString(data.nombre) !== null &&
      (
        !data.esEscaneada ||
        ( data.esEscaneada &&
          data.idTipoCopia !== null &&
          getValidString(data.observaciones) !== null &&
          this.files.length > 0
        )
      )
    ) ||
    (
      this.tramiteSeleccionado?.idTramite === CONSTANCIA &&
      getValidString(data.nombre) !== null
    ) ||
    (
      this.tramiteSeleccionado?.idTramite === DECLARACION &&
      getValidString(data.nombre) !== null &&
      data.sujetosProcesales?.length > 0
    ) ||
    (
      this.tramiteSeleccionado?.idTramite === DISPOSICIÓN &&
      getValidString(data.nombre) !== null
    ) ||
    (
      this.tramiteSeleccionado?.idTramite === ESCRITO &&
      getValidString(data.nombre) !== null
    ) ||
    (
      this.tramiteSeleccionado?.idTramite === INFORME &&
      getValidString(data.nombre) !== null
    ) ||
    (
      this.tramiteSeleccionado?.idTramite === OFICIO &&
      getValidString(data.nombre) !== null &&
      data.tipoOficio !== null &&
      getValidString(data.numeroRucDestinatario) !== null &&
      getValidString(data.razonSocialDestinatario) !== null &&
      getValidString(data.numeroRucDestinatario)?.length === 11
    ) ||
    (
      this.tramiteSeleccionado?.idTramite === PROVIDENCIA &&
      getValidString(data.nombre) !== null
    ) ||
    (
      this.tramiteSeleccionado?.idTramite === RAZON &&
      getValidString(data.nombre) !== null
    ) ||
    (
      this.tramiteSeleccionado?.idTramite === REQUERIMIENTO &&
      getValidString(data.nombre) !== null
    ) ||
    (
      this.tramiteSeleccionado?.idTramite === REMITE_DOCUMENTO &&
      getValidString(data.nombre) !== null
    ) ||
    (
      this.tramiteSeleccionado?.idTramite === RECIBE_DOCUMENTO &&
      getValidString(data.nombre) !== null
    ) ||
    (
      this.tramiteSeleccionado?.idTramite === RESULTADO_DE_OFICIO &&
      getValidString(data.nombre) !== null
    )
  }

  get nombreDocumento(): string {
    return {
      [ACTA]: 'Nombre de acta',
      [PROVIDENCIA]: 'Sumilla',
      [OFICIO]: 'Asunto',
    }[this.tramiteSeleccionado!.idTramite] ?? 'Nombre'
  }

  get mostrarCheckEscaneado(): boolean {
    return this.tramiteSeleccionado!.idTramite === ACTA ||
      this.tramiteSeleccionado!.idTramite === DECLARACION
  }

  get textoEscaneado(): string {
    return {
      [ACTA]: 'Acta escaneada',
      [DECLARACION]: 'Declaración escaneada'
    }[this.tramiteSeleccionado!.idTramite] ?? 'Escaneado'
  }

  get esOficio(): boolean {
    return this.tramiteSeleccionado!.idTramite === OFICIO
  }

  get esDeclaracion(): boolean {
    return this.tramiteSeleccionado!.idTramite === DECLARACION
  }

  get esRegistroManual(): boolean {
    return this.genericosFormulario.get('esRegistroManual')!.value
  }

  get tieneDocumentoAdjunto(): boolean {
    return this.documentoAdjunto !== undefined
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoRegistro === ESTADO_REGISTRO.RECIBIDO
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion ? this.tramiteEnModoEdicion : this.esPosibleEditarPorEstado
  }

  get esPosibleEditarPorEstado(): boolean {
    return !this.tramiteEstadoRecibido
  }

  private inicializarFormularioGenericos(): void {
    this.genericosFormulario = this.formulario.group({
      nombre: [''],
      esEscaneada: [false],
      esActoInvestigacion: [false],
      sujetosProcesales: [[]],
      tipoOficio: [TIPO_OFICIO.NUEVO],
      esRegistroManual: [false],
      numeroRucDestinatario: [''],
      razonSocialDestinatario: [''],
      observaciones: ['', [Validators.maxLength(this.maximoCaracteresObservacion)]],
      idTipoCopia: [null],
      idActoTramiteCasoInv: [''],
    })
    this.genericosFormulario.get('numeroRucDestinatario')!.disable()
    this.genericosFormulario.get('razonSocialDestinatario')!.disable()
  }

  protected evaluarCambiosEnFormulario(): void {
    this.genericosFormulario.valueChanges.subscribe({
      next: () => {
        this.establecerBotonesTramiteSiCambio()
      }
    })
  }

  private establecerBotonesTramiteSiCambio(): void {
    this.obtenerValoresFormulario()
    const cambio = this.elFormularioHaCambiado()
    if ( cambio ) {
      this.formularioEditado(true)
      this.habilitarGuardar(this.esFormularioValido)
    } else if (this.esFormularioValido) {
      this.formularioEditado(false)
    } else {
      this.formularioEditado(true)
      this.habilitarGuardar(false)
    }
  }

  protected async obtenerDatosGuardadosFormulario(): Promise<void> {
    const tramite: TramiteGenerico = await firstValueFrom(this.tramitesGenericosService.obtenerTramiteGenerico(this.idActoTramiteCaso))
    if ( tramite ) {
      this.genericosFormulario.patchValue({
        nombre: tramite.asuntoDocumento,
        esEscaneada: tramite.flagEscaneadaDocumento === '1',
        esActoInvestigacion: tramite.flagActoInvestigacion === '1',
        sujetosProcesales: tramite.sujetosProcesales ?? [],
        tipoOficio: tramite.idTipoOficio === 0 ? TIPO_OFICIO.NUEVO : tramite.idTipoOficio,
        esRegistroManual: tramite.flagOficioManual === '1',
        numeroRucDestinatario: tramite.numeroRucDestinatario,
        razonSocialDestinatario: tramite.razonSocialDestinatario,
        observaciones: '',
        idTipoCopia: tramite.idTipoCopia !== 0 ? tramite.idTipoCopia : null,
        idActoTramiteCasoInv: tramite.idActoTramiteCasoInv,
      })
      this.establecerBotonesTramiteSiCambio()
    }
    this.obtenerValoresFormulario()
    this.datosFormularioGuardado = {...this.datosFormulario}
  }

  private obtenerValoresFormulario(): void {
    const formulario = this.genericosFormulario.getRawValue()
    const tramiteGenerico: TramiteGenerico = {
      etapa: this.etapa,
      idCaso: this.idCaso,
      idActoTramiteEstado: this.tramiteSeleccionado!.idActoTramiteEstado,
      nombre: formulario.nombre,
      idActoTramiteCaso: this.idActoTramiteCaso,
      flagActaEscaneada: formulario.esEscaneada ? '1' : '0',
      idActoTramiteCasoInv: formulario.esActoInvestigacion ? formulario.idActoTramiteCasoInv : null,
      asuntoDocumento: formulario.nombre,
      flagActoInvestigacion: formulario.esActoInvestigacion ? '1' : '0',
      flagEscaneadaDocumento:  formulario.esEscaneada ? '1' : '0',
      idTipoOficio: formulario.tipoOficio,
      sujetosProcesales: formulario.sujetosProcesales,
      flagOficioManual: this.obtenerFlagOficioManual(),
      numeroRucDestinatario: getValidString(formulario.numeroRucDestinatario),
      razonSocialDestinatario: formulario.razonSocialDestinatario,
      flagFuenteInvestigacionEmbebida: '',
      idDocumento: '',
      idOficioPersonaJuridica: '',
      idSujetoDeclarante:'',
      sumillaDocumento: '',
      descripcionActaEscaneada: formulario.observaciones,
      idTipoCopia: formulario.idTipoCopia,
      idTramite: this.tramiteSeleccionado!.idTramite
    }
    this.datosFormulario = { ...tramiteGenerico }
  }

  private obtenerFlagOficioManual(): string | null {
    if ( this.esOficio ) {
      return this.esRegistroManual ? '1' : '0'
    }
    return null
  }

  protected elFormularioHaCambiado(): boolean {
    return JSON.stringify(this.datosFormularioGuardado) !== JSON.stringify(this.datosFormulario)
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor
  }

  protected guardarFormularioConFirma(): Observable<any> {
    return this.tramitesGenericosService.registrarTramiteGenerico(this.datosFormulario)
    .pipe(
      tap(() => {
        this.modalDialogService.success(
          'Éxito',
          `Se guardó correctamente la información del trámite <b>${ this.tramiteSeleccionado?.nombreTramite }</b>`,
          'Aceptar'
        )
        this.datosFormularioGuardado = { ...this.datosFormulario }
      }),
      map(() => 'válido'),
        catchError(() => {
          this.modalDialogService.error(
            'Error',
            `No se pudo guardar la información del trámite <b>${ this.tramiteSeleccionado?.nombreTramite }</b>`,
            'Aceptar'
          )
        return throwError(() => new Error('Error al guardar'))
      })
    )
  }

  protected placeHolderNombreDocumento(): string {
    return {
      [OFICIO]: 'Ingrese un asunto para este documento',
      [PROVIDENCIA]: 'Ingrese la sumilla de este documento',
    }[this.tramiteSeleccionado!.idTramite] ?? 'Ingrese un nombre para este documento'
  }

  protected obtenerSujetosProcesales(): void {
    this.suscripciones.push(
      this.tramitesGenericosService.obtenerSujetosProcesalesCaso(this.idCaso).subscribe({
        next: (sujetos: any[]) => {
          this.sujetosProcesales = sujetos
        }
      })
    )
  }

  protected obtenerElementosSeleccionadosEtiqueta(): string {
    const cuenta = this.genericosFormulario?.get('sujetosProcesales')?.value?.length
    return cuenta > 0 ? `${cuenta} sujetos seleccionados` : ''
  }

  protected alCambiarRegistroManual(valor: boolean): void {
    this.genericosFormulario.get('numeroRucDestinatario')!.setValue('')
    this.genericosFormulario.get('razonSocialDestinatario')!.setValue('')
    if ( valor ) {
      this.genericosFormulario.get('numeroRucDestinatario')!.enable()
      this.genericosFormulario.get('razonSocialDestinatario')!.enable()
      return
    }
    this.genericosFormulario.get('numeroRucDestinatario')!.disable()
    this.genericosFormulario.get('razonSocialDestinatario')!.disable()
  }

  protected validarSoloNumeros(evento: KeyboardEvent): any {
    return validOnlyNumbers(evento)
  }

  protected validarSoloNumerosAlPegar(evento: ClipboardEvent): any {
    return validOnlyNumberOnPaste(evento)
  }

  protected obtenerTipoOficios(): void {
    this.suscripciones.push(
      this.maestroService.obtenerCatalogo('ID_N_TIPO_OFICIO').subscribe({
        next: (respuesta: any) => {
          this.tipoOficios = respuesta.data
            .map((tipoOficio: any) => ({
              codigo: tipoOficio.id,
              nombre: capitalizedFirstWord(tipoOficio.noDescripcion)
            }))
        }
      })
    )
  }

  protected buscarPorRuc(): void {

    this.genericosFormulario.get('esRegistroManual')!.setValue(false)
    this.genericosFormulario.get('numeroRucDestinatario')!.setValue('')
    this.genericosFormulario.get('razonSocialDestinatario')!.setValue('')
    this.genericosFormulario.get('numeroRucDestinatario')!.disable()
    this.genericosFormulario.get('razonSocialDestinatario')!.disable()

    const refModal = this.dialogService.open(
      BusquedaRucComponent,
      {
        showHeader: false,
        closable: false,
        closeOnEscape: false,
      }
    )
    refModal.onClose.subscribe((respuesta) => {
      if (respuesta) {
        const { razonSocial, numeroRuc } = respuesta
        this.genericosFormulario.get('razonSocialDestinatario')!.setValue(razonSocial)
        this.genericosFormulario.get('numeroRucDestinatario')!.setValue(numeroRuc)
      }
    })

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

  private obtenerDetalleActoTramiteCaso(): void {
    this.casoService.actoTramiteDetalleCaso( this.idActoTramiteCaso )
      .subscribe({
        next: (resp: any) => {
          this.idEstadoRegistro = resp.idEstadoTramite
          !this.esPosibleEditarFormulario && this.deshabilitarFormulario()
        }
    })
  }

  protected obtenerTituloTramite(): string {
    return {
      [ACTA]: 'Acta',
      [CONSTANCIA]: 'Constancia',
      [ESCRITO]: 'Escrito',
      [INFORME]: 'Informe',
      [OFICIO]: 'Oficio',
      [DECLARACION]: 'Declaración',
      [PROVIDENCIA]: 'Providencia',
    }[ this.tramiteSeleccionado!.idTramite ] ?? ''
  }

  protected obtenerTextoRegistradoFirmado(): string {
    return {
      [ACTA]: 'el acta',
      [DECLARACION]: 'la declaración',
    }[ this.tramiteSeleccionado!.idTramite ] ?? ''
  }

  protected contadorCaracterObservaciones(): void {
    const words = this.genericosFormulario.get('observaciones')!.value ?? ''
    this.contadorCaracteresObservacion = words.length
    if (this.contadorCaracteresObservacion >= this.maximoCaracteresObservacion) {
      const currentValue = words
      const newValue = currentValue.substring(0, this.maximoCaracteresObservacion)
      this.genericosFormulario.get('observaciones')!.setValue(newValue)
    }
  }

  protected preguntarGuardadoTramiteGenerico(): void {
    const dialog = this.modalDialogService.question(
      '',
      `A continuación, se procederá a guardar <b>el trámite</b> de <b>${ this.obtenerTituloTramite() }.</b> ¿Está seguro de realizar la siguiente acción?`,
      'Aceptar',
      'Cancelar'
    )
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.guardarTramiteGenerico()
        }
      }
    })
  }

  private guardarTramiteGenerico(): void {
    this.tramitesGenericosService.guardarTramiteGenerico(this.datosFormulario)
      .subscribe({
        next: () => {
          this.tramiteEnModoEdicion = false
          this.idEstadoRegistro = ESTADO_REGISTRO.RECIBIDO
          this.gestionCasoService.obtenerCasoFiscal( this.idCaso )
          this.deshabilitarFormulario()
          this.modalDialogService.success('', `Se registró la información de la <b>${ this.obtenerTituloTramite() }</b>.`, 'Aceptar')
        }
      })
  }

  private recargarPagina(): void {
    window.location.reload()
  }

  protected seleccionarDocumentoEscaneado(event: any): void {

    if (!event || !this.tramiteSeleccionado) return

    const { checked } = event
    const { idTramite } = this.tramiteSeleccionado

    if (!this.esTramiteEnlazado && idTramite === ACTA) {
      this.mostrarFormularioAlterno = checked
      this.tramiteService.verEditor = !checked
      if (checked && this.tipoCopias.length === 0) {
        this.obtenerTipoCopia()
      }
    }

  }

  protected obtenerTipoCopia(): void {
    const nombreGrupo = 'ID_N_TIPO_COPIA'
    this.spinner.show()
    this.suscripciones.push(
      this.maestroService.obtenerCatalogo(nombreGrupo).subscribe({
        next: resp => {
          this.tipoCopias = resp.data
          this.spinner.hide()
        },
        error: (error) => {
          this.tipoCopias = []
          this.spinner.hide()
          console.log(error)
        }
      })
    )
  }

  protected seleccionarTipoCopia(tipoCopia: Catalogo): void {
    this.tipoCopiaSeleccionada = tipoCopia
  }

  protected firmarGuardar() {
    let cfeDialog = this.modalDialogService.warning(
      'Registrar acta',
      'Está a punto de firmar digitalmente y registrar el acta cargada. <b>Esta acción no podrá revertirse.</b> ¿Desea continuar con el registro?',
      'Sí, Continuar',
      true,
      'Cancelar'
    )
    cfeDialog.subscribe({
      next: (resp) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.firmarTramite()
        }
      },
    })
  }

  private async obtenerDatosFirma() {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show()
      this.suscripciones.push(
        this.firmaIndividualService.obtenerDatosFirma().subscribe({
          next: resp => {
            this.datosFirma = resp
            this.spinner.hide()
            resolve()
          },
          error: error => {
            this.spinner.hide()
            console.log(error)
          }
        })
      )
    })
  }

  private async cargarDocumentoRepositorio() {
    return new Promise<void>((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', base64ToFile(this.documentoAdjunto.base64!)!, this.documentoAdjunto.namePdf)
      this.spinner.show()
      this.suscripciones.push(
        this.repositorioDocumentoService.guardarDocumentoRepositorio(formData).subscribe({
          next: resp => {
            this.nombreDocumentoCargado = resp.data.nodeId
            this.spinner.hide()
            resolve()
          },
          error: error => {
            this.spinner.hide()
            console.log(error)
          }
        })
      )
    })
  }

  private async firmarTramite() {
    await this.obtenerDatosFirma()
    await this.cargarDocumentoRepositorio()
    this.spinner.show()
    let cargo = this.tipoCopiaSeleccionada!.id?.toString() == TIPO_COPIA.COPIA_AUTENTICADA ? 'Fedatario institucional' : this.datosFirma.cargoFirmador
    let body: FirmaInterface = {
      id: this.nombreDocumentoCargado,
      firma_url: `${BACKEND.FIRMA_CLIENTE}`,
      repositorio_url: `${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}`,
      rol: cargo,
      motivo: this.tipoCopiaSeleccionada!.noDescripcion!,
      param_url: `${BACKEND.FIRMA_CLIENTE}cliente/obtenerparametros`,
      extension: 'pdf',
      posicionX: null,
      posicionY: null
    }
    this.firmaDigitalClienteService.sendDataSign.emit(body)
  }

  private async actualizarDocumentoAdjunto(esFirmado: boolean, documentoFile: File, documentoURL: any) {
    const fileB64 = await archivoFileToB64(documentoFile)
    console.log('fileB64', fileB64)
    console.log('documentoURL', documentoURL)
    this.documentoAdjunto = {
      ...this.documentoAdjunto,
      isSign: esFirmado,
      base64: await archivoFileToB64(documentoFile),
      urlPdf: documentoURL,
      fromServer: true
    }
  }

  private async obtenerDocumentoFirmado() {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show()
      this.suscripciones.push(
        this.repositorioDocumentoService.verDocumentorepositorio(this.nombreDocumentoCargado).subscribe({
          next: async resp => {
            console.log('resp', resp)
            const documentoFirmado = new Blob([resp], {type: 'application/pdf'})
            const file = new File([documentoFirmado], this.documentoAdjunto.namePdf, {type: 'application/pdf'})
            const documentoURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(documentoFirmado))
            await this.actualizarDocumentoAdjunto(true, file, documentoURL)
            this.spinner.hide()
            resolve()
          },
          error: error => {
            this.spinner.hide()
            console.log(error)
          }
        })
      )
    })
  }

  protected processSignDocument(file: any) {
    this.documentoCargado = true
    this.verDocumentoVisor(file)
  }

  async procesoFirma(realizado: string): Promise<void> {
    if (realizado === '0') {
      this.deshabilitarFormulario()
      await this.obtenerDocumentoFirmado()
      this.registrarDatosFormularioAlterno()
    }
    if (realizado === '1') {
      //this.firmadoExitoso = false
      this.spinner.hide()
      alert(SLUG_SIGN.CANCEL)
    }
  }

  private registrarDatosFormularioAlterno(): void {
    this.spinner.show()
    const datosPorGuardar = {...this.datosFormulario}
    datosPorGuardar.archivo = this.documentoAdjunto.base64!,
    datosPorGuardar.nombreArchivo = this.documentoAdjunto.namePdf
    datosPorGuardar.nodeId = this.nombreDocumentoCargado;
    this.suscripciones.push(
      this.tramitesGenericosService.registrarTramiteGenerico(datosPorGuardar).subscribe({
        next: resp => {
          console.log(resp)
          this.bloquearFormulario()
          this.modalDialogService.info(
            `${ this.obtenerTituloTramite() } registrada y firmada`,
            `Se registró y firmó correctamente ${ this.obtenerTextoRegistradoFirmado() }.`,
            'Listo'
          )
        },
        error: error => {
          this.spinner.hide()
          console.log(error)
          this.modalDialogService.error(
            'PROCESO NO TERMINADO',
            'No se terminó con el proceso de firma y guardado.',
            'Aceptar'
          )
        }
      })
    )
  }

  private deshabilitarFormulario(): void {
    this.genericosFormulario.disable()
  }

  private bloquearFormulario() {
    this.esFirmadoGuardado = true
    this.tramiteEnModoEdicion = false
    this.idEstadoRegistro = ESTADO_REGISTRO.FIRMADO
    this.gestionCasoService.obtenerCasoFiscal( this.idCaso )
    this.deshabilitarFormulario()
    this.spinner.hide()
  }

  private async verDocumentoVisor(documentoAdjunto: any): Promise<void> {
    console.log('documentoAdjunto', documentoAdjunto)
    this.documentoAdjunto = {
      id: documentoAdjunto.id,
      urlPdf: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(documentoAdjunto.file)),
      preNamePdf: 'Vista previa del documento: ',
      namePdf: `${documentoAdjunto.nombreOrigen}`,
      isSign: documentoAdjunto.isSign,
      base64: await archivoFileToB64(documentoAdjunto.file),
      fromServer: false
    }
    this.spinner.hide()
  }




  protected seleccionarActoInvestigacion(event: any): void {
    if (!event) {
      return
    }
    const {checked} = event
    this.extenderActoInvestigacion = checked
  }

  protected eliminarDocumento(documentoAdjunto: any): void {
    const indexToDelete = this.files.findIndex(i => i.id === documentoAdjunto.id)
    this.files.splice(indexToDelete, 1)
    this.genericosFormulario.get('idTipoCopia')!.setValue(null)
    this.tipoCopiaSeleccionada = null
    this.documentoCargado = false
    this.documentoAdjunto = this.nuevoDocumento()
  }

  private nuevoDocumento(): AdjuntoData {
    return this.documentoAdjunto = {
      id: null,
      urlPdf: null,
      preNamePdf: 'Sin vista previa de documento',
      namePdf: '',
      isSign: false,
      base64: null,
      fromServer: false
    } as AdjuntoData
  }

}
