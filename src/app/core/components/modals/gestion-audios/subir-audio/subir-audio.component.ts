import { Component, ElementRef, EventEmitter, inject, Output, Renderer2, ViewChild } from '@angular/core'
import { MessagesModule } from 'primeng/messages'
import { CommonModule, DatePipe } from '@angular/common'
import { ProgressBarModule } from 'primeng/progressbar'
import { CalendarModule } from 'primeng/calendar'
import { FormsModule } from '@angular/forms'
import { MessageService } from 'primeng/api'
import { TAMANIO_MAXIMO_ARCHIVO_AUDIOS, TAMANIO_EN_MEGABYTES } from '@environments/environment'
import { ReusableGestionarAudioService } from '@core/services/reusables/reusable-gestionar-audio.service'
@Component({
  selector: 'app-subir-audio',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    MessagesModule,
    ProgressBarModule,
  ],
  templateUrl: './subir-audio.component.html',
  styleUrl: './subir-audio.component.scss',
  providers: [MessageService, DatePipe],
})
export class SubirAudioComponent {

  @ViewChild('inputFile') inputFile?: ElementRef<HTMLInputElement>

  @Output()
  onSelect = new EventEmitter<{
    isSelect: boolean
    file: File
    duration: string | null
    size: string
    imgDoc: string
  }>()

  selectedFile: File | undefined
  uploadProgress = 0
  uploading = false

  protected readonly TAMANIO_EN_MEGABYTES = TAMANIO_EN_MEGABYTES

  @Output()
  onRemove = new EventEmitter()

  formatosAceptados: string[] = ['mp3', 'aac', 'ogg']

  private readonly messageService = inject(MessageService)
  private readonly elementRef = inject(ElementRef)
  private readonly renderer = inject(Renderer2)
  private readonly reusableGestionAudios = inject(ReusableGestionarAudioService)

  ngOnInit(): void {
    this.reusableGestionAudios.tamanoMaximoExcedidoObservable.subscribe({
      next: excedido => {
        excedido && this.InformarTamanoMaximoExcedido()
      }
    })
  }

  get formatosConPunto(): string {
    return this.formatosAceptados.map(formato => `.${formato}`).join(', ')
  }

  protected seleccionarArchivoAudio($event: MouseEvent) {
    $event.preventDefault()
    this.inputFile?.nativeElement.click()
  }

  public alSeleccionarArchivoAdjunto($event: any) {

    this.messageService.clear()

    const selectedFile = this.inputFile?.nativeElement.files?.[0] || $event

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()

    if (!selectedFile || !this.formatosAceptados.includes(fileExtension)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Formato no admitido',
        detail:
          `Los formatos permitidos son: ${this.formatosAceptados.join(', ')}`,
        life: 2500,
      })
      this.limpiarArchivoSeleccionado()
      return
    }

    if (!this.validarTamano(selectedFile)) {
      this.InformarTamanoMaximoExcedido()
      return
    }
    if (selectedFile.type === 'audio/mpeg' || selectedFile.type === 'audio/ogg') {

      this.obtenerDuracionAudio(selectedFile).then((durationInMinutes) => {
        this.selectedFile = selectedFile

        const formattedDuration = this.formatoDuracion(durationInMinutes)
        const formattedSize = this.obtenerFormatoTamano(selectedFile.size)

        this.onSelect.emit({
          isSelect: false,
          file: selectedFile,
          duration: formattedDuration,
          size: formattedSize,
          imgDoc: 'audio',
        })
      })
        .catch((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error : ' + error,
            detail: 'No se pudo obtener la duración del archivo de audio.',
            life: 2000,
          })
        })
    }
  }

  private InformarTamanoMaximoExcedido(): void {
    this.messageService.clear()
    this.messageService.add({
      severity: 'error',
      summary: 'Peso excedido',
      detail: `El peso máximo es de ${this.obtenerFormatoTamano(TAMANIO_MAXIMO_ARCHIVO_AUDIOS)}`,
      life: 2000,
    })
    this.limpiarArchivoSeleccionado()
  }

  public limpiarArchivoSeleccionado(): void {
    if (this.inputFile?.nativeElement) {
      this.inputFile.nativeElement.value = ''
    }
    this.selectedFile = undefined
  }

  protected obtenerFormatoTamano(bytes: number): string {
    if (bytes === 0)
      return '0 Bytes'
    let sizes = ['Bytes', 'KB', 'MB']
    let i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
  }

  private formatoDuracion(duration: number): string {
    const totalSeconds = Math.floor(duration * 60)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${this.padZero(minutes)}:${this.padZero(seconds)} min`
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`
  }

  protected removerArchivoSeleccionado($event: MouseEvent) {
    $event.preventDefault()
    this.selectedFile = undefined
    this.onRemove.emit(this.selectedFile)
  }

  private validarTamano(file: File): boolean {
    const maxSizeInBytes = TAMANIO_MAXIMO_ARCHIVO_AUDIOS
    console.log("Peso archivo "+file.size);
    console.log("Peso general audio "+TAMANIO_MAXIMO_ARCHIVO_AUDIOS);
    console.log(file.size <= maxSizeInBytes);

    return file.size <= maxSizeInBytes
  }

  private obtenerDuracionAudio(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const objectUrl = URL.createObjectURL(file)
      const cleanup = () => {
        URL.revokeObjectURL(objectUrl)
      }
      audio.src = objectUrl
      audio.onloadedmetadata = () => {
        cleanup()
        resolve(audio.duration / 60) // Duración en minutos
      }
      audio.onerror = (error) => {
        cleanup()
        reject(new Error('Error al cargar el archivo de audio'))
      }
    })
  }

  protected onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
    this.renderer.addClass(this.elementRef.nativeElement.querySelector('.subir-audio-contenedor'), 'dragover');
  }

  protected onDragLeave() {
    this.renderer.removeClass(this.elementRef.nativeElement.querySelector('.subir-audio-contenedor'), 'dragover');
  }

  protected onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.renderer.removeClass(this.elementRef.nativeElement.querySelector('.subir-audio-contenedor'), 'dragover');
    const files = event.dataTransfer!.files
    if (files.length > 0) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(files[0])
      this.inputFile!.nativeElement.files = dataTransfer.files
      this.alSeleccionarArchivoAdjunto(event);
    }
  }

}