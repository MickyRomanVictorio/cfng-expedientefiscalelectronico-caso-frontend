import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core'
import { obtenerIcono } from "@utils/icon"
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib"
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog"
import { SafeHtml } from "@angular/platform-browser"
import { InputTextareaModule } from 'primeng/inputtextarea'
import { CalendarModule } from "primeng/calendar"
import { InputMaskModule } from "primeng/inputmask"
import { ArchivoAdjunto } from "@interfaces/reusables/fuentes-investigacion/ArchivoAdjunto"
import { ID_OAID, TIPO_DOCUMENTO } from "@constants/constants"
import { NgxSpinnerService } from "ngx-spinner"
import { IconAsset, IconUtil } from 'ngx-cfng-core-lib'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { NgClass, NgOptimizedImage } from "@angular/common"
import { Button, ButtonDirective } from "primeng/button"
import { DropdownModule } from "primeng/dropdown"
import { TooltipModule } from "primeng/tooltip"
import { CapitalizePipe } from "@pipes/capitalize.pipe"
import { TableModule } from "primeng/table"
import { CheckboxModule } from "primeng/checkbox"
import { PaginatorComponent } from "@components/generales/paginator/paginator.component"
import { finalize, Subscription } from "rxjs"
import { ReusableGestionarAudioService } from "@services/reusables/reusable-gestionar-audio.service"
import { Audios } from "@interfaces/reusables/gestionar-audios/audios"
import { ArchivoReproductor, TipoArchivo, VisorArchivoComponent } from '@core/components/modals/visor-efe-modal/visor-archivo/visor-archivo/visor-archivo.component'
import { ID_TIPO_ORIGEN } from '@core/types/tipo-origen.type'
import { TAMANIO_MAXIMO_ARCHIVO_AUDIOS } from '@environments/environment'
import { AlertaModalComponent } from '@core/components/modals/alerta-modal/alerta-modal.component'
import { SubirArchivoComponent } from './subir-archivo/subir-archivo.component'
import { capitalizedFirstWord } from '@core/utils/string'
import { MensajeGenericoComponent } from '@core/components/mensajes/mensaje-generico/mensaje-generico.component'

