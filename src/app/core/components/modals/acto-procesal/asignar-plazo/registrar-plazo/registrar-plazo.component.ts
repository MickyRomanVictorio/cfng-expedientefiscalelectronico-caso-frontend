
import { CommonModule } from '@angular/common'
import { Component, inject, Input, OnInit } from '@angular/core'
import { obtenerIcono } from '@utils/icon'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { Message, MessageService, SelectItem } from 'primeng/api'
import { DropdownModule } from 'primeng/dropdown'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { MessagesModule } from 'primeng/messages'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { ObtenerValorMaxPlazoRequest, ObtenerValorMaxPlazoResponse, RegistrarPlazoRequest } from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest'
import { MaestroService } from '@services/shared/maestro.service'
import { DigitOnlyModule } from '@directives/digit-only.module'
import { GestionPlazoService } from '@services/provincial/gestion-plazo/gestion-plazo.service'
import { registrarPlazoErrorValidator } from '@utils/registrar-plazo-error-validators'
import { COMPLEJIDAD, COMPLEJIDAD_VALOR_MAX, COMPLIJIDAD_POR_DEFECTO, ETAPA_TRAMITE, SEDES, TRAMITES, UNIDAD_MEDIDA } from 'ngx-cfng-core-lib'
import { ButtonModule } from 'primeng/button'
import { InputNumberModule } from 'primeng/inputnumber'
import { ProgressBarModule } from 'primeng/progressbar'
import { ToastModule } from 'primeng/toast'
import { of, take } from 'rxjs'
import { NumeroCasoComponent } from '@core/components/numero-caso/numero-caso.component'
import { GestionCasoService } from '../../../../../services/shared/gestion-caso.service';

@Component({
  selector: 'app-registrar-plazo',
  standalone: true,
  templateUrl: './registrar-plazo.component.html',
  styleUrls: ['./registrar-plazo.component.scss'],
  imports: [
    CommonModule,
    DropdownModule,
    InputTextareaModule,
    MessagesModule,
    InputTextModule,
    CmpLibModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    DigitOnlyModule,
    FormsModule,
    ProgressBarModule,
    ToastModule,
    NumeroCasoComponent
  ],
  providers: [MessageService],
})
export class RegistrarPlazoComponent implements OnInit {

  @Input() tramiteSeleccionado: TramiteProcesal | null = null

  protected formRegistro!: FormGroup
  protected complejidades: SelectItem[] = []
  protected sedes: SelectItem[] = []
  protected unidadesMedidas: SelectItem[] = []
  protected msgs1: Message[] = []
  protected msgs2: Message[] = []
  protected titulo: string = 'Asignar Plazo'
  protected obtenerIcono = obtenerIcono
  protected calificarCaso!: CasoFiscal
  private mensajeCustom: any
  private complejidadSeleccionada: any
  protected verBarraProgreso: boolean = true
  private valorMaximoResponse!: ObtenerValorMaxPlazoResponse
  private plazosIniciales: RegistrarPlazoRequest | null = null
  private idTramiteSeleccionado!: string
  protected mostrarSedeYunidades: boolean = true
  private fechaInicioDiligencia: string = ''
  private fechaFinDiligencia: string = ''
  protected unidadesMedidasOrigen: SelectItem[] = []
  private plazoDiasTranscurrido: number = 0
  private cargandoPlazoMaximo: boolean = false
  public bloquearFormulario: boolean = false

  private idCaso: string = ''
  alCerrarModal: () => void = () => {}

  protected esEditado: boolean = false

  private readonly messageService = inject(MessageService)
  private readonly dialogRef = inject(DynamicDialogRef)
  public readonly config = inject(DynamicDialogConfig)
  private readonly fb = inject(FormBuilder)
  private readonly maestroService = inject(MaestroService)
  private readonly gestionPlazoService = inject(GestionPlazoService)
  private readonly gestionCasoService = inject(GestionCasoService)

