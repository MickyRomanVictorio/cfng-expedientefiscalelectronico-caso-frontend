import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RegistrarNotaRequest } from '@interfaces/provincial/administracion-casos/calificacion/RegistrarNotaRequest';
import { TipoDescripcionModal } from '@core/types/tipo-descripcion-modal.type';
import { CasosAnuladosService } from '@services/provincial/anulados/casos-anulados.service';
import { ClasificacionService } from '@services/provincial/clasificacion/clasificacion.service';
import { obtenerIcono } from '@utils/icon';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs';
import { EncabezadoModalComponent } from '../encabezado-modal/encabezado-modal.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TAMANIO_INPUT } from '@core/types/efe/provincial/administracion-casos/asignacion/anular-caso.type';
import { obtenerCasoHtml } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

@Component({
  standalone: true,
  selector: 'app-reason-modal',
  templateUrl: './descripcion-modal.component.html',
  styleUrls: ['./descripcion-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextareaModule,
    CmpLibModule,
    EncabezadoModalComponent,
  ],
})
export class DescripcionModalComponent implements OnInit {
  public razon = new FormControl('', [Validators.required]);
  public tipo: TipoDescripcionModal;
  public titulo;
  public descripcion;
  public numeroCaso;
  public idCaso;
  public contenido;
  public subscriptions: Subscription[] = [];
  public caracteresRestantes: number = TAMANIO_INPUT;
  protected tituloCaso: SafeHtml | undefined = undefined;
  protected obtenerIcono = obtenerIcono;

  constructor(
    public referenciaModal: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private casosAnuladosService: CasosAnuladosService,
    private clasificacionService: ClasificacionService,
    private sanitizador: DomSanitizer
  ) {
    this.tipo = this.config.data.tipo || 'anulacion';
    this.titulo = this.config.data.titulo;
    this.descripcion = this.config.data.descripcion;
    this.numeroCaso = this.config.data.caso;
    this.idCaso = this.config.data.idCaso;
    this.contenido = this.config.data.contenido;
  }

  ngOnInit() {
    this.tituloDelCaso();
    if (this.contenido) {
      this.razon.setValue(this.contenido);
      this.caracteresRestantes = TAMANIO_INPUT - (this.contenido).length;
    }
  }

  private tituloDelCaso(): void {
    const subTituloHtml = `Comentario de caso (Opcional): ${obtenerCasoHtml(
      this.numeroCaso
    )}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  get isValidForm(): boolean {
    return this.razon.value!.trim().length > 0;
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  guardar(): void {
    console.log('this.tipo', this.tipo);
    if (this.tipo === 'anulacion') {
      this.cancelCase();
    } else if (this.tipo === 'clasificacion') {
      this.clasificacionCaso();
    }
  }

  cancelCase(): void {
    this.subscriptions.push(
      this.casosAnuladosService
        .anularCaso(this.idCaso, this.razon.value!)
        .subscribe({
          next: (resp) => {
            this.referenciaModal.close();
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
    this.subscriptions.push(
      this.clasificacionService.registrarNota(request).subscribe({
        next: (resp) => {
          this.referenciaModal.close();
        },
        error: (error) => {
          console.log(error);
        },
      })
    );
  }

  public actualizarContadorInputTextArea(e: Event): void {
    const value = (e.target as HTMLTextAreaElement).value;
    this.caracteresRestantes = TAMANIO_INPUT - value.length;
  }
}
