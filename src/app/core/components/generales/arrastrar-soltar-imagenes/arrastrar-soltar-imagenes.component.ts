import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { obtenerIcono } from '@core/utils/icon';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
//import { saveAs } from 'file-saver';
import { FormControl } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [FileUploadModule, CommonModule, ButtonModule, ImageModule],
  selector: 'app-arrastrar-soltar-imagenes',
  templateUrl: './arrastrar-soltar-imagenes.component.html',
  styleUrls: ['./arrastrar-soltar-imagenes.component.scss'],
})
export class ArrastrarSoltarImagenesComponent implements OnInit {
  entradaArchivo!: HTMLInputElement;
  imgMiniatura: SafeUrl | null = null;
  nombreArchivo: string | null = null;
  tamanoArchivo: string | null = null;
  //mostrarDetallesArchivo: boolean = false;
  mostrarTamanoError: boolean = false;
  mensajeErrorTamano: string = '';

  @Input() subirArchivo: string = '';
  @Input() textoDetallado: string = '';
  @Input() eliminarArchivo: string = '';
  @Input() indice: number | undefined;
  @Input() archivoAdjuntoControl!: FormControl;
  @Output() archivoCargado: EventEmitter<{
    archivo: File;
    contenido: string | ArrayBuffer | null;
    indice: number;
  }> = new EventEmitter<{
    archivo: File;
    contenido: string | ArrayBuffer | null;
    indice: number;
  }>();
  @Input() miniaturaImagen!: string | ArrayBuffer | null;
  @Input() mostrarEnlaceEliminar: boolean | null = true;
  @Input() mostrarDetallesArchivo: boolean = false;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    //Visualizar la imagen en modo editar
    if (typeof this.miniaturaImagen === 'string' && this.miniaturaImagen.trim() !== '') {
      this.mostrarDetallesArchivo = true;
      this.imgMiniatura = this.miniaturaImagen;
    }else{
      this.mostrarDetallesArchivo = false;
    }
  }

  public onFileUpload(event: any): void {

  }
  public async seleccionarArchivo(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    const archivoSeleccionado = inputElement.files && inputElement.files[0];

    if (archivoSeleccionado) {
      // Validar el tamaño del archivo
      if (this.validarTamanoArchivo(archivoSeleccionado.size)) {
        return;
      }
      this.leerContenidoArchivo(archivoSeleccionado);
      this.mostrarDetallesArchivo = true;
      this.showFileDetails(archivoSeleccionado);
    }
  }

  public showFileDetails(selectedFile: File): void {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.imgMiniatura = e.target?.result;
      this.nombreArchivo = selectedFile.name;
      this.tamanoArchivo = this.formatoTamanoArchivo(selectedFile.size);
    };

    reader.readAsDataURL(selectedFile);
  }

  public deleteFile(): void {
    this.mostrarDetallesArchivo = false;
    this.imgMiniatura = null;
    this.nombreArchivo = null;
    this.tamanoArchivo = null;
  }

  public formatoTamanoArchivo(size: number): string {
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  public soltarArchivo(event: DragEvent): void {
    event.preventDefault();
    const droppedFiles = event.dataTransfer?.files;

    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      // Validar el tamaño del archivo
      if (this.validarTamanoArchivo(droppedFile.size)) {
        return;
      }
      this.leerContenidoArchivo(droppedFile);
      this.mostrarDetallesArchivo = true;
      this.showFileDetails(droppedFiles[0]);
    }
  }

  public arrastrarArchivo(event: DragEvent): void {
    event.preventDefault();
  }

  private validarTamanoArchivo(tamano: number): boolean {
    if (tamano > 10 * 1024 * 1024) {
      this.mostrarTamanoError = true;
      this.mensajeErrorTamano = 'El archivo no puede exceder los 10 MB';

      setTimeout(() => {
        this.mostrarTamanoError = false;
      }, 5000);

      return true;
    }

    return false;
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  public descargarArchivo() {
    const nombreArchivoSinExtension =
      this.nombreArchivo?.split('.')[0] || 'archivo';
    const extensionArchivo = this.getFileExtension(this.imgMiniatura as string);
    const nombreArchivoDescargado = `${nombreArchivoSinExtension}.${extensionArchivo}`;

    const link = document.createElement('a');
    link.href = this.imgMiniatura as string;
    link.download = nombreArchivoDescargado;
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  getMimeType(base64Data: string): string | null {
    const matches = base64Data.match(
      /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/
    );
    return matches ? matches[1] : null;
  }

  getFileExtension(mimeType: string): string {
    const type = mimeType.split(';')[0];
    const extension = type.split('/')[1];
    return extension;
  }


  leerContenidoArchivo(archivo: File): void {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.archivoCargado.emit({
        archivo,
        contenido: e.target?.result,
        indice: this.indice!,
      });
    };

    reader.readAsDataURL(archivo);
  }

  base64ToBlob(base64Data: string, mimeType: string): Blob {
    const sliceSize = 512;
    const byteCharacters = atob(base64Data);
    const byteArrays: Uint8Array[] = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  }
}