  ngOnInit(): void {
    if (this.config.data?.bloquearFormulario != null) {
      this.bloquearFormulario = this.config.data?.bloquearFormulario;
    }

    this.formRegistro = this.fb.group(
      {
        complejidad: [{ value: '', disabled: this.bloquearFormulario }, [Validators.required]],
        sede: [{ value: '', disabled: this.bloquearFormulario }],
        plazo: [
          { value: '', disabled: this.bloquearFormulario },
          [
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(3),
            Validators.min(1),
            Validators.pattern(/^\d*$/),
          ],
        ],
        fechaInicio: [{ value: '', disabled: true }],
        fechaFin: [{ value: '', disabled: true }],
        unidadMedida: [{ value: '', disabled: this.bloquearFormulario }, [Validators.required]],
        fechaFinCalculada: [
          { value: 'Se calculará al firmar la disposición', disabled: true },
          [Validators.required],
        ],
        descripcion: [{ value: '', disabled: this.bloquearFormulario }],
      },
      {
        validators: registrarPlazoErrorValidator,
      }
    )

    this.calificarCaso = this.config.data?.calificarCaso
    this.plazosIniciales = this.config.data?.plazos
    this.idTramiteSeleccionado = this.config.data?.idTramite
    this.idCaso = this.config.data?.idCaso

    setTimeout(() => {
      let idTipoComplejidad = this.gestionCasoService.casoActual.idTipoComplejidad
      if ( this.esDeclararComplejo ) idTipoComplejidad = COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO
      this.formRegistro.get('complejidad')?.setValue(idTipoComplejidad)
    }, 0);

    if ( this.config.data?.fechaInicioDiligencia ) {
      this.fechaInicioDiligencia = this.config.data?.fechaInicioDiligencia
      this.fechaFinDiligencia = this.config.data?.fechaFinDiligencia
      this.formRegistro.get('fechaInicio')?.setValue(this.fechaInicioDiligencia)
      this.formRegistro.get('fechaFin')?.setValue(this.fechaFinDiligencia)
    }

    this.obtenerTitulo()
    of(
      this.listarComplejidad(),
      this.listarSedeInvestigacion(),
      this.listarUnidadMedida()
    ).subscribe({
      next: () => {},
      error: () => {},
      complete: () => {
        this.verBarraProgreso = false
      },
    })

    this.formRegistro.get('plazo')!.valueChanges.subscribe({
      next: () => {
        this.calcularValidacionConValorMaximo()
      },
    })

    this.formRegistro.get('unidadMedida')!.valueChanges.subscribe({
      next: () => {
        this.obtenerValorMaxPlazo()
      },
    })

    this.formRegistro.get('complejidad')!.valueChanges.subscribe({
      next: () => {
        this.obtenerValorMaxPlazo()
        this.evaluarUnidadesMedida()
      },
    })

    if (this.plazosIniciales !== undefined && this.plazosIniciales !== null) {
      setTimeout(() => {
        this.ingresarFormulario()
      }, 500)
    }

    if (
      TRAMITES.CONCLUSION_DE_INVESTIGACION_PREPARATORIA ===
        this.idTramiteSeleccionado ||
      TRAMITES.CONCLUSION_DE_INVESTIGACION_SUPLEMENTARIA ===
        this.idTramiteSeleccionado ||
      TRAMITES.FORMALIZACION_DE_INVESTIGACION_PREPARATORIA ===
        this.idTramiteSeleccionado
    ) {
      this.mostrarSedeYunidades = false
    }

    this.formRegistro.valueChanges.subscribe(() => {
      this.esEditado = true
    })

    if ( this.esDeclararComplejo ) {
      this.obtenerMensajeComplejidad()
    }

    if ( this.esInicioDiligenciaPreliminar ) {
      this.formRegistro.get('unidadMedida')?.disable()
    }

    if ( !([TRAMITES.INICIO_DILIGENCIAS_PRELIMINARES,
          TRAMITES.FORMALIZACION_DE_INVESTIGACION_PREPARATORIA
         ].includes(this.idTramiteSeleccionado as any))
    ) {
      this.obtenerPlazoActual()
    }

  }

