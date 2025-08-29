import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DigitOnlyModule } from '@directives/digit-only.module';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { Message, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-plazo-ampliar',
  standalone: true,
  templateUrl: './plazo-ampliar.component.html',
  styleUrls: ['./plazo-ampliar.component.scss'],
  imports: [
    CommonModule,
    DropdownModule,
    InputTextareaModule,
    MessagesModule,
    InputTextModule,
    CmpLibModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    DigitOnlyModule,
    FormsModule,
  ],
  providers: [MessageService],
})
export class PlazoAmpliarComponent implements OnInit {
  formRegistro!: FormGroup;
  titulo: string = 'Asignar Plazo';
  numeroCaso: string = '00000000-0000-0000-0';
  public obtenerIcono = obtenerIcono;
  public tituloModal!: SafeHtml;

  unidadesMedidas: SelectItem[] = [];
  sedes: SelectItem[] = [];
  msgs1: Message[] = [];
  msgs2: Message[] = [];
  public mensajeCustom: any;

  constructor(
    private sanitizador: DomSanitizer,
    private messageService: MessageService,
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder
  ) {
    this.formRegistro = this.fb.group({
      fechaInicioInvestigacionPreliminar: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      fechaFinInvestigacionPreliminarActual: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      plazoNuevo: [
        { value: '', disabled: false },
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(3),
          Validators.pattern(/^[0-9]*$/),
        ],
      ],
      unidadMedida: [{ value: '', disabled: false }, [Validators.required]],
      nuevaFechaFinCalculada: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      sede: [{ value: '', disabled: false }, [Validators.required]],
      descripcion: [{ value: '', disabled: false }, [Validators.required]],
    });
  }
  ngOnInit(): void {
    let mensajeCustomHtml =
      "El plazo registrado está <span ngStyle='color:#f19700;font-weight: bold;'>superando el tope</span> de 120 días. Verifique los datos ingresados.";
    this.mensajeCustom = mensajeCustomHtml;
    this.msgs1 = [
      {
        severity: 'warn',
        summary: '',
        detail:
          'Está declarando complejo el caso, recuerde que esta acción no podrá revertirse. Verifique los datos ingresados.',
        icon: 'pi-info-circle icon-color',
      },
    ];
    this.msgs2 = [
      {
        severity: 'warn',
        summary: '',
        detail: this.mensajeCustom,
        icon: 'pi-info-circle',
      },
    ];
    this.obtenerTitulo();
  }
  private obtenerTitulo(): void {
    let tituloHtml = `${this.titulo}`;
    tituloHtml +=
      this.numeroCaso !== '00000000-0000-0000-0'
        ? ` - Caso: ${obtenerCasoHtml(this.numeroCaso)}`
        : '';
    this.tituloModal = this.sanitizador.bypassSecurityTrustHtml(tituloHtml);

  }
  public cerrarModal(): void {
       this.dialogRef.close();
  }
  public ampliar(): void {
    if (!this.formRegistro.valid) {
      this.formRegistro.markAllAsTouched();
      return;
    }
  }
}