@Component({
  selector: 'app-gestion-archivos',
  standalone: true,
  imports: [
    NgClass,

    CmpLibModule,
    SubirArchivoComponent,
    CalendarModule,

    InputTextareaModule,
    InputMaskModule,
    Button,
    ButtonDirective,
    CalendarModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    CapitalizePipe,
    TableModule,
    NgOptimizedImage,
    PaginatorComponent,
    CheckboxModule,
    MensajeGenericoComponent,
    VisorArchivoComponent,
  ],
  templateUrl: './gestion-archivos.component.html',
  styleUrl: './gestion-archivos.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class GestionArchivosComponent implements OnInit, OnDestroy {
  protected readonly tipoArchivo: TipoArchivo = TipoArchivo.Audio
  protected reproductorConfig !: ArchivoReproductor
  protected indiceAudioReproductorActual: number = 0
  protected audioActualnodeId: string | null = null
  protected query: any = { limit: 5, page: 1, where: {} }
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [], pages: 0, perPage: 0, total: 0,
    },
  }

  protected readonly maxLengthDescripcion: number = 1000
  protected readonly suscripciones: Subscription[] = []
  protected readonly obtenerIcono = obtenerIcono

  protected readonly capitalizedFirstWord = capitalizedFirstWord;

  private idMovimientoTramiteCaso: string = ''
  private idCaso: string = ''
  private idActoTramiteCaso: string = ''

  protected tituloFuncion?: SafeHtml
  protected audioParaAgregar: boolean = true

  private listaAudios: Audios[] = []
  protected listaAudiosFiltrados: Audios[] = []

  protected formAudio!: FormGroup
  protected mostrarTamanoError: boolean = false
  protected mensajeErrorTamano: string = ''
  private ultimoAudioReproducidoNodeId: string = ''
  private primerAudioEstablecido: boolean = true
  protected reproduciendoAudio: boolean = false
  //protected descripcionAudio: string = ''

  private registroEnEdicion: Audios | null = null
  private audioModificado: boolean = false
  protected archivoAudioSubido: boolean = false

  protected nombreBoton: 'Agregar' | 'Actualizar' = 'Agregar'

  private audioAdjunto: ArchivoAdjunto = {
    isSelect: false,
    file: null
  }
  public modoLectura!: boolean;

  @ViewChild(SubirArchivoComponent) fileComponent?: SubirArchivoComponent
  @ViewChild(PaginatorComponent) paginator?: PaginatorComponent
  @ViewChild('descripcionInput') descripcionInput!: ElementRef

  constructor(
    protected iconUtil: IconUtil,
    protected iconAsset: IconAsset,
    protected fb: FormBuilder,
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private readonly spinner: NgxSpinnerService,
    private readonly reusableGestionarAudioService: ReusableGestionarAudioService,
    private readonly dialogService: DialogService,
  ) { 
    this.initializePropertiesFromConfig()
    this.eventoLimpiar()
  }

  ngOnInit(): void {
    this.obtenerIdMovimiento(this.idActoTramiteCaso, () => {
      this.obtenerAudios()
    })
  
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((s) => s.unsubscribe())
  }

  private initializePropertiesFromConfig(): void {
    this.formAudio = this.fb.group({
      descripcionAudio: ['', Validators.required]
    })
    this.idCaso = this.config.data?.idCaso ?? ''
    this.tituloFuncion = this.config.data?.tituloFuncion
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso ?? ''
    this.modoLectura = this.config.data?.modoLectura ?? false
  }

  private obtenerIdMovimiento(idActoTramiteCaso: string, callback: () => void): void {
    this.spinner.show()

    this.reusableGestionarAudioService.buscarIdMovimiento(idActoTramiteCaso)
      .pipe(finalize(() => { this.spinner.hide() }))
      .subscribe({
        next: (resp: any) => {
          this.idMovimientoTramiteCaso = resp.data
          callback()
        },
        error: (error: any) => {
          console.error(error)
        }
      })
  }

  private obtenerAudios(): void {
    this.listaAudios = []
    this.spinner.show()

    this.reusableGestionarAudioService.obtenerAudio(this.idMovimientoTramiteCaso)
      .pipe(finalize(() => { this.spinner.hide() }))
      .subscribe({
        next: (resp: any) => {
          this.listaAudios = resp.data ?? []
          this.listaAudios.forEach(x => {
            x.url = this.reusableGestionarAudioService.getUrlVisualizar(x.nodeId, x.nuDocumento)
          })

          this.listaAudiosFiltrados = this.listaAudios

          if (this.listaAudios.length > 0) {
            this.itemPaginado.data.data = this.listaAudiosFiltrados
            this.itemPaginado.data.total = this.listaAudiosFiltrados.length
            this.updatePagedItems()

            this.indiceAudioReproductorActual = 0

            this.reproductorConfig = {
              fuente: this.audioActual.url,
              nombre: this.audioActual.nuDocumento || this.audioActual.coDocumento,
              existeAnterior: false,
              existeSiguiente: this.listaAudios.length > 1,
            }

            this.setActiveRow(this.audioActual)
          }
        },
        error: (error: any) => {
          console.error(error)
        }
      })
  }

  //#region "Adjuntar Archivo"
  private resetAdjunto(): void {
    this.audioAdjunto = {
      isSelect: false,
      file: null,
      duration: undefined,
      size: undefined,
      imgDoc: undefined,
    }

    this.removeFileAttach()
  }

  protected removeFileAttach() {

    this.archivoAudioSubido = false

    this.fileComponent?.limpiarArchivoSeleccionado()
    this.audioParaAgregar = true

    if (this.nombreBoton == 'Actualizar')
      this.audioModificado = true
  }

  protected onSelectFileAttach(event: ArchivoAdjunto) {

    this.audioAdjunto = event

    /*let totalSize: number = 0
    this.listaAudiosFiltrados.forEach( audio => {
      totalSize += audio.nuPeso
    })
    totalSize += this.audioAdjunto.file?.size ?? 0

    if ( totalSize > TAMANIO_MAXIMO_ARCHIVO_AUDIOS && this.nombreBoton !== 'Actualizar' ) {
      this.reusableGestionarAudioService.notificarTamanoMaximoExcedido(true)
      return
    }/*/

    this.archivoAudioSubido = true
    
    this.audioParaAgregar = false
  }
  //#endregion

  protected eventoGuardar(): void {

    const control = this.formAudio.get('descripcionAudio')

    if (control) {
      control.markAsTouched()
      control.markAsDirty()
      control.updateValueAndValidity()
    }

    if (this.idMovimientoTramiteCaso && this.audioAdjunto.file && this.formAudio.valid) {
      const formData = new FormData()
      console.log(this.idMovimientoTramiteCaso)
      const dataEnviar: any = {
        idCaso: this.idCaso,
        idDocumento: this.registroEnEdicion?.idDocumento, //ID ENVIADO CUANDO ES EDICIÓN
        
        idMovimiento: this.idMovimientoTramiteCaso,
        idOaid: ID_OAID.PRINCIPAL,
        idTipoDocumento: TIPO_DOCUMENTO.AUDIO,
        idTipoOrigen: ID_TIPO_ORIGEN.EFE,
        deObservacion: this.formAudio.get('descripcionAudio')?.value,
      }

      //Validar que no exceda el peso
      if ( this.nombreBoton === 'Actualizar' ) {

        let totalSize: number = 0
        this.listaAudiosFiltrados.forEach( audio => {
          if ( audio.idDocumento !== this.registroEnEdicion?.idDocumento )
          totalSize += audio.nuPeso
        })
        totalSize += this.audioAdjunto.file?.size ?? 0
        if ( totalSize > TAMANIO_MAXIMO_ARCHIVO_AUDIOS ) {
          this.reusableGestionarAudioService.notificarTamanoMaximoExcedido(true)
          this.archivoAudioSubido = false
          if ( this.audioAdjunto ) {
            setTimeout(() => {
              this.reusableGestionarAudioService.notificarTamanoMaximoExcedido(true)
            }, 0)
          }
          return
        }
        
      }

      //Datos cuando el audio es nuevo o modificado
      if (this.audioAdjunto.file || (this.registroEnEdicion && this.audioModificado)) {
        const sizeInBytes = this.audioAdjunto.file?.size ?? 0
        formData.append('file', this.audioAdjunto.file)
        dataEnviar.duracion = this.audioAdjunto.duration ?? '00:00 min'
        dataEnviar.nuDocumento = this.audioAdjunto.file?.name
        dataEnviar.nuPeso = sizeInBytes
      }

      formData.append('data', new Blob([JSON.stringify(dataEnviar)], { type: 'application/json' }))

      const tipo = this.registroEnEdicion ? 'editar' : 'registrar'
      this.spinner.show()

      this.reusableGestionarAudioService.guardarEditarAudio(formData, tipo).pipe(finalize(() => {
        this.spinner.hide()
        this.eventoLimpiar()
      })).subscribe({
        next: () => {
          if (this.nombreBoton == 'Agregar')
            this.mostrarDialog('success', 'Guardado', 'Archivo guardado correctamente', 'Cerrar', false, () => { })
          else
            this.mostrarDialog('success', 'Actualizado', 'Archivo actualizado correctamente', 'Cerrar', false, () => { })

          this.obtenerAudios()
        },
        error: (error: any) => {
          console.error(error)
          this.mostrarDialog('error', 'Error', `El archivo no ha podido ser ${ this.nombreBoton == 'Agregar' ? 'guardado' : 'editado'}` , 'Cerrar', false, () => { })
        }
      })
    }
  }

  protected eventoLimpiar() {
    this.nombreBoton = 'Agregar'
    this.formAudio.get('descripcionAudio')?.setValue('')
    this.formAudio.reset()
    this.audioModificado = false
    this.registroEnEdicion = null
    this.resetAdjunto()
  }

  protected editarRegistro(audio: Audios): void {
    this.reusableGestionarAudioService.urlToFile(audio.url, audio.nuDocumento).then((file) => {
      this.nombreBoton = 'Actualizar'

      this.registroEnEdicion = audio
      this.formAudio.get('descripcionAudio')?.setValue(audio.deObservacion)
      this.descripcionInput.nativeElement.focus()

      this.fileComponent?.alSeleccionarArchivoAdjunto(file)
    })
  }

  private emptyCallback(): void { /* document why this method 'emptyCallback' is empty */ }

  protected eliminarAudio({ idDocumento }: Audios): void {
    this.mostrarDialog('warning', 'Eliminar archivo', '¿Por favor confirme la eliminación de este registro?', 'Eliminar', true,
      () => {
        if (idDocumento) {
          this.reusableGestionarAudioService.eliminarAudio(idDocumento)
            .pipe(finalize(() => { this.spinner.hide() }))
            .subscribe({
              next: () => {

                setTimeout(() => {
                  this.mostrarDialog(
                    'info',
                    'Eliminar archivo',
                    'Archivo correctamente eliminado',
                    'OK',
                    false,
                    this.emptyCallback.bind(this)
                  )
                }, 300)

                this.obtenerAudios()
              },
              error: (error: any) => {
                console.error(error)
              }
            })
        }
      })
  }

  protected descargarAudio(audio: Audios): void {
    this.reusableGestionarAudioService.descargarAudio(audio)
  }


  //#region "Componente reproductor Audio"
  protected reproducirAudio(audio: Audios) {
    if ( this.ultimoAudioReproducidoNodeId != audio.nodeId ) {
      this.reproduciendoAudio = false

      const index = this.listaAudios.findIndex(x => x.nodeId === audio.nodeId)

      this.indiceAudioReproductorActual = index

      this.reproductorConfig = {
        fuente: this.audioActual.url,
        nombre: this.audioActual.nuDocumento || this.audioActual.coDocumento,
        existeAnterior: this.indiceAudioReproductorActual > 0, // Si hay anterior si no es el primero
        existeSiguiente: this.indiceAudioReproductorActual < this.listaAudios.length - 1 // Si hay siguiente si no es el último
      }
      if ( this.primerAudioEstablecido ) this.primerAudioEstablecido = false
      else this.ultimoAudioReproducidoNodeId = audio.nodeId
    }
  }

  protected obtenerIconoReproductorAudio(nodeId: string): string {
    return this.reproduciendoAudio && this.audioActualnodeId === nodeId ? this.icon('circle-pause') : this.icon('circle-play')
  }

  protected notificarEventoReproducirPausarAudio(): void {
    setTimeout(() => {
      this.reusableGestionarAudioService.reproducirPausarAudio(true)
    }, 200);
  }

  protected cambiarAudioReproductor(siguiente: boolean) {
    if (siguiente && this.reproductorConfig.existeSiguiente) {
      this.indiceAudioReproductorActual++
    }

    else if (!siguiente && this.reproductorConfig.existeAnterior) {
      this.indiceAudioReproductorActual--
    }

    this.reproduciendoAudio = false

    this.reproductorConfig = {
      fuente: this.audioActual.url,
      nombre: this.audioActual.nuDocumento || this.audioActual.coDocumento,
      existeAnterior: this.indiceAudioReproductorActual > 0, // Si hay anterior si no es el primero
      existeSiguiente: this.indiceAudioReproductorActual < this.listaAudios.length - 1 // Si hay siguiente si no es el último
    }

    this.ultimoAudioReproducidoNodeId = this.audioActual.nodeId

    const start = (this.query.page - 1) * this.query.limit
    const end = start + this.query.limit

    switch (this.indiceAudioReproductorActual) {
      case start - 1:
        this.paginator?.previousPage()
        break

      case end:
        this.paginator?.nextPage()
        break
    }

    this.setActiveRow(this.audioActual)
  }

  protected descargarAudioReproductor() {
    this.descargarAudio(this.audioActual)
  }

  protected eliminarAudioReproductor() {
    this.eliminarAudio(this.audioActual)
  }

  protected setActiveRow(audio: Audios): void {
    this.audioActualnodeId = audio.nodeId
  }

  get audioActual() {
    return this.listaAudios[this.indiceAudioReproductorActual]
  }

  //#region "Paginado"
  protected onPaginate(evento: any) {
    this.query.page = evento.page
    this.query.limit = evento.limit
    this.updatePagedItems()
  }

  protected updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit
    const end = start + this.query.limit

    this.listaAudiosFiltrados = this.listaAudios.slice(start, end)

    //SOLO PARA EL REPRODUCTOR
    this.setActiveRow(this.audioActual)
    this.reproducirAudio(this.audioActual)
  }
  //#endregion

  //#endregion

  //#region "Funciones de ayuda"
  protected icon(name: string): string {
    return `assets/icons/${name}.svg`
  }

  private mostrarDialog(icono: string, titulo: string, mensaje: string, accion: string, confirm: boolean, logicaNegocio: () => void): void {
    const ref = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icono,
        title: titulo,
        description: mensaje,
        confirmButtonText: accion,
        confirm: confirm,
      }
    })

    if (ref) {
      ref.onClose.subscribe({
        next: resp => {
          if (resp === 'confirm') {
            logicaNegocio()
          }
        }
      })
    }
  }

  protected cerrarModal(): void {
    this.ref.close()
  }

  get caracteresRestantes(): number {
    const value = this.formAudio.get('descripcionAudio')?.value
    return this.maxLengthDescripcion - (value ? value.length : 0)
  }

  protected getFormatFileSize(bytes: number): string {
    if (bytes === 0)
      return "0 Bytes"

    let sizes = ["Bytes", "KB", "MB"]
    let i = Math.floor(Math.log(bytes) / Math.log(1024))

    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
  }

}