  get esInicioDiligenciaPreliminar(): boolean {
    return this.idTramiteSeleccionado === TRAMITES.INICIO_DILIGENCIAS_PRELIMINARES
  }

  get esDeclararComplejo(): boolean {
    return this.idTramiteSeleccionado === TRAMITES.DISPOSICION_QUE_DECLARA_COMPLEJO_LA_INVESTIGACION_PRELIMINAR ||
           this.idTramiteSeleccionado === TRAMITES.DISPOSICION_DE_DECLARAR_COMPLEJO_LA_INVESTIGACION_PREPARATORIA
  }

  get mostrarPlazoAntesDespues(): boolean {
    return this.idTramiteSeleccionado === TRAMITES.DISPOSICION_AMPLIACION_DILIGENCIAS_PREPARATORIA ||
           this.idTramiteSeleccionado === TRAMITES.DISPOSICION_DE_PRORROGA_DE_INVESTIGACION_PREPARATORIA ||
           this.idTramiteSeleccionado === TRAMITES.REQUERIMIENTO_PRORROGA_INVESTIGACION_PREPARATORIA ||
           this.idTramiteSeleccionado === TRAMITES.RESOLUCION_AUTO_QUE_RESUELVE_PRORROGA ||
           this.esDeclararComplejo
  }

  get etiquetaPlazoActual(): string {
    return this.idTramiteSeleccionado === TRAMITES.DISPOSICION_DE_PRORROGA_DE_INVESTIGACION_PREPARATORIA ? 'investigación preparatoria' : 'investigación preliminar'
  }

  get etiquetaPlazoActualFin(): string {
    return this.idTramiteSeleccionado === TRAMITES.DISPOSICION_DE_PRORROGA_DE_INVESTIGACION_PREPARATORIA ? 'investigación preparatoria actual' : 'investigación preliminar'
  }

  get mostrarSedeInvestigacion(): boolean {
    return this.idTramiteSeleccionado === TRAMITES.DISPOSICION_AMPLIACION_DILIGENCIAS_PREPARATORIA
  }

  get esDisposiciónConclusionInvestigaciónPreparatoria(): boolean {
    return this.idTramiteSeleccionado === TRAMITES.CONCLUSION_DE_INVESTIGACION_PREPARATORIA
  }

  get esFormalizacionInvestigaciónPreparatoria(): boolean {
    return this.idTramiteSeleccionado === TRAMITES.FORMALIZACION_DE_INVESTIGACION_PREPARATORIA
  }

  get longitudCampoDescripcion(): number {
    return this.formRegistro.get('descripcion')?.value?.length ?? 0
  }

  get labelPlazo(): string {
    return {
      [TRAMITES.DISPOSICION_AMPLIACION_DILIGENCIAS_PREPARATORIA]: 'Plazo nuevo',
      [TRAMITES.DISPOSICION_QUE_DECLARA_COMPLEJO_LA_INVESTIGACION_PRELIMINAR]: 'Plazo nuevo',
      [TRAMITES.DISPOSICION_PRORROGA_INVESTIGACION_PREPARATORIA]: 'Plazo prorrogado',
      [TRAMITES.DISPOSICION_DE_PRORROGA_DE_INVESTIGACION_PREPARATORIA]: 'Plazo prorrogado',
      [TRAMITES.RESOLUCION_AUTO_QUE_RESUELVE_PRORROGA]: 'Plazo prorrogado',
      [TRAMITES.REQUERIMIENTO_PRORROGA_INVESTIGACION_PREPARATORIA]: 'Plazo prorrogado',
    }[ this.idTramiteSeleccionado ] ?? 'Plazo'
  }

  get labelFechaAntesDespues(): string {
    return {
      [TRAMITES.DISPOSICION_AMPLIACION_DILIGENCIAS_PREPARATORIA]: 'investigación preliminar',
      [TRAMITES.REQUERIMIENTO_PRORROGA_INVESTIGACION_PREPARATORIA]: 'investigación preparatoria',
      [TRAMITES.RESOLUCION_AUTO_QUE_RESUELVE_PRORROGA]: 'investigación preparatoria',
    }[ this.idTramiteSeleccionado ] ?? 'investigación preliminar'
  }

