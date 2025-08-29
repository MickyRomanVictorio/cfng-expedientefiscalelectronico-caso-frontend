import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertaData } from '@interfaces/comunes/alert';
import { RespuestaCasoService } from '@services/reusables/reusable-respuesta-caso.service';
import { AdjuntarDocumentoComponent } from '@components/tramite-editor/adjuntar-documento/adjuntar-documento.component';
import { formatoCampoPipe } from '@pipes/formato-campo.pipe';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { EncabezadoModalComponent } from '../encabezado-modal/encabezado-modal.component';

@Component({
  standalone: true,
  selector: 'responder-observar-casos-elevados-modal',
  templateUrl: './responder-observar-casos-elevados-modal.component.html',
  styleUrls: ['./responder-observar-casos-elevados-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    EncabezadoModalComponent,
    InputTextModule,
    formatoCampoPipe,
    CommonModule,
    ButtonModule,
    CmpLibModule,
    CalendarModule,
    AdjuntarDocumentoComponent,
  ],
})
export class ResponderObservarCasoElevadoModalComponent implements OnInit {
  public refModal!: DynamicDialogRef;
  public subscriptions: Subscription[] = [];
  public registroElevacion: any;
  observacion: string = '';
  tipoArchivo: String = 'Pdf';
  public obtenerIcono = obtenerIcono;
  constructor(
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private messageService: MessageService,
    private respuestaCasoService: RespuestaCasoService
  )
  {
    this.registroElevacion = this.config.data.registroElevacion;
  }

  confirm() {

    let request: any = {
      idBandejaElevacion: this.registroElevacion.idBandejaElevacion,
      idTipoElevacion: this.registroElevacion.idTipoElevacion,
      observacion: this.observacion,
    };
    this.respuestaCasoService.observarCaso(request).subscribe({
      next: (resp) => {

        if (resp.code === 0) {
          this.modalAlert(
            'success',
            'RESPUESTA ENVIADA',
            'Se respondió el caso correctamente'
          );
        }
      },
      error: (error) => {

        this.modalAlert(
          'error',
          'Error al aceptar el caso',
          error.error.message
        );
      },
    });
  }

  ngOnInit() {}

  get isFormValid(): boolean {
    return this.observacion.length > 0;
  }

  codigoCaso(coCAso: string) {
    let caso = coCAso.split('-');
    return `${caso[0]}-${caso[1]}-<span class="color-secondary font-bold">${caso[2]}-${caso[3]}</span>`;
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
    this.dialogRef.close('close');
  }
}
