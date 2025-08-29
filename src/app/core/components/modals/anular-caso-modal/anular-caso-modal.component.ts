import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RegistrarNotaRequest } from '@interfaces/provincial/administracion-casos/calificacion/RegistrarNotaRequest';
import { CasosAnuladosService } from '@services/provincial/anulados/casos-anulados.service';
import { ClasificacionService } from '@services/provincial/clasificacion/clasificacion.service';
import { TAMANIO_INPUT } from '@core/types/efe/provincial/administracion-casos/asignacion/anular-caso.type';
import { TipoDescripcionModal } from '@core/types/tipo-descripcion-modal.type';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextareaModule,
    CmpLibModule,
  ],
  selector: 'app-anular-caso-modal',
  templateUrl: './anular-caso-modal.component.html',
  styleUrls: ['./anular-caso-modal.component.scss'],
})
export class AnularCasoModalComponent implements OnInit {
  public razon = new FormControl('', [Validators.required]);
  public tipo!: TipoDescripcionModal;
  public titulo;
  public descripcion;
  public numeroCaso;
  public idCaso;
  public contenido;
  public subscriptions: Subscription[] = [];
  public caracteresRestantes: number = TAMANIO_INPUT;
  protected obtenerIcono = obtenerIcono;
  protected tituloCaso: SafeHtml | undefined = undefined;

  constructor(
    protected referenciaModal: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private casosAnuladosService: CasosAnuladosService,
    private clasificacionService: ClasificacionService,
    private spinner: NgxSpinnerService,
    private sanitizador: DomSanitizer,
    private dialogService: DialogService
  ) {
    this.titulo = this.config.data.titulo;
    this.descripcion = this.config.data.descripcion;
    this.numeroCaso = this.config.data.caso;
    this.idCaso = this.config.data.idCaso;
    this.contenido = this.config.data.contenido;
    this.tipo= this.config.data.tipo
  }

  ngOnInit(): void {
    this.tituloDelCaso();
  }

  private tituloDelCaso(): void {
    const subTituloHtml = `Motivo de anulación del caso: ${obtenerCasoHtml(
      this.numeroCaso
    )}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  public actualizarContadorInputTextArea(e: Event): void {
    const value = (e.target as HTMLTextAreaElement).value;
    this.caracteresRestantes = TAMANIO_INPUT - value.length;
  }

  get isValidForm(): boolean {
    return this.razon.value!.trim().length > 0;
  }

  guardar(): void {
    if (this.tipo === 'anulacion') {
      this.anularCaso();
    } else if (this.tipo === 'clasificacion') {
      this.clasificacionCaso();
    }
  }

  private anularCaso(): void {
    this.subscriptions.push(
      this.casosAnuladosService
        .anularCaso(this.idCaso, this.razon.value!)
        .subscribe({
          next: (resp) => {
            this.mostrarMensaje('Caso correctamente anulado');
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  clasificacionCaso(): void {
    const request: RegistrarNotaRequest = {
      idCaso: this.idCaso,
      descripcionNotaClasificacion: this.razon.value!,
    };
    this.spinner.show();
    this.subscriptions.push(
      this.clasificacionService.registrarNota(request).subscribe({
        next: (resp) => {
          this.spinner.hide();
          this.referenciaModal.close();
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      })
    );
  }

  private mostrarMensaje(mensaje: string): void {
    const ref = this.dialogService.open(AlertaModalComponent, {
      width: '50%',
      showHeader: false,
      data: {
        containerClass: 'alerta-modal',
        icon: 'success',
        title: 'Caso anulado',
        description: mensaje,
        confirmButtonText: 'Aceptar',
        confirm: false,
      },
    });
    ref.onClose.subscribe(() => {
      this.referenciaModal.close('confirm');
    });
  }
}