  get labelFechaFinCalculada(): string {
    return {
      [TRAMITES.INICIO_DILIGENCIAS_PRELIMINARES]: 'Fecha fin calculada',
    }[ this.idTramiteSeleccionado ] ?? 'Nueva fecha fin calculada'
  }

  get labelBoton(): string {
    return {
      [TRAMITES.DISPOSICION_AMPLIACION_DILIGENCIAS_PREPARATORIA]: 'Ampliar',
      [TRAMITES.RESOLUCION_AUTO_QUE_RESUELVE_PRORROGA]: 'Ampliar',
      [TRAMITES.DISPOSICION_DE_PRORROGA_DE_INVESTIGACION_PREPARATORIA]: 'Ampliar',
      [TRAMITES.DISPOSICION_QUE_DECLARA_COMPLEJO_LA_INVESTIGACION_PRELIMINAR]: 'Declarar complejo',
      [TRAMITES.DISPOSICION_DE_DECLARAR_COMPLEJO_LA_INVESTIGACION_PREPARATORIA]: 'Declarar complejo',
    }[ this.idTramiteSeleccionado ] ?? 'Asignar'
  }

  get getFechaFinCalculada() {
    return 'Se calculará al firmar la disposición'
  }

  get idComplejidad() {
    let idComplejidadCaso = this.gestionCasoService.casoActual.idTipoComplejidad
    return idComplejidadCaso
  }

  get idSede() {
    if (
      TRAMITES.FORMALIZACION_DE_INVESTIGACION_PREPARATORIA ===
      this.idTramiteSeleccionado
    ) {
      return null
    }
    return this.formRegistro.get('sede')!.value
  }

  get idUnidadCaso() {
    let idTipoUnidad = this.calificarCaso.plazos!.at(0)?.tipoUnidad
    return idTipoUnidad
  }

  private ingresarFormulario() {
    this.formRegistro.patchValue({
      complejidad: this.plazosIniciales!.idTipoComplejidad,
      sede: this.plazosIniciales!.idTipoSedeInvestigacion,
      plazo: this.plazosIniciales!.nroPlazo,
      unidadMedida: this.plazosIniciales!.idTipoUnidad,
      fechaInicio: this.fechaInicioDiligencia,
      fechaFin: this.fechaFinDiligencia,
      fechaFinCalculada: this.getFechaFinCalculada,
      descripcion: this.plazosIniciales!.descripcionPlazo,
    })
  }

  private obtenerMensaje(dias: any, esDia: any, esMes: any, esAnio: any): void {
    
    let etiqueta = ''
    if (esDia) etiqueta = 'días'
    else if (esMes) etiqueta = 'meses'
    else if (esAnio) etiqueta = 'años'

    let mensajeCustomHtml = ''
    if (dias == 0 && esAnio) {
      dias = 1
      mensajeCustomHtml =
        "El plazo registrado <span class='text-bold-message'>debe ser menor </span> a " +
        dias +
        ' ' +
        etiqueta +
        '. Verifique los datos ingresados.'
    } else {
      mensajeCustomHtml =
        "El plazo registrado está <span class='text-bold-message'>superando el tope</span> de " +
        dias +
        ' ' +
        etiqueta +
        '. Verifique los datos ingresados.'
    }
    this.mensajeCustom =  `<span class='text-message-plazos'>${mensajeCustomHtml}</span>`
    if ( !this.esDisposiciónConclusionInvestigaciónPreparatoria ) {
      this.msgs2 = [
        {
          severity: 'warn',
          summary: '',
          detail: this.mensajeCustom,
          icon: 'pi-info-circle',
        },
      ]
    }
  }

  private obtenerMensajeComplejidad(): void {
    const mensajeCustomHtml = 'Está declarando complejo el caso, recuerde que esta acción no podrá revertirse. Verifique los datos ingresados.'
    this.msgs1 = [
      {
        severity: 'warn',
        summary: '',
        detail: `<span class='text-message-plazos'>${mensajeCustomHtml}</span>`,
        icon: 'pi-info-circle'
      },
    ]
  }

