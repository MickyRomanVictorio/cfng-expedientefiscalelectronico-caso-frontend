import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MensajeGenericoComponent } from '@core/components/mensajes/mensaje-generico/mensaje-generico.component';
import { EncabezadoModalComponent } from '@core/components/modals/encabezado-modal/encabezado-modal.component';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { DigitOnlyModule } from '@core/directives/digit-only.module';
import { DetallePagoCuota, ListaPagoCuota } from '@core/interfaces/reusables/pagos/pagos';
import { DecimalFormatPipe } from '@core/pipes/decimal-format.pipe';
import { SolPeruanoPipe } from '@core/pipes/sol-peruano.pipe';
import { PagosService } from '@core/services/reusables/efe/pagos/pagos.service';
import { PAGOS } from '@core/types/efe/provincial/expediente/pago.type';
import { REPARACION_CIVIL } from '@core/types/reutilizable/reparacion-civil.type';
import { convertStringToDate } from '@core/utils/date';
import { valid } from '@core/utils/string';
import { validOnlyAlphanumeric, validOnlyAlphanumericDrop, validOnlyAlphanumericOnPaste } from '@core/utils/utils';
import { CmpLibModule } from 'dist/cmp-lib';
import { icono, IconUtil, ValidationModule } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-registrar-editar-pagos',
  standalone: true,
  imports: [
    CmpLibModule,
    ButtonModule,
    TableModule,
    CommonModule,
    CalendarModule,
    InputTextModule,
    InputTextareaModule,
    DateMaskModule,
    SolPeruanoPipe,
    FormsModule,
    ReactiveFormsModule,
    DigitOnlyModule,
    ValidationModule,
    MensajeGenericoComponent,
    DialogModule,
    EncabezadoModalComponent
  ],
  templateUrl: './registrar-editar-pagos.component.html',
  styleUrls: ['./registrar-editar-pagos.component.scss'],
  providers: [NgxCfngCoreModalDialogService]
})
export class RegistrarEditarPagosComponent implements OnInit {

  protected readonly ref = inject(DynamicDialogRef)

  protected readonly config = inject(DynamicDialogConfig)

  protected readonly iconUtil = inject(IconUtil)

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly subscriptions: Subscription[] = []

  private readonly pagosService = inject(PagosService)

  private readonly fb = inject(FormBuilder)

  protected detallePagoCuota!: DetallePagoCuota;

  protected formPago!: FormGroup;

  protected fechaActual: Date = new Date();

  protected textoValidacion:string | null = null;

  protected mostrarGuiaComprobante: boolean = false

  protected comprobanteSeleccionado: File | null = null

  protected PAGOS = PAGOS;

  protected EXTENSIONES_PERMITIDAS_COMPROBANTE=['application/pdf', 'image/jpeg', 'image/png'];

  public modoLectura : boolean = false;

  private valoresInicialesEdicionPago!: any;

  protected REPARACION_CIVIL=REPARACION_CIVIL;
  
