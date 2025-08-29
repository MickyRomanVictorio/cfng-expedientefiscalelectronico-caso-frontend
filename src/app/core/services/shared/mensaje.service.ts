import { Injectable, Pipe } from '@angular/core';
import { AlertaData } from '@core/interfaces/comunes/alert';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Injectable({
  providedIn: 'root',
})
export class MensajeNotificacionService {
  constructor(private dialogService: DialogService) { }

  verMensajeNotificacion(titulo: string, descripcion: string, icono: string = 'info', textoBotonConfirmacion: string = 'Ok') {
    const alert = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icono,
        title: titulo,
        description: descripcion,
        confirmButtonText: textoBotonConfirmacion,
      },
    } as DynamicDialogConfig<AlertaData>);

    if (alert) {
      alert.onClose.subscribe({
        next: () => console.log('Dialog closed'),
        error: (error) => console.error(error),
      });
    }
  }

  verMensajeErrorServicio() {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: 'Error de Servicio',
        description: 'Por favor inténtelo más tarde',
        confirmButtonText: 'Ok',
      },
    } as DynamicDialogConfig<AlertaData>);
  }

  verMensajeError(titulo: string, descripcion: string) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: titulo,
        description: descripcion,
        confirmButtonText: 'Ok',
      },
    } as DynamicDialogConfig<AlertaData>);
  }

  verMensajeWarning(titulo: string, descripcion: string) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: titulo,
        description: descripcion,
        confirmButtonText: 'Ok',
      },
    } as DynamicDialogConfig<AlertaData>);
  }
}