  private validarPlazo(plazo: any): void {
    this.msgs2 = []
    if (!this.formRegistro.get('unidadMedida')!.value) {
      this.formRegistro.get('unidadMedida')!.markAllAsTouched()
      return
    }
    if (!this.formRegistro.get('plazo')!.value) {
      this.formRegistro.get('complejidad')!.markAllAsTouched()
      return
    }
    let unidadMedida = this.formRegistro.get('unidadMedida')!.value
    this.complejidadSeleccionada = this.complejidades.find(
      (complejidad) =>
        complejidad.value == this.formRegistro.get('complejidad')!.value
    )
    if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS) {
      this.calcularDias(plazo)
    } else if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_MESES) {
      this.calcularMeses(plazo)
    } else if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_ANIOS) {
      this.calcularAnios(plazo)
    }
  }

  private obtenerPlazoActual(): void {
    this.gestionPlazoService.obtenerPlazoActual(this.idCaso).subscribe({
      next: (response) => {
        this.plazoDiasTranscurrido = response
      },
      error: (error: any) => {
        console.error(error)
      },
    })
  }

  private calcularPlazoTipoDia(plazo: any): void {
    let valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima
    if (
      this.valorMaximoResponse.idTipoUnidad == UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS
    ) {
      valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima
    }
    if (
      this.valorMaximoResponse.idTipoUnidad == UNIDAD_MEDIDA.UNIDAD_MEDIDA_MESES
    ) {
      valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima! * 30
    }
    if (
      this.valorMaximoResponse.idTipoUnidad == UNIDAD_MEDIDA.UNIDAD_MEDIDA_ANIOS
    ) {
      valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima! * 30 * 12
    }
    if (plazo > valorMaximoTmp!) {
      this.obtenerMensaje(valorMaximoTmp, true, false, false)
    }
  }

  private calcularPlazoTipoMes(plazo: any): void {
    let valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima
    if (
      this.valorMaximoResponse.idTipoUnidad == UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS
    ) {
      valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima! / 30
    }
    if (plazo > valorMaximoTmp!) {
      this.obtenerMensaje(valorMaximoTmp, false, true, false)
    }
  }

  private calcularPlazoTipoAnio(plazo: any): void {
    let valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima
    if (plazo > valorMaximoTmp!) {
      this.obtenerMensaje(valorMaximoTmp, false, false, true)
    }
  }

  private calcularDias(plazo: any): void {
    if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_SIMPLE
    ) {
      if (plazo > COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_DIA) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_DIA,
          true,
          false,
          false
        )
      }
    } else if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO
    ) {
      if (
        plazo > COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_DIA
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_DIA,
          true,
          false,
          false
        )
      }
    } else if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_CRIMINALIDAD_ORGANIZADA
    ) {
      if (
        plazo >
        COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_DIA
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_DIA,
          true,
          false,
          false
        )
      }
    }
  }

  private calcularMeses(plazo: any): void {
    if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_SIMPLE
    ) {
      if (plazo > COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_MES) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_MES,
          false,
          true,
          false
        )
      }
    } else if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO
    ) {
      if (
        plazo > COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_MES
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_MES,
          false,
          true,
          false
        )
      }
    } else if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_CRIMINALIDAD_ORGANIZADA
    ) {
      if (
        plazo >
        COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_MES
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_MES,
          false,
          true,
          false
        )
      }
    }
  }

  private calcularAnios(plazo: any): void {
    if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_SIMPLE
    ) {
      if (
        plazo > COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_ANIO
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_ANIO,
          false,
          false,
          true
        )
      }
    } else if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO
    ) {
      if (
        plazo > COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_ANIO
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_ANIO,
          false,
          false,
          true
        )
      }
    } else if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_CRIMINALIDAD_ORGANIZADA
    ) {
      if (
        plazo >
        COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_ANIO
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_ANIO,
          false,
          false,
          true
        )
      }
    }
  }

  private obtenerTitulo(): void {
    
    const asignarPlazoTitulo: string[] = [TRAMITES.INICIO_DILIGENCIAS_PRELIMINARES, TRAMITES.FORMALIZACION_DE_INVESTIGACION_PREPARATORIA, TRAMITES.CONCLUSION_DE_INVESTIGACION_PREPARATORIA, TRAMITES.CONCLUSION_DE_INVESTIGACION_SUPLEMENTARIA, TRAMITES.DISPOSICION_DE_REAPERTURA_DE_CASO]
    const ampliarPlazoTitulo: string[] = [TRAMITES.DISPOSICION_AMPLIACION_DILIGENCIAS_PREPARATORIA]
    const prorrogaPlazoTitulo: string[] = [TRAMITES.DISPOSICION_DE_PRORROGA_DE_INVESTIGACION_PREPARATORIA, TRAMITES.REQUERIMIENTO_PRORROGA_INVESTIGACION_PREPARATORIA, TRAMITES.RESOLUCION_AUTO_QUE_RESUELVE_PRORROGA]
    const declararComplejoPlazoTitulo: string[] = [TRAMITES.DISPOSICION_QUE_DECLARA_COMPLEJO_LA_INVESTIGACION_PRELIMINAR, TRAMITES.DISPOSICION_DE_DECLARAR_COMPLEJO_LA_INVESTIGACION_PREPARATORIA]
    
    if ( asignarPlazoTitulo.includes(this.idTramiteSeleccionado) ) {
      this.titulo = 'Asignar Plazo'
    }
    if ( ampliarPlazoTitulo.includes(this.idTramiteSeleccionado) ) {
      this.titulo = 'Ampliar Plazos'
    }
    if ( prorrogaPlazoTitulo.includes(this.idTramiteSeleccionado) ) {
      this.titulo = 'Prórroga de plazos'
    }
    if ( declararComplejoPlazoTitulo.includes(this.idTramiteSeleccionado) ) {
      this.titulo = 'Declarar complejo'
    }
    this.titulo += ' - Caso: N°'
  }

  public cerrarModal(): void {
    this.dialogRef.close(this.plazosIniciales)
  }

  public asignar(): void {
    this.messageService.clear()
    if (!this.formRegistro.valid) {
      this.formRegistro.markAllAsTouched()
      return
    }

    let data: RegistrarPlazoRequest = {} as RegistrarPlazoRequest
    data.idTipoComplejidad = this.formRegistro.get('complejidad')!.value
    if ( this.esDeclararComplejo ) {
      data.idTipoComplejidad = COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO
    }
    data.idTipoSedeInvestigacion = this.idSede
    data.descripcionPlazo = this.formRegistro.get('descripcion')!.value
    data.idCaso = this.config.data?.idCaso
    data.idTramite = this.config.data?.idTramite
    data.idActoProcesal = this.config.data?.idActoProcesal
    data.idTipoUnidad = this.formRegistro.get('unidadMedida')!.value
    data.nroPlazo = this.formRegistro.get('plazo')!.value
    data.esEditado = this.esEditado

    this.dialogRef.close(data)
  }

  private listarComplejidad(): void {
    this.maestroService
      .listarComplejidad()
      .pipe(take(1))
      .subscribe({
        next: (resp) => {
          this.complejidades = resp.map((item: any) => ({
            value: item.id,
            label: item.nombre,
          }))
          this.habilitarControles()
          this.formRegistro.get('complejidad')!.valueChanges.subscribe({
            next: (data) => {
              if (data) {
                this.complejidadSeleccionada = this.complejidades.find(
                  (complejidad) => complejidad.value == data
                )
                if ( !this.esDeclararComplejo ) {
                  this.msgs1 = []
                }
                if (
                  this.complejidadSeleccionada.value ==
                  COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO
                ) {
                  if (
                    !(
                      TRAMITES.CONCLUSION_DE_INVESTIGACION_PREPARATORIA ===
                        this.idTramiteSeleccionado ||
                      TRAMITES.CONCLUSION_DE_INVESTIGACION_SUPLEMENTARIA ===
                        this.idTramiteSeleccionado
                    )
                  ) {
                    this.obtenerMensajeComplejidad()
                    this.validarPlazo(this.formRegistro.get('plazo')!.value)
                  }
                }
              }
            },
          })
        },
        error: () => {},
      })
  }

  private listarSedeInvestigacion(): void {
    this.maestroService
      .listarSedeInvestigacion()
      .pipe(take(1))
      .subscribe({
        next: (resp) => {
          this.sedes = resp.map((item: any) => ({
            value: item.id,
            label: item.nombre,
          }))
          this.formRegistro.get('sede')!.setValue(SEDES.SEDE_FISCALIA)
        },
      })
  }

  private listarUnidadMedida(): void {
    this.maestroService
      .listarUnidadMedida()
      .pipe(take(1))
      .subscribe({
        next: (resp) => {
          this.unidadesMedidas = resp.map((item: any) => ({
            value: item.id,
            label: item.nombre,
          }))
          this.unidadesMedidasOrigen = [...this.unidadesMedidas]
          this.formRegistro
            .get('unidadMedida')!
            .setValue(UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS)
          this.evaluarUnidadesMedida()
        },
      })
  }

  private evaluarUnidadesMedida(): void {
    const idComplejidad = this.formRegistro.get('complejidad')!.value
    if ( this.esDisposiciónConclusionInvestigaciónPreparatoria ) {
      this.unidadesMedidas = this.unidadesMedidasOrigen.filter( x => x.value === UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS)
      this.formRegistro.get('unidadMedida')?.disable()
      this.formRegistro.get('unidadMedida')?.setValue(UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS)
      return
    }
    if ( idComplejidad === COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_SIMPLE ) {
      this.unidadesMedidas = this.unidadesMedidasOrigen.filter( x => x.value === UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS)
      this.formRegistro.get('unidadMedida')?.disable()
      this.formRegistro.get('unidadMedida')?.setValue(UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS)
    }
    if ( idComplejidad === COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO ) {
      this.formRegistro.get('unidadMedida')?.enable()
      this.unidadesMedidas = this.unidadesMedidasOrigen.filter( x => x.value !== UNIDAD_MEDIDA.UNIDAD_MEDIDA_ANIOS)
      this.formRegistro.get('unidadMedida')?.setValue(UNIDAD_MEDIDA.UNIDAD_MEDIDA_MESES)
    }
    if ( idComplejidad === COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_CRIMINALIDAD_ORGANIZADA ) {
      this.formRegistro.get('unidadMedida')?.enable()
      this.unidadesMedidas = [...this.unidadesMedidasOrigen]
      this.formRegistro.get('unidadMedida')?.setValue(UNIDAD_MEDIDA.UNIDAD_MEDIDA_ANIOS)
    }
  }

  private obtenerValorMaxPlazo(): void {

      let idComplejidad = this.formRegistro.get('complejidad')!.value

      if ( this.esDeclararComplejo ) {
        idComplejidad = COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO
      }
  
      let idTipoUnidad = this.formRegistro.get('unidadMedida')!.value
  
      let idActoTramiteEstado = this.calificarCaso.idActoTramiteEstado
  
      if ( !(idComplejidad && idTipoUnidad) ) return

      if ( !this.cargandoPlazoMaximo ) {
        
        this.cargandoPlazoMaximo = true
        let request: ObtenerValorMaxPlazoRequest =
          {} as ObtenerValorMaxPlazoRequest
        request.idTipoComplejidad = idComplejidad
        request.idActoTramiteEstado = idActoTramiteEstado
        request.idTipoUnidad = idTipoUnidad
        request.idCaso = this.idCaso
        this.gestionPlazoService
          .obtenerValoMaxPlazo(request)
          .pipe(take(1))
          .subscribe({
            next: (result) => {
              this.cargandoPlazoMaximo = false
              this.valorMaximoResponse = result
              this.calcularValidacionConValorMaximo()
            },
            error: () => {
              this.cargandoPlazoMaximo = false
            },
          })
      }

  }

  private calcularValidacionConValorMaximo(): void {
    let plazo = this.formRegistro.get('plazo')!.value ?? 0
    let unidadMedida = this.formRegistro.get('unidadMedida')!.value
    if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS) {
      plazo = String(Number(plazo) + Number(this.plazoDiasTranscurrido))
    }
    if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_MESES) {
      plazo = String(Number(plazo) + Number(Math.ceil(this.plazoDiasTranscurrido / 30)))
    }
    if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_ANIOS) {
      plazo = String(Number(plazo) + Number(Math.ceil(this.plazoDiasTranscurrido / 360)))
    }
    this.validarPlazoConValorMaximo(plazo)
  }

  private habilitarControles() {
    //this.formRegistro
      //.get('complejidad')!
      //.setValue(COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_SIMPLE)
    if (ETAPA_TRAMITE.ETAPA_CALIFICACION === this.calificarCaso.idEtapa) {
      this.formRegistro.get('plazo')!.setValue('0')
    }
    if (
      TRAMITES.FORMALIZACION_DE_INVESTIGACION_PREPARATORIA ===
      this.idTramiteSeleccionado
    ) {
      this.formRegistro.get('plazo')!.setValue('0')
      //this.formRegistro.get('complejidad')!.disable() - TODO: Confirmar eliminacion
      this.formRegistro.get('complejidad')!.setValue(this.idComplejidad)
      this.formRegistro
        .get('fechaFinCalculada')!
        .setValue(this.getFechaFinCalculada)
    }
    if (
      TRAMITES.CONCLUSION_DE_INVESTIGACION_PREPARATORIA ===
        this.idTramiteSeleccionado ||
      TRAMITES.CONCLUSION_DE_INVESTIGACION_SUPLEMENTARIA ===
        this.idTramiteSeleccionado
    ) {
      this.formRegistro.get('complejidad')!.disable()
      this.formRegistro.get('unidadMedida')!.disable()
      this.formRegistro.get('plazo')!.disable()
      if (this.idComplejidad == COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_SIMPLE) {
        this.formRegistro
          .get('plazo')!
          .setValue(COMPLIJIDAD_POR_DEFECTO.COMPLIJIDAD_SIMPLE)
        this.formRegistro.get('complejidad')!.setValue(this.idComplejidad)
        this.formRegistro
          .get('fechaFinCalculada')!
          .setValue(this.getFechaFinCalculada)
      }
      if (
        this.idComplejidad == COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO ||
        this.idComplejidad ==
          COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_CRIMINALIDAD_ORGANIZADA
      ) {
        this.formRegistro
          .get('plazo')!
          .setValue(COMPLIJIDAD_POR_DEFECTO.COMPLIJIDAD_COMPLEJO)
        this.formRegistro.get('complejidad')!.setValue(this.idComplejidad)
        this.formRegistro
          .get('fechaFinCalculada')!
          .setValue(this.getFechaFinCalculada)
      }
    }
  }

  private validarPlazoConValorMaximo(plazo: any): void {
    this.msgs2 = []
    if (!this.valorMaximoResponse) {
      return
    }
    let unidadMedida = this.formRegistro.get('unidadMedida')!.value
    this.complejidadSeleccionada = this.complejidades.find(
      (complejidad) =>
        complejidad.value == this.formRegistro.get('complejidad')!.value
    )

    if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS) {
      this.calcularPlazoTipoDia(plazo)
    }
    if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_MESES) {
      this.calcularPlazoTipoMes(plazo)
    }
    if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_ANIOS) {
      this.calcularPlazoTipoAnio(plazo)
    }
  }

  public eliminarCerosIniciales(event: Event): void {
    const inputElement = event.target as HTMLInputElement
    let valor = inputElement.value
  
    // Eliminar ceros iniciales, pero permitir un solo '0' si es el único valor
    valor = valor.replace(/^0+(?!$)/, '')
  
    // Actualiza el valor del input
    inputElement.value = valor
  
    const formControl = this.formRegistro.get('plazo')
    if (formControl) {
      formControl.setValue(valor, { emitEvent: false })
    }
  }

}