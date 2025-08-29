import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertaData } from '@interfaces/comunes/alert';
import { RespuestaCasoService } from '@services/reusables/reusable-respuesta-caso.service';
import { formatoCampoPipe } from '@pipes/formato-campo.pipe';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { EncabezadoModalComponent } from '../encabezado-modal/encabezado-modal.component';
import { ResponderObservarCasoElevadoModalComponent } from '../responder-observar-casos-elevados-modal/responder-observar-casos-elevados-modal.component';

@Component({
  standalone: true,
  selector: 'responder-caso-elevados-modal',
  templateUrl: './responder-casos-elevados-modal.component.html',
  styleUrls: ['./responder-casos-elevados-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    EncabezadoModalComponent,
    formatoCampoPipe,
    CommonModule,
    ButtonModule,
    CalendarModule,
    CmpLibModule,
  ],
})
export class ResponderCasoElevadoModalComponent implements OnInit {
  public obtenerIcono = obtenerIcono;
  public refModal!: DynamicDialogRef;
  public subscriptions: Subscription[] = [];
  public titulo;
  public registroElevacion: any;

  constructor(
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private messageService: MessageService,
    private respuestaCasoService: RespuestaCasoService,
    private spinner: NgxSpinnerService
  ) {
    this.titulo = this.config.data.titulo;
    this.registroElevacion = this.config.data.registroElevacion;
  }

  aceptarElevacion() {
    this.spinner.show();
    let request: any = {
      idBandejaElevacion: this.registroElevacion.idBandejaElevacion,
      idTipoElevacion: this.registroElevacion.idTipoElevacion,
    };
    this.respuestaCasoService.aceptarCaso(request).subscribe({
      next: (resp) => {
        this.spinner.hide();
        if (resp.code === 0) {
          this.modalAlert(
            'success',
            'RESPUESTA ENVIADA',
            'Se respondió el caso correctamente'
          );
        }
      },
      error: (error) => {
        this.spinner.hide();
        this.modalAlert(
          'error',
          'Error al aceptar el caso',
          error.error.message
        );
      },
    });
  }

  modalObservarElevacion() {
    this.refModal = this.dialogService.open(
      ResponderObservarCasoElevadoModalComponent,
      {
        showHeader: false,
        closable: false,
        closeOnEscape: false,
        data: {
          registroElevacion: this.registroElevacion,
        },
      }
    );
    this.refModal.onClose.subscribe((respuesta) => {
      if (respuesta === 'ALLCLOSE') this.dialogRef.close('ALLCLOSE');
    });
  }

  ngOnInit() {
    console.log(this.registroElevacion);
  }

  get alertIcon(): string {
    return `assets/icons/warning.svg`;
  }

  modalAlert(icon: string, mensaje: string, descripcion: string) {
    this.refModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      closable: false,
      closeOnEscape: false,
      data: {
        icon: icon,
        title: mensaje,
        description: descripcion,
        confirmButtonText: 'Aceptar',
        confirm: false,
      },
    } as DynamicDialogConfig<AlertaData>);

    this.refModal.onClose.subscribe((respuesta) => {
      if (icon === 'success') this.dialogRef.close('ALLCLOSE');
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  close() {
    this.dialogRef.close();
  }
}
