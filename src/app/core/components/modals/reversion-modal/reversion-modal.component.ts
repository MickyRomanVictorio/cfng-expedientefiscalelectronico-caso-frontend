import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RegistrarNotaRequest } from '@interfaces/provincial/administracion-casos/calificacion/RegistrarNotaRequest';
import { EnviadosDerivadoPorRevisarService } from '@services/provincial/bandeja-derivaciones/enviados/derivado-por-revisar/EnviadosDerivadosPorRevisarService';
import { ClasificacionService } from '@services/provincial/clasificacion/clasificacion.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs';
import { EncabezadoModalComponent } from '../encabezado-modal/encabezado-modal.component';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { AlertaData } from '@core/interfaces/comunes/alert';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { Router } from '@angular/router';
import { EnviadosAcumuladosPorRevisarService } from '@core/services/provincial/bandeja-derivaciones/enviados/acumulado-por-revisar/EnviadosAcumuladosPorRevisarService';
import { RevertirDerivacionRequest } from '@core/interfaces/provincial/bandeja-derivacion/RevertirDerivacionRequest';

@Component({
  standalone: true,
  selector: 'app-reason-modal',
  templateUrl: './reversion-modal.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextareaModule,
    EncabezadoModalComponent,
  ],
  providers: [NgxCfngCoreModalDialogService],
})
export class ReversionModalComponent implements OnInit {
  public razon = new FormControl('', [Validators.required]);
  // public tipo: TipoDescripcionModal = this.config.data.tipo || "1";
  public tipoAcccion;
  public titulo;
  public descripcion;
  public numeroCaso;
  public idCaso;
  public contenido;
  public idBandeja;
  public distrito;
  public subscriptions: Subscription[] = [];
  protected wordCount = 1000;
  private referenciaModalAlert!: DynamicDialogRef;

  constructor(
    private readonly router: Router,
    public referenciaModal: DynamicDialogRef,
    private dialogService: DialogService,
    public config: DynamicDialogConfig,
    private enviadosDerivadoPorRevisarService: EnviadosDerivadoPorRevisarService,
    private enviadosAcumuladosPorRevisarService: EnviadosAcumuladosPorRevisarService,
    private spinner: NgxSpinnerService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {
    console.log('constructor ReversionModalComponent data = ', this.config.data);
    this.tipoAcccion = this.config.data.tipoAccion;
    this.titulo = this.config.data.titulo;
    this.descripcion = this.config.data.descripcion;
    this.numeroCaso = this.config.data.caso;
    this.idCaso = this.config.data.idCaso;
    this.idBandeja = this.config.data.idBandejaDerivacion;
    this.distrito = this.config.data.distrito;
    this.contenido = this.config.data.contenido;
  }

  ngOnInit() {
    if (this.contenido) this.razon.setValue(this.contenido);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public closeAction(evt: MouseEvent): void {
    evt.preventDefault();
    //this.ref.close('closed')
  }

  get isValidForm(): boolean {
    return this.razon.value!.trim().length > 0;
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  guardar(): void {
    console.log('this.tipoAcccion = ', this.tipoAcccion);

    this.referenciaModalAlert = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        /**title: ``,**/
        description: `¿Está seguro de realizar la siguiente acción?`,
        confirmButtonText: 'Aceptar',
        confirm: true,
      }
    } as DynamicDialogConfig<AlertaData>)

    this.referenciaModalAlert.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.ejecutarReversion();
        }
      }
    })
  }

  private ejecutarReversion(): void {
    console.log('tipoAcccion = ', this.tipoAcccion);
    if (this.tipoAcccion === '0') {
      this.revertirDerivacion();
    } else if (this.tipoAcccion === '1') {
      this.revertirDerivacionAcumulado();
    }
  }

  cerrar(): void {
    this.referenciaModal.close();
  }

  countWords() {
    const words = this.razon.value ?? '';
    this.wordCount = 1000 - words.length;
    // Disable textarea input if the word limit is reached
    if (this.wordCount >= 1000) {
      const currentValue = words;
      const newValue = currentValue.substring(0, 1000);
      this.razon.setValue(newValue);
    }
  }

  /* Reversion normal */
  revertirDerivacion(): void {
    /**console.log('entro revertirDerivacion');
    this.referenciaModal.close();
            this.modalDialogService.info(
              'Datos guardado correctamente',
              'Se revertió la derivación del caso <b>' + this.numeroCaso + '</b>.',
              'Ok'
            );
            const urlBase = this.obtenerUrlDerivadoBase(3);
            this.router.navigate([`${urlBase}`]);**/

    const request: any /* RevertirDerivacionRequest TODO-V18 */ = {
      idBandeja: this.idBandeja,
      idCaso: this.idCaso,
      detalleReversion: this.razon.value,
    };
    this.spinner.show();
    this.subscriptions.push(
      this.enviadosDerivadoPorRevisarService.revertirDerivadosPorRevisar(request).subscribe({
        next: (resp) => {
          this.spinner.hide();
          this.referenciaModal.close();
          this.modalDialogService.info(
            'Datos guardado correctamente',
            'Se revertió la derivación del caso <b>' + this.numeroCaso + '</b>.',
            'Ok'
          );
          const urlBase = this.obtenerUrlDerivadoBase(3);
          this.router.navigate([`${urlBase}`]);
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      })
    );
  }

  /* obtiene las url de los tabs */
  protected obtenerUrlDerivadoBase(indiceTab: number) {
    const urlBase = '/app/administracion-casos/derivaciones/enviados';
    return (
      {
        0: `${urlBase}/derivado-por-revisar`,
        1: `${urlBase}/derivado-aceptados`,
        2: `${urlBase}/derivado-devueltos`,
        3: `${urlBase}/derivado-revertidos`,
      }[indiceTab]
    );
  }

  /* Reversion Acumulada */
  revertirDerivacionAcumulado(): void {
    console.log('entro revertirDerivacionAcumulado');
    /**this.referenciaModal.close();
            this.modalDialogService.info(
              'Datos guardado correctamente',
              'Se revertió la derivación del caso <b>' + this.numeroCaso + '</b>.',
              'Ok'
            );
            const urlBase = this.obtenerUrlAcumuladoBase(3);
            this.router.navigate([`${urlBase}`]);**/

    const request: any /* RevertirDerivacionRequest TODO-V18 */ = {
      idBandeja: this.idBandeja,
      idCaso: this.idCaso,
      detalleReversion: this.razon.value,
    };
    this.spinner.show();
    this.subscriptions.push(
      this.enviadosAcumuladosPorRevisarService.revertirAcumuladosPorRevisar(request).subscribe({
        next: (resp) => {
          this.spinner.hide();
          this.referenciaModal.close();
          this.modalDialogService.info(
            'Datos guardado correctamente',
            'Se revertió la derivación del caso <b>' + this.numeroCaso + '</b>.',
            'Ok'
          );
          const urlBase = this.obtenerUrlAcumuladoBase(3);
          this.router.navigate([`${urlBase}`]);

        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      })
    );
  }

  protected obtenerUrlAcumuladoBase(indiceTab: number) {
    const urlBase = '/app/administracion-casos/derivaciones/enviados';
    return (
      {
        0: `${urlBase}/acumulado-por-revisar`,
        1: `${urlBase}/acumulado-aceptados`,
        2: `${urlBase}/acumulado-devueltos`,
        3: `${urlBase}/acumulado-revertidos`,
      }[indiceTab]
    );
  }
}
