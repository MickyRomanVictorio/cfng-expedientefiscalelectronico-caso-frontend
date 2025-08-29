import { Component, ElementRef, EventEmitter, inject, Output, Renderer2, ViewChild } from '@angular/core'
import { MessagesModule } from 'primeng/messages'
import { CommonModule, DatePipe } from '@angular/common'
import { ProgressBarModule } from 'primeng/progressbar'
import { CalendarModule } from 'primeng/calendar'
import { FormsModule } from '@angular/forms'
import { MessageService } from 'primeng/api'
@Component({
  selector: 'app-subir-archivo',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    MessagesModule,
    ProgressBarModule,
  ],
  templateUrl: './subir-archivo.component.html',
  styleUrl: './subir-archivo.component.scss',
  providers: [MessageService, DatePipe],
})
export class SubirArchivoComponent {

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

  protected readonly TAMANIO_EN_MEGABYTES : number = 5

  protected readonly TAMANIO_MAXIMO_ARCHIVO : number =  this.TAMANIO_EN_MEGABYTES * 1024 * 1024;

  @Output()
  onRemove = new EventEmitter()

  formatosAceptados: string[] = ['mp4','avi', 'webm', 'mov', 'jpg', 'jpeg', 'png','mp3', 'aac', 'ogg', 'pdf']

  private readonly messageService = inject(MessageService)
  private readonly elementRef = inject(ElementRef)
  private readonly renderer = inject(Renderer2)



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

    this.selectedFile = selectedFile

    const formattedSize = this.obtenerFormatoTamano(selectedFile.size)

    this.onSelect.emit({
      isSelect: false,
      file: selectedFile,
      duration: null,
      size: formattedSize,
      imgDoc: 'audio',
    })

  }

  private InformarTamanoMaximoExcedido(): void {
    this.messageService.clear()
    this.messageService.add({
      severity: 'error',
      summary: 'Peso excedido',
      detail: `El peso máximo es de ${this.obtenerFormatoTamano(this.TAMANIO_MAXIMO_ARCHIVO)}`,
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


  protected removerArchivoSeleccionado($event: MouseEvent) {
    $event.preventDefault()
    this.selectedFile = undefined
    this.onRemove.emit(this.selectedFile)
  }

  private validarTamano(file: File): boolean {
    const maxSizeInBytes = this.TAMANIO_MAXIMO_ARCHIVO
    console.log("Peso archivo "+file.size);
    console.log("Peso general audio "+this.TAMANIO_MAXIMO_ARCHIVO);
    console.log(file.size <= maxSizeInBytes);

    return file.size <= maxSizeInBytes
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