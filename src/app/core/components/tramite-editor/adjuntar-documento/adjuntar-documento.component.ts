import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { RepositorioResponse } from '@models/notificaciones.model';
import { OrdenService } from '@services/shared/orden.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ProgressBarModule } from 'primeng/progressbar';
@Component({
  selector: 'app-adjuntar-documento',
  standalone: true,
  imports: [CommonModule, CmpLibModule, ProgressBarModule, MessagesModule],
  templateUrl: './adjuntar-documento.component.html',
  styleUrls: ['./adjuntar-documento.component.scss'],
  providers: [MessageService],
})
export class AdjuntarDocumentoComponent {
  @ViewChild('inputFile') inputFile!: ElementRef<HTMLInputElement>;

  @Output()
  onSelect = new EventEmitter<File>();

  selectedFile: File | undefined;
  uploadProgress = 0;
  uploading = false;
  @Input()
  @Input()
  mensaje: string = 'Word';
  firmado = false;

  @Input()
  fileAceptados =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  @Output()
  onUpload = new EventEmitter<{ response: RepositorioResponse; file: File }>();
  @Output()
  onRemove = new EventEmitter();

  constructor(
    protected ordenService: OrdenService,
    private messageService: MessageService
  ) {}

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  onDragEnter(e: DragEvent) {
    e.stopPropagation();
    e.preventDefault();
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
  }

  public onDrop(event: any): void {
    event.preventDefault();
    const droppedFiles = event.dataTransfer
      ? event.dataTransfer.files
      : event.target.files;

    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];

      if (!this.hasValidSize(droppedFile)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El archivo no debe pesar más de 10MB',
          life: 4000,
        });
        return;
      }
      this.selectedFile = droppedFiles[0];
      this.onSelect.emit(droppedFiles[0]);
      // this.subirArchivo(droppedFiles[0])
    }
  }
  openInputFile($event: MouseEvent) {
    $event.preventDefault();

    this.inputFile?.nativeElement.click();
  }

  onSelectFile($event: Event) {
    this.messageService.clear();
    const selectedFile = this.inputFile?.nativeElement.files?.[0];
    //console.log("por aqui...."+selectedFile.type)
    if (!selectedFile || selectedFile.type !== this.fileAceptados) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Selccione un archivo válido. Solo se aceptan archivos ' +
          this.fileAceptados,
        life: 4000,
      });
      return;
    }

    if (!this.hasValidSize(selectedFile)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El archivo no debe pesar más de 10MB',
        life: 4000,
      });
      return;
    }
    this.selectedFile = selectedFile;
    this.onSelect.emit(selectedFile);
    // this.subirArchivo(selectedFile)
  }

  private hasValidSize(file: File): boolean {
    const maxSizeInBytes = 100 * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  formatFileSize(bytes: number) {
    if (bytes == 0) return '0 Bytes';
    let k = 1024;
    let sizes = ['Bytes', 'KB', 'MB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${
      sizes[i] ?? 'MB'
    }`;
  }

  removeSelectedFile($event: MouseEvent) {
    $event.preventDefault();
    this.selectedFile = undefined;
    this.onRemove.emit(this.selectedFile);
    this.inputFile.nativeElement.value = '';
    this.firmado = false;
  }
}
