import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { CalendarModule } from "primeng/calendar";
import { MessagesModule } from "primeng/messages";
import { ProgressBarModule } from "primeng/progressbar";

@Component({
  selector: "app-adjuntar-archivo-manual",
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    MessagesModule,
    ProgressBarModule,
  ],
  templateUrl: "./adjuntar-archivo-manual.component.html",
  styleUrl: "./adjuntar-archivo-manual.component.scss",
  providers: [MessageService, DatePipe],
})
export class AdjuntarArchivoManualComponent {
  @ViewChild("inputFile") inputFile?: ElementRef<HTMLInputElement>;

  @Output()
  onSelect = new EventEmitter<{
    isSelect: boolean;
    file: File;
    duration: string | null;
    size: string;
    imgDoc: string;
  }>();

  selectedFile: File | undefined;
  uploadProgress = 0;
  uploading = false;

  tipoCopia = 0;

  @Output()
  onRemove = new EventEmitter();

  formatosAceptados: string[] = ["mp3", "mp4", "jpg", "png", "pdf"];

  constructor(private messageService: MessageService) {}

  openInputFile($event: MouseEvent) {
    $event.preventDefault();

    this.inputFile?.nativeElement.click();
  }

  onSelectFileAttach($event: Event) {
    this.messageService.clear();
    const selectedFile = this.inputFile?.nativeElement.files?.[0];

    if (
      !selectedFile ||
      !this.formatosAceptados.some((text) => text !== selectedFile.type)
    ) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail:
          "Seleccione un archivo válido. Formatos aceptados: .mp3 .mp4 .jpg .png .pdf",
        life: 2000,
      });
      return;
    }

    if (!this.hasValidSize(selectedFile)) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "El archivo no debe pesar más de 100MB",
        life: 2000,
      });
      return;
    }

    if (selectedFile.type === "audio/mpeg") {
      this.getAudioDuration(selectedFile)
        .then((durationInMinutes) => {
          this.selectedFile = selectedFile;
          const formattedDuration = this.formatDuration(durationInMinutes);
          const formattedSize = this.getFormatFileSize(selectedFile.size);
          this.onSelect.emit({
            isSelect: false,
            file: selectedFile,
            duration: formattedDuration,
            size: formattedSize,
            imgDoc: "audio",
          });
        })
        .catch((error) => {
          this.messageService.add({
            severity: "error",
            summary: "Error : " + error,
            detail: "No se pudo obtener la duración del archivo de audio.",
            life: 2000,
          });
        });
    } else if (selectedFile.type === "video/mp4") {
      this.getVideoDuration(selectedFile)
        .then((durationInMinutes) => {
          this.selectedFile = selectedFile;
          const formattedDuration = this.formatDuration(durationInMinutes);
          const formattedSize = this.getFormatFileSize(selectedFile.size);
          this.onSelect.emit({
            isSelect: false,
            file: selectedFile,
            duration: formattedDuration,
            size: formattedSize,
            imgDoc: "video",
          });
        })
        .catch((error) => {
          this.messageService.add({
            severity: "error",
            summary: "Error : " + error,
            detail: "No se pudo obtener la duración del archivo de video.",
            life: 2000,
          });
        });
    } else if (selectedFile.type === "application/pdf") {
      this.selectedFile = selectedFile;
      const formattedSize = this.getFormatFileSize(selectedFile.size);
      this.onSelect.emit({
        isSelect: false,
        file: selectedFile,
        duration: "---",
        size: formattedSize,
        imgDoc: "documento",
      });
    } else {
      this.selectedFile = selectedFile;
      const formattedSize = this.getFormatFileSize(selectedFile.size);
      this.onSelect.emit({
        isSelect: false,
        file: selectedFile,
        duration: "---",
        size: formattedSize,
        imgDoc: "imagen",
      });
    }
  }

  getFormatFileSize(bytes: number) {
    if (bytes == 0) return "0 Bytes";
    let sizes = ["Bytes", "KB", "MB"];
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${
      sizes[i] ?? "MB"
    }`;
  }

  private formatDuration(duration: number): string {
    const totalSeconds = Math.floor(duration * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(seconds)} min`;
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  removeSelectedFile($event: MouseEvent) {
    $event.preventDefault();
    this.selectedFile = undefined;
    this.onRemove.emit(this.selectedFile);
  }

  selectedFileToUndefined() {
    this.selectedFile = undefined;
  }

  private hasValidSize(file: File): boolean {
    const maxSizeInBytes = 100 * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  private getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);

      audio.src = objectUrl;
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl); // Liberar el objeto URL
        resolve(audio.duration / 60); // Duración en minutos
      };
      audio.onerror = (error) => {
        URL.revokeObjectURL(objectUrl);
        reject("Error al cargar el archivo de audio");
      };
    });
  }

  private getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const objectUrl = URL.createObjectURL(file);

      video.src = objectUrl;
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl); // Liberar el objeto URL
        resolve(video.duration / 60); // Duración en minutos
      };
      video.onerror = (error) => {
        URL.revokeObjectURL(objectUrl);
        reject("Error al cargar el archivo de video");
      };
    });
  }
}
