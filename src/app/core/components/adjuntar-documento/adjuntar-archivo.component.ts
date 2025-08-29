import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RepositorioResponse } from '@models/notificaciones.model';
import { OrdenService } from '@services/shared/orden.service';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { MessagesModule } from 'primeng/messages';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-adjuntar-archivo',
  standalone: true,
  imports: [
    CommonModule,
    ProgressBarModule,
    MessagesModule,
    CalendarModule,
    FormsModule,
  ],
  templateUrl: './adjuntar-archivo.component.html',
  styleUrls: ['./adjuntar-archivo.component.scss'],
  providers: [MessageService, DatePipe],
})
export class AdjuntarDocumentoComponent {
  @ViewChild('inputFile') inputFile?: ElementRef<HTMLInputElement>;

  @Output()
  onSelect = new EventEmitter<File>();

  @Output()
  onChangeValuesCargo = new EventEmitter<{
    pesoArchivo: Number;
    tipoCopia: Number;
    fechaHoraRecepcion: String;
  }>();

  selectedFile: File | undefined;
  uploadProgress = 0;
  uploading = false;

  pesoArchivo!: number;
  tipoCopia = 0;
  fechaRecepcion!: string;
  horaRecepcion!: string;

  @Output()
  onUpload = new EventEmitter<{ response: RepositorioResponse; file: File }>();
  @Output()
  onRemove = new EventEmitter();

  constructor(
    protected ordenService: OrdenService,
    private messageService: MessageService,
    private datePipe: DatePipe
  ) {}

  openInputFile($event: MouseEvent) {
    $event.preventDefault();

    this.inputFile?.nativeElement.click();
  }

  onSelectFile($event: Event) {
    this.messageService.clear();
    const selectedFile = this.inputFile?.nativeElement.files?.[0];

    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Seleccione un archivo válido. Solo se aceptan archivos PDF',
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
  }

  private hasValidSize(file: File): boolean {
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
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
    this.inputFile!.nativeElement.value = '';
  }

  onChangeValues() {
    console.log(this.datePipe.transform(this.fechaRecepcion, 'dd/MM/yyyy'));
    const cargo = {
      pesoArchivo: this.selectedFile!.size,
      tipoCopia: this.tipoCopia,
      fechaHoraRecepcion:
        (this.fechaRecepcion
          ? this.datePipe.transform(this.fechaRecepcion, 'dd/MM/yyyy')
          : '') +
        ' ' +
        (this.horaRecepcion
          ? this.datePipe.transform(this.horaRecepcion, 'hh:mm a')
          : ''),
    };

    this.onChangeValuesCargo.emit(cargo);
  }
}
