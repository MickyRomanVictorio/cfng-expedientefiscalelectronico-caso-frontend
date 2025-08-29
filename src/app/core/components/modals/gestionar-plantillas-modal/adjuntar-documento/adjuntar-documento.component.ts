import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  Input,
  Injectable,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepositorioResponse } from '@models/notificaciones.model';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { OrdenService } from '@services/shared/orden.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
@Component({
  selector: 'app-adjuntar-documento',
  standalone: true,
  imports: [CommonModule, CmpLibModule, ProgressBarModule, MessagesModule],
  templateUrl: './adjuntar-documento.component.html',
  styleUrls: ['./adjuntar-documento.component.scss'],
  providers: [MessageService],
})
@Injectable()
export class AdjuntarDocumentoComponent {
  @ViewChild('inputFile') inputFile?: ElementRef<HTMLInputElement>;
 
   /* @Output() onUpload = new EventEmitter<{ response: RepositorioResponse; file: File }>(); */
  
  @Output()
  onSelect = new EventEmitter<File>();

  selectedFile: File | undefined;
  uploadProgress = 0;
  uploading = false;
  @Input() mensaje: string = 'Word';
  @Input()
  firmado = false;
  @Input()
  fileAceptadosMensaje = '';

  fileAceptados =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  fileExtension: any = '';
  fileSize = '';
  fileNameSave = '';

 
  /* @Output()
  onRemove = new EventEmitter(); */

  constructor(
    protected ordenService: OrdenService,
    private messageService: MessageService
  ) {}

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  onDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation(); 
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation
  }
  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    console.log("el evento ondrop", event.dataTransfer)
    //const file = event.dataTransfer?.files[0];
    const droppedFiles = event.dataTransfer?.files[0]
    //  ? event.dataTransfer.files[0]
    //  : event.target.files;
      if (!this.validarTipoyTamanioArchivo(droppedFiles!)) {
        return;
      }
   this.selectedFile = droppedFiles;
    this.onSelect.emit(droppedFiles);
    // this.subirArchivo(droppedFiles[0]);
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

    if (!this.validarTipoyTamanioArchivo(selectedFile)) {
      return;
    }
    this.selectedFile = selectedFile;
    this.onSelect.emit(selectedFile);
  }
  private validarTipoyTamanioArchivo(selectedFile: File): boolean {
    if (!selectedFile || selectedFile.type !== this.fileAceptados) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Seleccione un archivo válido. Solo se aceptan archivos ' +
          this.fileAceptadosMensaje,
        life: 4000,
      });
      return false;
    }

    if (!this.hasValidSize(selectedFile)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El archivo no debe pesar más de 100MB',
        life: 4000,
      });
      return false;
    }
    return true;
  }
  private hasValidSize(file: File): boolean {
    const maxSizeInBytes = 100 * 1024 * 1024;
    console.log(file.size);
    console.log(maxSizeInBytes);
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

  limpiarCampos() {
    this.selectedFile = undefined;
    this.inputFile!.nativeElement.value = '';
    this.fileExtension = '';
    this.fileSize = '';
    this.fileNameSave = '';
  }
  /* removeSelectedFile($event: MouseEvent) {
    $event.preventDefault();
    this.selectedFile = undefined;
    this.onRemove.emit(this.selectedFile);
    this.inputFile!.nativeElement.value = '';
    this.firmado = false;
  }
  downloadSelectedFile($event: MouseEvent) {
    $event.preventDefault();
    console.log('descargando archivo');
    let newVariable: any = window.navigator;

    const reader = new FileReader();
    reader.readAsArrayBuffer(this.selectedFile!);
    reader.onload = () => {
      const blob = new Blob([reader.result!], {
        type: this.selectedFile!.type,
      });
      if (newVariable && newVariable.msSaveOrOpenBlob) {
        let name = this.fileNameSave;
        newVariable.msSaveOrOpenBlob(blob, name);
      } else {
        const fileUrl = URL.createObjectURL(blob);
        const child = window.open(fileUrl);
      }
    };
  } */

/*   subirArchivo(file: File) {
    this.uploading = true;
    const formData = new FormData();
    formData.append('file', file);

    this.ordenService.subirDocumentoARepositorio(formData).subscribe({
      next: (event: HttpEvent<RepositorioResponse>) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total!);
          console.log(this.uploadProgress);
        } else if (event.type === HttpEventType.Response) {
          this.uploading = false;
          const response: any = event.body;
          this.onUpload.emit({ response, file });
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'El archivo se subió con éxito',
            life: 4000,
          });
        }
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ha ocurrido un error inesperado. Inténtelo más tarde',
          life: 4000,
        });
        console.log(error);
        this.uploading = false;
      },
    });
  } */
}
