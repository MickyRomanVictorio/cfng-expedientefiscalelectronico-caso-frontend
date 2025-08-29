import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Asunto } from '@interfaces/reusables/asunto-observaciones/asunto.interface';
import { Observaciones } from '@interfaces/reusables/asunto-observaciones/observaciones.interface';
import { ReusablesAsuntoService } from '@services/reusables/reusable-asunto.service';
import { ReusablesObservacionService } from '@services/reusables/reusable-observacion.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Subscription, forkJoin } from 'rxjs';
import { EncabezadoModalComponent } from '../encabezado-modal/encabezado-modal.component';

@Component({
  selector: 'app-asunto-observaciones',
  standalone: true,
  imports: [
    CommonModule,
    SelectButtonModule,
    ReactiveFormsModule,
    InputTextareaModule,
    InputTextareaModule,
    EncabezadoModalComponent,
  ],
  templateUrl: './asunto-observaciones.component.html',
})
export class AsuntoObservacionesComponent implements OnInit, OnDestroy {
  stateOptions: any[] = [
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' },
  ];
  indicador: string = 'AM';

  public numeroCaso: string;
  public idCaso: string;
  formulario!: FormGroup;
  asunto!: Asunto;
  observacion!: Observaciones;
  private subscriptions: Subscription[] = [];
  public isRendered: boolean = false;
  private dialogElement: any;

  constructor(
    public referenciaModal: DynamicDialogRef,
    private configuracion: DynamicDialogConfig,
    private observacionService: ReusablesObservacionService,
    private asuntoService: ReusablesAsuntoService,
    private fb: FormBuilder,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.numeroCaso = this.configuracion.data?.numeroCaso;
    this.idCaso = this.configuracion.data?.idCaso;
  }

  ngOnInit(): void {
    this.cargaConfigVisual();
    this.cargaInicialDatos();

    this.formulario = this.fb.group({
      fecha: [{ value: '', disabled: true }],
      hora: [{ value: '', disabled: true }],
      indicadorHora: [{ value: '', disabled: true }],
      asunto: [{ value: '', disabled: true }],
      observacion: [{ value: '', disabled: true }],
    });
    this.formCargaDataInicio();

  }

  private cargaConfigVisual() {
    this.dialogElement = this.document.body.querySelector('.p-dialog-content');
    if (this.dialogElement) {
      this.renderer.addClass(this.dialogElement, 'hidden');
    }
  }

  private cargaInicialDatos() {

   /* forkJoin([
      this.asuntoService.obtenerAsunto(this.numeroCaso),
      this.observacionService.obtenerObservacion(this.idCaso),
    ]).subscribe(
      ([result1, result2]) => {
        this.asunto = result1;
        this.observacion = result2;
      },
      (error) => {
        console.error('Error:', error);
      },
      () => {
        this.isRendered = true;
        this.renderer.removeClass(this.dialogElement, 'hidden');
      }
    ); */

    forkJoin({
      asunto: this.asuntoService.obtenerAsunto(this.numeroCaso),
      observacion: this.observacionService.obtenerObservacion(this.idCaso)
    }).subscribe({
      next: ({ asunto, observacion }) => {
        this.asunto = asunto ?? {} as Asunto;
        this.observacion = observacion ?? {} as Observaciones;

        this.formulario.patchValue({
          fecha: this.asunto.fechaHecho || '',
          hora: this.asunto.horaHecho || '',
          indicadorHora: this.asunto.indicadorHoraHecho || '',
          asunto: this.asunto.narrativa || '',
          observacion: this.observacion?.observacion || ''
        });

        this.isRendered = true;
      },
      error: (err) => {
        console.error('Error al cargar los datos:', err);
      },
      complete: () => {
        this.isRendered = true;
        this.renderer.removeClass(this.dialogElement, 'hidden');
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private formCargaDataInicio(): void {
    this.formulario.patchValue({
      hora: this.getFormattedTime(new Date()),
      indicadorHora: this.getAmPm(new Date()),
    });
  }

  getFormattedTime(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutesStr}`;
  }

  getAmPm(date: Date): string {
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${ampm}`;
  }
}
