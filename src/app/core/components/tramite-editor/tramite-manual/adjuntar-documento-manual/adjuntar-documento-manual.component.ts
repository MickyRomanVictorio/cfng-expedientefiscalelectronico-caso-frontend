import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Injectable,
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
  selector: 'app-adjuntar-documento-manual',
  standalone: true,
  imports: [CommonModule, CmpLibModule, ProgressBarModule, MessagesModule],
  templateUrl: './adjuntar-documento-manual.component.html',
  styleUrls: ['./adjuntar-documento-manual.component.scss'],
  providers: [MessageService],
})
@Injectable()
export class AdjuntarDocumentoManualComponent {
  @ViewChild('inputFile') inputFile?: ElementRef<HTMLInputElement>;

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
  fileAceptadosMensaje = '';

  fileAceptados =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  fileExtension: string | undefined = '';
  fileSize = '';
  fileNameSave = '';

  @Output()
  onUpload = new EventEmitter<{ response: RepositorioResponse; file: File }>();
  @Output()
  onRemove = new EventEmitter();

  constructor(
    protected ordenService: OrdenService,
    private messageService: MessageService
  ) { }

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
    }
  }
  openInputFile($event: MouseEvent) {
    $event.preventDefault();

    this.inputFile?.nativeElement.click();
  }

  onSelectFile($event: Event) {
    this.messageService.clear();
    const selectedFile: any = this.inputFile?.nativeElement.files?.[0];

    
    this.fileExtension = /[.]/.exec(selectedFile.name)
      ? /[^.]+$/.exec(selectedFile.name)![0]
      : undefined;
    this.fileSize = this.formatFileSize(selectedFile.size);
    this.fileNameSave = selectedFile.name;
    console.log('fileExtension: ', selectedFile.type);
    console.log('fileSize: ', selectedFile.size);
    console.log('fileNameSave: ', selectedFile.name);

    if (!selectedFile || selectedFile.type !== this.fileAceptados) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Seleccione un archivo válido. Solo se aceptan archivos ' +
          this.fileAceptadosMensaje,
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
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i] ?? 'MB'
      }`;
  }

  removeSelectedFile($event: MouseEvent) {
    $event.preventDefault();
    this.selectedFile = undefined;
    this.onRemove.emit(this.selectedFile);
    this.inputFile!.nativeElement.value = '';
    this.fileNameSave = '';
    this.firmado = false;
  }

  downloadSelectedFile($event: MouseEvent) {
    $event.preventDefault();
    let newVariable: any = window.navigator;
  //   ;
    const reader = new FileReader();
    reader.readAsArrayBuffer(this.selectedFile!);
    reader.onload = () => {
      const blob = new Blob([reader.result!], {
        type: this.selectedFile!.type,
      });
      //this.uploadImage(blob);
      if (newVariable && newVariable.msSaveOrOpenBlob) {
        let name = this.fileNameSave;
        newVariable.msSaveOrOpenBlob(blob, name);
      } else {
        const fileUrl = URL.createObjectURL(blob);
        const child = window.open(fileUrl);
      }
    };
  }
}
