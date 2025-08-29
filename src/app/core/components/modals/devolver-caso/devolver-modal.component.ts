import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RegistrarNotaRequest } from '@interfaces/provincial/administracion-casos/calificacion/RegistrarNotaRequest';
import {
  DevolverDerivacionRequest,
  DevolverDerivacionResponse
} from '@interfaces/provincial/bandeja-derivacion/recibidos/DevolverDerivacionRequest';
import { ClasificacionService } from '@services/provincial/clasificacion/clasificacion.service';
import { EncabezadoModalComponent } from '@components/modals/encabezado-modal/encabezado-modal.component';
import { obtenerIcono } from '@utils/icon';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { TabpanelActoProcesalComponent } from './tabpanel-acto-procesal/tabpanel-acto-procesal.component';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import {
  DerivadoPorRevisarService
} from '@services/provincial/bandeja-derivaciones/recibidos/por-revisar/derivado-por-revisar.service';
import { tap } from 'rxjs/operators';
import {
  RecibidosDerivadoAService
} from '@services/provincial/bandeja-derivaciones/recibidos/recibido-derivadoa.service';

@Component({
  standalone: true,
  selector: 'app-reason-modal',
  templateUrl: './devolver-modal.component.html',
  styleUrls: ['./devolver-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextareaModule,
    EncabezadoModalComponent,
    CheckboxModule,
    TabpanelActoProcesalComponent,
  ],
})
export class DevolverModalComponent implements OnInit, OnDestroy {

  public tipoAcccion;
  public titulo;
  public descripcion;
  public numeroCaso;
  public idCaso;
  public contenido;
  public idBandeja;
  public distrito;
  public idActoTramiteEstado;
  public subscriptions: Subscription[] = [];
  public devolverRecibidosPorRevisarPadre!: DevolverDerivacionRequest;

  remainingChars: number = 1000;
  formulario!: FormGroup;
  public formularioTemp: any = {};

  constructor(
    public referenciaModal: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private clasificacionService: ClasificacionService,
    private derivadoPorRevisarService: DerivadoPorRevisarService,
    private recibidosDerivadoAService: RecibidosDerivadoAService,
    private tramiteService: TramiteService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder
  )
  {
    this.tipoAcccion = this.config.data.tipoAccion;
    this.titulo = this.config.data.titulo;
    this.descripcion = this.config.data.descripcion;
    this.numeroCaso = this.config.data.caso;
    this.idCaso = this.config.data.idCaso;
    this.contenido = this.config.data.contenido;
    this.idBandeja = this.config.data.idBandejaDerivacion;
    this.distrito = this.config.data.distrito;
    this.idActoTramiteEstado = this.config.data.idActoTramiteEstado;
  }

  ngOnInit() {
    this.formulario = this.formBuilder.group({
      idBandeja: [this.idBandeja],
      idCaso: [this.idCaso],
      carpetaIncompleta: [false],
      carpetaMalFoliada: [false],
      consignarNombreDespacho: [false],
      detalleDevolucion: ['', [Validators.required, Validators.maxLength(1000)]],
    });
    if (this.contenido) this.formulario.get('detalleDevolucion')?.setValue(this.contenido);
    this.formularioTemp = this.formulario.getRawValue();
    this.formulario.valueChanges.subscribe({
      next: (values) => {
        if (this.formularioTemp !== values) {
          this.formularioEditado(true);
          this.habilitarGuardar(this.formularioValido);
          this.derivadoPorRevisarService.guardarFormulario(values);
        } else this.formularioEditado(false);
      }
    });
    this.obtenerDevolverDerivacion();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  get formularioValido(): boolean {
    return (this.tienedetalleDevolucion && this.tieneMotivo);
  }

  get tieneMotivo(): boolean {
    const datos = this.formulario.getRawValue();
    return datos.carpetaIncompleta || datos.carpetaMalFoliada || datos.consignarNombreDespacho;
  }

  get tienedetalleDevolucion(): boolean {
    const datos = this.formulario.getRawValue();
    return datos.detalleDevolucion.trim().length > 0;
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  private obtenerDevolverDerivacion(): void {
    this.subscriptions.push(
      this.recibidosDerivadoAService.obtenerDevolverRecibidosPorRevisar(this.idBandeja).subscribe({
        next: (resp: DevolverDerivacionResponse) => {
          this.formulario.patchValue({
            idBandeja: resp.idBandeja,
            idCaso: resp.idCaso,
            carpetaIncompleta: resp.carpetaIncompleta == '1',
            carpetaMalFoliada: resp.carpetaMalFoliada == '1',
            consignarNombreDespacho: resp.consignarNombreDespacho == '1',
            detalleDevolucion: resp.detalleDevolucion
          });
          this.formularioEditado(false);
          this.habilitarGuardar(this.formularioValido);
        }
      })
    );
  }

  onInputDescripcionChange() {
    this.remainingChars = 1000 - this.formulario.get('detalleDevolucion')?.value?.length;
  }

  /*   Reversion Acumulada*/
  devolverDerivacionAcumulado(): void {
    const request: RegistrarNotaRequest = {
      idCaso: this.idCaso,
      descripcionNotaClasificacion: this.formulario.get('detalleDevolucion')?.value,
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

  public cancelar(): void {
    this.referenciaModal.close();
  }
}
