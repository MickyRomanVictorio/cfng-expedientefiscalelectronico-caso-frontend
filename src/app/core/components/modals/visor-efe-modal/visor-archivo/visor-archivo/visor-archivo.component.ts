import { CommonModule, NgClass, NgStyle } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AlertaData } from '@interfaces/comunes/alert';
import { ReusableArchivoService } from '@services/reusables/reusable-archivos.service';
import { ReusableGestionarAudioService } from '@core/services/reusables/reusable-gestionar-audio.service';
import { Subscription } from 'rxjs';

export enum TipoArchivo {
  Ninguno = '',
  Documento = 'documento',
  Audio = 'audio',
  Video = 'video',
  Imagen = 'imagen'
}

export interface ArchivoReproductor {
  fuente: string,
  nombre: string,
  existeAnterior: boolean,
  existeSiguiente: boolean
}

@Component({
  selector: 'app-visor-archivo',
  standalone: true,
  imports: [FormsModule, NgStyle, NgClass, NgxExtendedPdfViewerModule,CommonModule],
  templateUrl: './visor-archivo.component.html',
  styleUrl: './visor-archivo.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class VisorArchivoComponent implements OnInit {
  protected readonly tipoArchivoENUM = TipoArchivo;

  private reproductorPlayer !: HTMLAudioElement | HTMLVideoElement;
  private _archivoReproductor: ArchivoReproductor = {
    fuente: '',
    nombre: 'Sin título',
    existeAnterior: false,
    existeSiguiente: false
  };

  protected reproduciendo: boolean = false;
  protected silenciado: boolean = false;
  protected tiempoActual: number = 0;
  protected duracion: number = 0;
  protected valorBarra: number = 0;
  protected pantallaCompleta: boolean = false;

  protected volumen: number = 0.5; // Valor entre 0 y 1
  protected volumenAnterior: number = this.volumen;

  protected tiempoTooltip: number = 0;
  protected posicionTooltip: number = 0;
  protected tooltipVisible: boolean = false;

  protected mostrarBotonDescargar: boolean = false;
  protected mostrarBotonEliminar: boolean = false;

  private suscripciones: Subscription[] = []

  @Input({ required: true }) public tipoArchivo: TipoArchivo = TipoArchivo.Ninguno;

  @Input() public modoLectura!: boolean;

  @Input() public archivo: string = '';
  @Input('archivoReproductor') set archivoReproductorSetter(value: ArchivoReproductor) {
    this._archivoReproductor = value;
    this.cargarNuevoArchivo();
  }

  @Output() eventoSiguiente = new EventEmitter<void>();
  @Output() eventoAnterior = new EventEmitter<void>();

  @Output() eventoDescargar = new EventEmitter<void>();
  @Output() eventoEliminar = new EventEmitter<void>();

  @ViewChild('playerRef') protected readonly audioPlayerRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('videoPlayerRef') protected readonly videoPlayerRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('fullScreenContainer') protected readonly fullScreenContainerRef!: ElementRef;

  public pdfUrl: any;

  private onLoadedData: () => void = () => {};
  private onCanPlayThrough: () => void = () => {};
  private onEnded: () => void = () => {};

  constructor(private readonly spiner: NgxSpinnerService,
              private readonly sanitizer: DomSanitizer,
              private readonly dialogService: DialogService,
              private readonly reusableArchivo: ReusableArchivoService,
              private readonly reusableGestionarAudio: ReusableGestionarAudioService) {
  }

  ngOnInit(): void {
    this.mostrarBotonEliminar = this.eventoEliminar.observers.length > 0;
    this.mostrarBotonDescargar = this.eventoDescargar.observers.length > 0;

    document.addEventListener('fullscreenchange', () => {
      this.pantallaCompleta = !!document.fullscreenElement;
    });

    this.suscripciones.push(
      this.reusableGestionarAudio.reproducirPausarObservable.subscribe({
        next: valor => {
          valor && this.eventoGenericoAlternarReproduccionPausa()
        }
      })
    )

  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(s => s.unsubscribe())
    if (this.reproductorPlayer) {
      this.reproductorPlayer.pause()
      this.reproductorPlayer.src = ''
      this.reproductorPlayer.load()
      this.reproductorPlayer = null!
    }
  }

  //#region "Funciones Publicas"
  public inicializar(tipoArchivo: TipoArchivo,
                     archivo: string,
                     archivoId: string = "",
                     nombreArchivo: string = "") {

    if (tipoArchivo == TipoArchivo.Audio) {
      this.archivoReproductorSetter = {
        fuente: archivo,
        nombre: nombreArchivo,
        existeAnterior: false,
        existeSiguiente: false,
      };
    }
    if (archivoId || nombreArchivo) {

      this.reiniciarValores();

      this.tipoArchivo = tipoArchivo;


      this.spiner.show();

      this.reusableArchivo.verArchivo(archivoId, nombreArchivo).subscribe({
        next: (resp: Blob) => {
          this.spiner.hide();
          if (resp.size > 0) {



            const fileUrl = window.URL.createObjectURL(resp);

            if (this.tipoArchivo === TipoArchivo.Documento) {
              this.pdfUrl = fileUrl;
              //console.log('la URL temporal de pdfs :' + this.pdfUrl);
            } else {
              this.archivo = fileUrl;

              //console.log('la URL temporal de videos y audios es :' + this.archivo);
            }


          } else {
            this.mensajeError('Aviso', 'Documento sin contenido');
          }
        },
        error: () => {
          this.mensajeError('Aviso', 'No se encontro el documento');
          this.spiner.hide();
        }
      });

    }

  }

  protected icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
  //#endregion

  //#region "Funciones Privadas"
  private reiniciarValores() {
    this.duracion = 0;
    this.valorBarra = 0;
    this.tiempoActual = 0;
    this.silenciado = false;
    this.reproduciendo = false;
    this.pantallaCompleta = false;
  }

  private cargarNuevoArchivo() {
    if (this.reproductorPlayer) {
      this.reiniciarValores();

      this.reproductorPlayer.pause();
      this.reproductorPlayer.load();

      // this.reproductorPlayer.play();
      this.reusableGestionarAudio.notificarSeEstaReproduciendo(false)
      this.reproduciendo = false;
    }
  }

  //#endregion

  //#region "Getters"
  get archivoReproductor(): ArchivoReproductor {
    return this._archivoReproductor;
  }
  //#endregion

  protected eventoGenericoCargarMetadata(tipoArchivo: string): void {
    this.reproductorPlayer = tipoArchivo === this.tipoArchivoENUM.Audio ?
      this.audioPlayerRef.nativeElement : this.videoPlayerRef.nativeElement;

    if (this.reproductorPlayer) {

      // Primero, limpiar listeners anteriores si se registraron antes
      this.reproductorPlayer.removeEventListener('loadeddata', this.onLoadedData);
      this.reproductorPlayer.removeEventListener('canplaythrough', this.onCanPlayThrough);
      this.reproductorPlayer.removeEventListener('ended', this.onEnded);

      // Asignar las funciones como propiedades para poder removerlas luego
      this.onLoadedData = () => {
        setTimeout(() => {
          this.duracion = this.reproductorPlayer.duration;
        }, 100);
      };

      this.onCanPlayThrough = () => {
        setTimeout(() => {
          this.duracion = this.reproductorPlayer.duration;
        }, 100);
      };

      this.onEnded = () => {
        this.reproduciendo = false;
        this.reusableGestionarAudio.notificarSeEstaReproduciendo(this.reproduciendo)
      };

      // Registrar los eventos
      this.reproductorPlayer.addEventListener('loadeddata', this.onLoadedData);
      this.reproductorPlayer.addEventListener('canplaythrough', this.onCanPlayThrough);
      this.reproductorPlayer.addEventListener('ended', this.onEnded);

     /* this.reproductorPlayer.addEventListener('loadeddata', () => {
        setTimeout(() => {
          this.duracion = this.reproductorPlayer.duration;
        }, 100);
      });

      this.reproductorPlayer.addEventListener('canplaythrough', () => {
        this.duracion = this.reproductorPlayer.duration;
      });

      this.reproductorPlayer.addEventListener('ended', () => {
        this.reproduciendo = false;
      });  */

      this.ocultarSpinner();
    }
  }

  protected eventoGenericoActualizarTiempo(): void {
    if (this.reproductorPlayer && this.duracion) {
      this.tiempoActual = this.reproductorPlayer.currentTime;

      if (Math.abs(this.duracion - this.tiempoActual) < 0.5) {
        this.tiempoActual = this.duracion;
      }

      this.valorBarra = (this.tiempoActual / this.duracion) * 100;
    }
  }

  protected eventoGenericoBarraDuracion(): void {
    if (this.reproductorPlayer) {
      const nuevoTiempo = this.duracion * (this.valorBarra / 100);
      this.reproductorPlayer.currentTime = nuevoTiempo;

      const barra = document.querySelector('.player__seek-wrapper') as HTMLElement;
      const rect = barra.getBoundingClientRect();

      const tooltipAncho = 50;
      const botonAncho = 16;

      this.posicionTooltip = ((this.valorBarra / 100) * rect.width) - (tooltipAncho / 2) + (botonAncho / 2);
      this.tiempoTooltip = nuevoTiempo;
    }
  }

  protected eventoGenericoMostrarTooltip(event: MouseEvent) {
    const seekWrapper = (event.target as HTMLElement).getBoundingClientRect();
    const width = seekWrapper.width;
    const mouseX = event.clientX - seekWrapper.left;

    const tooltipAncho = 50;
    const botonAncho = 16;

    this.tooltipVisible = true;

    this.posicionTooltip = (mouseX) - (tooltipAncho / 2) + (botonAncho / 2);
    this.tiempoTooltip = Math.floor((mouseX / width) * this.duracion);
  }

  protected eventoGenericoOcultarTooltip(): void {
    this.tooltipVisible = false;
  }

  protected eventoGenericoAlternarReproduccionPausa(): void {
    if (this.reproductorPlayer) {
      if (this.reproductorPlayer.paused) {
        this.reproductorPlayer.play();
        this.reproduciendo = true;
      } else {
        this.reproductorPlayer.pause();
        this.reproduciendo = false;
      }
      this.reusableGestionarAudio.notificarSeEstaReproduciendo(this.reproduciendo)
    }
  }

  protected eventoGenericoAjustarVolumen(): void {
    if (this.reproductorPlayer) {
      this.reproductorPlayer.volume = this.volumen;
      this.silenciado = this.volumen === 0;

      const volumeSlider = document.querySelector('.player__volume-slider') as HTMLElement;
      if (volumeSlider) {
        volumeSlider.style.setProperty('--volume-percent', `${this.volumen * 100}%`);
      }

      if (!this.silenciado) {
        this.volumenAnterior = this.volumen;
      }
    }
  }

  protected eventoGenericoAlternarSilencio(): void {
    if (this.reproductorPlayer) {
      this.silenciado = !this.silenciado;

      if (this.silenciado) {
        this.volumenAnterior = this.volumen;
        this.volumen = 0;
      } else {
        this.volumen = this.volumenAnterior;
      }

      this.reproductorPlayer.volume = this.volumen;
    }
  }

  protected eventoEmisorReproducirAnterior(): void {
    this.eventoAnterior.emit();
  }

  protected eventoEmisorReproducirSiguiente(): void {
    this.eventoSiguiente.emit();
  }

  protected eventoEmisorEliminar(): void {
    this.eventoEliminar.emit();
  }


  protected obtenerDuracionFormato(valor: number): string {
    const horas: number = Math.floor(valor / 3600);
    const minutos: number = Math.floor((valor % 3600) / 60);
    const segundos: number = Math.floor(valor % 60);

    if (horas > 0) {
      return `${horas}:${minutos < 10 ? '0' : ''}${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
    }

    return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  }

  protected async eventoEmisorDescargar(): Promise<void> {
    this.eventoDescargar.emit();

    // if (this.archivoReproductor?.fuente) {
    //   try {
    //     const response = await fetch(this.archivoReproductor.fuente);

    //     if (!response.ok) {
    //       throw new Error("Error al obtener el archivo");
    //     }

    //     const blob = await response.blob();
    //     const url = window.URL.createObjectURL(blob);
    //     const enlace = document.createElement('a');
    //     enlace.href = url;

    //     let nombreArchivo = this.archivoReproductor.nombre || 'archivo';

    //     const extension = this.archivoReproductor.fuente.split('.').pop();

    //     if (!nombreArchivo.includes('.') && extension) {
    //       nombreArchivo += `.${extension}`;
    //     }
    //     else if (extension && nombreArchivo.split('.').pop() !== extension) {
    //       nombreArchivo = nombreArchivo.split('.').slice(0, -1).join('.') + `.${extension}`;
    //     }

    //     enlace.download = nombreArchivo;
    //     enlace.click();

    //     window.URL.revokeObjectURL(url);

    //     this.eventoDescargar.emit();
    //   } catch (error) {
    //     console.error("Error al descargar el archivo:", error);
    //   }
    // } else {
    //   console.error("No se ha definido una fuente para el audio.");
    // }
  }







  protected eventoVideoCambiarVelocidad(event: Event): void {
    const selectedSpeed = (event.target as HTMLSelectElement).value;
    this.videoPlayerRef.nativeElement.playbackRate = parseFloat(selectedSpeed);
  }

  protected eventoVideoMaximizarPantalla(): void {
    const container = this.fullScreenContainerRef.nativeElement;

    if (container) {
      if (this.pantallaCompleta === true) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          this.pantallaCompleta = false;
        }

      } else {
        if (container.requestFullscreen) {
          container.requestFullscreen();
          this.pantallaCompleta = true;
        }
      }
    }
  }

  protected eventoVideoMenuContextual(event: MouseEvent): void {
    event.preventDefault();
  }

  protected eventoVideoClick(video: HTMLVideoElement): void {
    video.paused ? video.play() : video.pause();
  }

  mensajeError(mensaje: any, submensaje: any) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      },
    } as DynamicDialogConfig<AlertaData>);
  }

  protected mostrarSpinner(): void {
    this.spiner.show();
  }

  protected ocultarSpinner(): void {
    this.spiner.hide();
  }

}