  constructor() {
    this.detallePagoCuota = this.config.data.cuota;
    this.modoLectura=this.config.data.modoLectura;
  }
  ngOnInit() {
    this.formBuild();
    this.obtenerDetallePagoCuota();
    this.formPago.statusChanges.subscribe(() => {
      if(!this.formPago.invalid){
        this.textoValidacion=null;
      }
    });
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  protected get guiaComprobante(): string {
    return 'assets/images/guia-comprobante.svg';
  }
  protected get editando(): boolean {
    return valid(this.formPago.get("idSeguiCuota")?.value);
  }

  protected icono(name: string): string {
    return icono(name);
  }
  protected formBuild() {
    this.formPago = this.fb.group({
      idSeguiCuota: [null],
      idCuota: [this.detallePagoCuota.idCuota],
      idPagoCuota: [this.detallePagoCuota.idPagoCuota],
      monto: [null, [Validators.required,this.validarRangoNumero(REPARACION_CIVIL.LIMITE_MONTO)]],
      fechaPago: [null, [Validators.required]],
      recibo: [null, [Validators.required]],
      observacion: ['']
    });
  }

  protected obtenerDetallePagoCuota() {
    this.subscriptions.push(
      this.pagosService.detallePagoCuota(this.detallePagoCuota.idCuota, this.detallePagoCuota.idPagoCuota).subscribe({
        next: resp => {
          if (resp) {
           const detalle = resp as DetallePagoCuota;
           this.detallePagoCuota.montoPagado=detalle.montoPagado;
           this.detallePagoCuota.montoCuota=detalle.montoCuota;
           this.detallePagoCuota.montoPendiente=detalle.montoPendiente;
           this.detallePagoCuota.fechaVencimiento=detalle.fechaVencimiento;
           this.detallePagoCuota.listaPagos=detalle.listaPagos;
          }
          else{
            this.modalDialogService.error("Error", `No se ha encontrado la información del detalle del pago de la cuota N° ${this.detallePagoCuota.cuota}`, 'Aceptar');
            this.ref.close();
          }
        },
        error: () => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar obtener la información del detalle del pago de la cuota`, 'Aceptar');
          this.ref.close();
        }
      })
    )
  }
  protected formatearMonto() {
    if (this.formPago.get('monto')?.value) {
      this.formPago.get('monto')?.setValue(new DecimalFormatPipe().transform(this.formPago.get('monto')?.value));
    }
  }

  protected guardarPago() {
    this.textoValidacion=null;
    if (this.formPago.invalid) {
      this.formPago.markAllAsTouched();
      return;
    }

    if(this.editando && !this.cambiosAlEditarPago()){
      this.modalDialogService.info("Información",
        `No se ha realizado ningún cambio en la información del pago`,
        'Aceptar');
        return;
    }

    const formulario = this.formPago.getRawValue();
    this.subscriptions.push(
      this.pagosService.registrarEditarPago(formulario).subscribe({
        next: resp => {
          if (resp?.code == 0) {
            this.actualizarIdPagoCuota(resp?.data?.idPagoCuota);
            this.modalDialogService.success("Éxito",
                                            !this.editando? "Se registró correctamente el pago":"Pago modificado correctamente", 
                                            'Aceptar')
            this.limpiarFormulario();
            this.obtenerDetallePagoCuota();
            this.pagosService.actualizarReparacion();
          }
          else{
            this.textoValidacion=resp?.message
          }
        },
        error: () => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar guardar el pago de la cuota`, 'Aceptar')
        }
      })
    )
  }

  protected limpiarFormulario(){
    this.formPago.patchValue({
      idSeguiCuota: null,
      monto: null,
      fechaPago: null,
      recibo:null,
      observacion:''
    });
    this.formPago.markAsPristine();
    this.formPago.markAsUntouched();
  }

  private actualizarIdPagoCuota(idPagoCuota:string): void{
    if(!this.detallePagoCuota.idPagoCuota){
      this.detallePagoCuota.idPagoCuota=idPagoCuota;
      this.formPago.get("idPagoCuota")?.setValue(idPagoCuota);
    }
  }

  protected editarPago(pago:ListaPagoCuota){
    this.formPago.patchValue({
      idSeguiCuota: pago.idSeguiCuota,
      monto: new DecimalFormatPipe().transform(pago.monto),
      fechaPago: convertStringToDate(pago.fechaPagoDate),
      recibo:pago.recibo,
      observacion:pago.observaciones
    });
    this.valoresInicialesEdicionPago = this.formPago.getRawValue();
  }

  private cambiosAlEditarPago(): boolean {
    return JSON.stringify(this.valoresInicialesEdicionPago) !== JSON.stringify(this.formPago.getRawValue());
  }

  protected eliminarPago(idSeguiCuota:string){
    const dialog = this.modalDialogService.question(
        'Eliminar pago',
        '¿Realmente desea eliminar este registro?',
        'Aceptar',
        'Cancelar'
      );
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.subscriptions.push(
              this.pagosService.eliminarPago(idSeguiCuota,this.detallePagoCuota.idPagoCuota).subscribe({
                next: resp => {
                  this.modalDialogService.success("Éxito",
                    'Pago eliminado correctamente',
                    'Aceptar');
                  this.limpiarFormulario();
                  this.obtenerDetallePagoCuota();
                  this.pagosService.actualizarReparacion();
                },
                error: error => {
                  this.modalDialogService.error("Error", 'Se ha producido un error inesperado al intentar eliminar el pago', 'Aceptar');
                }
              }
              )
            )
          }
        },
      });
  }

  protected counterReportChar(input: string): number {
    return this.formPago.get(input)!.value !== null
      ? this.formPago.get(input)!.value.length
      : 0;
  }

  protected cerrarModalGuiaComprobante = () => {
    this.mostrarGuiaComprobante = false
  }


  protected validOnlyAlphanumeric(evento: any): boolean {
    return validOnlyAlphanumeric(evento);
  }

  protected validOnlyAlphanumericOnPaste(evento: ClipboardEvent): any {
    return validOnlyAlphanumericOnPaste(evento);
  }

  protected validOnlyAlphanumericDrop(evento: DragEvent): any {
    return validOnlyAlphanumericDrop(evento);
  }

  protected validarRangoNumero(max:number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value !== null) {
        const monto = value;
        if(isNaN(monto) || monto <= 0 || monto>max){
          return { validarRangoNumero: true };
        }
      }
      return null;
    };
  }

  protected seleccionarComprobante(event: Event, fileInput: HTMLInputElement): void {
    const input = event.target as HTMLInputElement;
    this.textoValidacion=null;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!this.EXTENSIONES_PERMITIDAS_COMPROBANTE.includes(file.type)) {
        this.textoValidacion='El comprobante solo puede ser PDF, JPG o PNG.'
        this.resetearInputComprobante(fileInput);
        return;
      }
      const maxSizeBytes = PAGOS.MAXIMO_PESO_COMPROBANTE_MB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        this.textoValidacion=`El comprobante es demasiado grande. Debe tener un peso menor a ${PAGOS.MAXIMO_PESO_COMPROBANTE_MB}MB.`
        this.resetearInputComprobante(fileInput);
        return;
      }
      if (file.name.length > PAGOS.MAXIMO_TAMANHO_NOMBRE_COMPROBANTE) {
        alert(`El nombre del archivo es demasiado largo. Debe tener máximo ${PAGOS.MAXIMO_TAMANHO_NOMBRE_COMPROBANTE} caracteres.`);
        this.resetearInputComprobante(fileInput);
        return;
      }
      this.comprobanteSeleccionado = file;
      console.log('Archivo seleccionado:', file.name);
    } else {
      this.resetearInputComprobante(fileInput);
    }
  }

  protected resetearInputComprobante(fileInput: HTMLInputElement): void  {
    this.comprobanteSeleccionado = null;
    fileInput.value = '';
  }

}
