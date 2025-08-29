import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DateMaskModule } from '@directives/date-mask.module';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PaginatorModule } from 'primeng/paginator';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

import { obtenerIcono } from '@utils/icon';
import { ReusablesSujetoProcesalService } from '@services/reusables/reusable-sujetoprocesal.service';
import { MaestroService } from '@services/shared/maestro.service';
import { TrabajoSujetoProcesalRequest } from '@interfaces/reusables/sujeto-procesal/TrabajoSujetoProcesalRequest';
import { ToastModule } from 'primeng/toast';
import { IconUtil, ValidationModule } from 'dist/ngx-cfng-core-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { UpperCaseInputModule } from '@core/directives/uppercase-input.module';
import { convertStringToDate } from '@core/utils/date';

@Component({
  selector: 'app-registrar-trabajos',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    DateMaskModule,
    CheckboxModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    PaginatorModule,
    ReactiveFormsModule,
    CmpLibModule,
    ToastModule,
    ValidationModule,
    UpperCaseInputModule
  ],
  templateUrl: './registrar-trabajos.component.html',
  styleUrls: ['./registrar-trabajos.component.scss'],
  providers: [DatePipe, NgxCfngCoreModalDialogService],
})
export class RegistrarTrabajosComponent implements OnInit {
  
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  

  public formTrabajoSujetoProcesal!: FormGroup;

  tiposCentro: any[] = [];
  tiposPuesto: any[] = [];

  edicion: boolean;
  mostrar: boolean = true;

  fInicio: string | null;
  fFin: string | null;

  disabledButton: boolean = false;

  nombreBotonTrabajoSP: string = 'AGREGAR TRABAJO';

  private readonly idSujetoCaso: any;
  private readonly idSujetoCentroTrabajo: any;
  private readonly fechaNacimiento: any;

  esManual: boolean = false;
  minFechaFin: Date | null = null;
  minFechaInicio: Date | null = null;
  maxFechaInicio: Date | null = null;

  constructor(
    private readonly formulario: FormBuilder,
    private readonly datePipe: DatePipe,
    public referenciaModal: DynamicDialogRef,
    private readonly dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly reusablesSujetoProcesalService: ReusablesSujetoProcesalService,
    private readonly maestroService: MaestroService,
    protected iconUtil: IconUtil
  ) {
    this.edicion = false;

    this.fInicio = null;
    this.fFin = null;

    this.idSujetoCaso = this.config.data.idSujetoCaso;
    this.idSujetoCentroTrabajo = this.config.data.idSujetoCentroTrabajo;
    this.fechaNacimiento = this.config.data.fechaNacimiento;    
  }

  ngOnInit(): void {
    this.formInicio();
    this.loadTiposCentro();
    this.loadTiposPuesto();

    if (this.idSujetoCentroTrabajo) {
      this.edicion = true;
      this.formEdicion();
    }
    this.disabledButton = false;   
    this.formTrabajoSujetoProcesal.get('centroTrabajo')?.disable()
    this.formTrabajoSujetoProcesal.get('fechaFin')?.disable()

    this.minFechaInicio = new Date(this.fechaNacimiento);
    this.minFechaInicio.setDate(this.minFechaInicio.getDate() + 1);
  }

  private formInicio(): void {
    this.formTrabajoSujetoProcesal = this.formulario.group({
      idSujetoTrabajo: [null],
      idPersona: [null],
      tipoCentro: [444, Validators.required],
      numeroRuc: [null, Validators.required],
      centroTrabajo: [null, Validators.required],
      tipoPuesto: [null, Validators.required],
      fechaInicio: [null],
      fechaFin: [null],
      detalle: [null],
      esManual: [false]
    });
  }

  private formEdicion(): void {
    if (this.edicion) {
      this.nombreBotonTrabajoSP = 'EDITAR TRABAJO';

      this.reusablesSujetoProcesalService
        .getListaTrabajoSujetoProcesalPorId(this.idSujetoCentroTrabajo)
        .subscribe((response) => {
          this.formTrabajoSujetoProcesal = this.formulario.group({
            idSujetoTrabajo: response.data.idSujetoCentroTrabajo,
            numeroRuc: response.data.numeroRuc,
            idPersona: response.data.idPersona,
            tipoCentro: response.data.idTipoCentro,
            centroTrabajo: response.data.centroTrabajo,
            tipoPuesto: response.data.idPuesto,
            fechaInicio: response.data.fechaInicio ? convertStringToDate(response.data.fechaInicio) : null,
            fechaFin: response.data.fechaFin ? convertStringToDate(response.data.fechaFin) : null,
            detalle: response.data.detalle,
          });

          this.validarEdicion();
          
          const nuevaMinFechaFin = new Date(response.data.fechaInicio);
          nuevaMinFechaFin.setDate(nuevaMinFechaFin.getDate() + 1);
          this.minFechaFin = nuevaMinFechaFin;

          if(response.data.fechaFin){
            const nuevaMaxFechaInicio = new Date(response.data.fechaFin);
            nuevaMaxFechaInicio.setDate(nuevaMaxFechaInicio.getDate());
            this.maxFechaInicio = nuevaMaxFechaInicio;
          }
        });
    }
  }

  fechaInicioChange(){
    const fechaInicio = this.formTrabajoSujetoProcesal.get('fechaInicio')?.value;
    if( fechaInicio && fechaInicio !== null){
      const nuevaMinFechaFin = new Date(fechaInicio);
      nuevaMinFechaFin.setDate(nuevaMinFechaFin.getDate() + 1);
      this.minFechaFin = nuevaMinFechaFin;
      this.formTrabajoSujetoProcesal.get('fechaFin')?.enable()    
    }else{
      this.formTrabajoSujetoProcesal.get('fechaFin')?.setValue(null)
      this.maxFechaInicio = null
      this.formTrabajoSujetoProcesal.get('fechaFin')?.disable()
    }  
  }


  fechaFinChange(){
    const fechaFin = this.formTrabajoSujetoProcesal.get('fechaFin')?.value;
    if( fechaFin && fechaFin !== null){
      const nuevaMaxFechaFin = new Date(fechaFin);
      nuevaMaxFechaFin.setDate(nuevaMaxFechaFin.getDate());
      this.maxFechaInicio = nuevaMaxFechaFin;
    }
  }

  public registrarTrabajoSujetoProcesal(): void {

    const tipoCentro = this.formTrabajoSujetoProcesal.get('tipoCentro')!.value;

    if(!tipoCentro || tipoCentro === null){
      this.formTrabajoSujetoProcesal.markAllAsTouched();
      return;
    }else if ( tipoCentro !== 484 && this.formTrabajoSujetoProcesal.invalid) {
      this.formTrabajoSujetoProcesal.markAllAsTouched();
      return;
    }else if(tipoCentro === 484 && (this.formTrabajoSujetoProcesal.get('centroTrabajo')!.invalid  
      ||  this.formTrabajoSujetoProcesal.get('tipoPuesto')!.invalid ||  this.formTrabajoSujetoProcesal.get('tipoPuesto')!.invalid)) {
        this.formTrabajoSujetoProcesal.markAllAsTouched();
        return;      
    }

    const fechaInicio = this.formTrabajoSujetoProcesal.get('fechaInicio')!.value;
    const fechaFin = this.formTrabajoSujetoProcesal.get('fechaFin')!.value;

    if (this.fInicio !== fechaInicio) {
      this.fInicio = this.datePipe.transform(fechaInicio, 'dd/MM/yyyy');
    } else {
      this.fInicio = fechaInicio;
    }

    if (this.fFin !== fechaFin) {
      this.fFin = this.datePipe.transform(fechaFin, 'dd/MM/yyyy');
    } else {
      this.fFin = fechaFin;
    }

    let request: TrabajoSujetoProcesalRequest = {
      idSujetoCentroTrabajo:this.formTrabajoSujetoProcesal.get('idSujetoTrabajo')!.value,
      idSujetoCaso: this.idSujetoCaso,
      idPersona: this.formTrabajoSujetoProcesal.get('idPersona')!.value,
      idTipoCentro: this.formTrabajoSujetoProcesal.get('tipoCentro')!.value,
      centroTrabajo: this.formTrabajoSujetoProcesal.get('centroTrabajo')!.value.toUpperCase(),
      idPuesto: this.formTrabajoSujetoProcesal.get('tipoPuesto')!.value,
      fechaInicio:this.edicion === true? this.fInicio: this.datePipe.transform(this.formTrabajoSujetoProcesal.get('fechaInicio')!.value,'dd/MM/yyyy'),
      fechaFin:this.edicion === true? this.fFin: this.datePipe.transform(this.formTrabajoSujetoProcesal.get('fechaFin')!.value,'dd/MM/yyyy'),
      detalle: this.formTrabajoSujetoProcesal.get('detalle')!.value,
      numeroRuc: this.formTrabajoSujetoProcesal.get('numeroRuc')!.value,
      flgManual: this.esManual ? '1' : '0'
    };

    if (this.edicion) {
      this.reusablesSujetoProcesalService
        .actualizarTrabajoSujetoProcesal(request)
        .subscribe((data) => {        
          this.dialogRef.close(data);
          this.modalDialogService.success(
            'Trabajo actualizado',
            `Se actualizó correctamente el trabajo`,
            'Aceptar'
          );

        });
    } else {
      this.reusablesSujetoProcesalService
        .registrarTrabajoSujetoProcesal(request)
        .subscribe((data) => {         
          this.dialogRef.close(data);
          this.modalDialogService.success(
            'Trabajo registrado',
            `Se registró correctamente el trabajo`,
            'Aceptar'
          );  
        });
    }
  }

  activarRegistroManualCentroTrabjo(event: any): void {
    this.esManual = event.checked;
    if (event?.checked) {
      this.formTrabajoSujetoProcesal.get('centroTrabajo')!.enable();
      this.disabledButton = true;
    } else {
      this.disabledButton = false;
      this.formTrabajoSujetoProcesal.get('centroTrabajo')!.disable();
    }
   
    this.formTrabajoSujetoProcesal.get('centroTrabajo')!.setValue('');
    this.formTrabajoSujetoProcesal.get('numeroRuc')!.setValue('');
  }

  validarEdicion() {
    const valorSeleccionado =
      this.formTrabajoSujetoProcesal.get('tipoCentro')!.value;
    if (valorSeleccionado === 484) {
      this.mostrar = true;
      this.formTrabajoSujetoProcesal.get('centroTrabajo')!.enable();
    } else {
      this.mostrar = false;
      this.formTrabajoSujetoProcesal.get('centroTrabajo')!.disable();
    }
  }

  soloNumeros(event: any) {
    const soloNumeros = event.target.value.replace(/[^0-9]/g, '');
    this.formTrabajoSujetoProcesal.patchValue({
      numeroRuc: soloNumeros,
    });
  }
  validaFechaFin(control: any) {
    const fechaInicio = this.formTrabajoSujetoProcesal
      ? this.formTrabajoSujetoProcesal.get('fechaInicio')!.value
      : null;
    const fechaFin = control.value;

    if (fechaInicio && fechaFin) {
      return new Date(fechaFin) >= new Date(fechaInicio)
        ? null
        : { fechaInvalida: true };
    }
    return null;
  }

  public obtenerIcono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  public loadTiposCentro() {
    const nombreGrupo = 'ID_N_TIPO_CENTRO';
    this.maestroService
      .obtenerCatalogo(nombreGrupo)
      .subscribe((result: any) => {
        this.tiposCentro = result.data;
      });
  }

  public loadTiposPuesto() {
    const nombreGrupo = 'ID_N_PUESTO';
    this.maestroService
      .obtenerCatalogo(nombreGrupo)
      .subscribe((result: any) => {
        this.tiposPuesto = result.data;
      });
  }

  public consultarRUC() {
    let numeroRuc = this.formTrabajoSujetoProcesal.get('numeroRuc')!.value;
    if (numeroRuc !== undefined && numeroRuc !== null) {
      this.reusablesSujetoProcesalService
        .consultarRUCServicioExterno(numeroRuc)
        .subscribe({
          next: (response) => {
          if (response.length > 0) {
            this.formTrabajoSujetoProcesal.get('centroTrabajo')!.setValue(response[0].razonSocial);
          }else{
            this.modalDialogService.warning('RUC no encontrado', 'No se encontró este RUC, por favor inténtelo nuevamente', 'Aceptar')
          } 
        }
        ,error: () => {
          this.esManual = true;
          this.formTrabajoSujetoProcesal.get('esManual')?.setValue(true);
          this.formTrabajoSujetoProcesal.get('centroTrabajo')!.enable();
          this.disabledButton = true;
          this.modalDialogService.error('Servicio de SUNAT no disponible', 'El servicio del SUNAT no se encuentra disponible en este momento. Por favor inténtelo nuevamente más tarde o registre de manera manual', 'Aceptar')
        }
      }
      );
    }
  }

  capturarCambio(event: any) {
    const valorSeleccionado = event.value;

    if (valorSeleccionado === 484) {
      this.mostrar = true;
      this.formTrabajoSujetoProcesal.get('centroTrabajo')!.enable();
    } else {
      this.mostrar = false;
      this.formTrabajoSujetoProcesal.get('centroTrabajo')!.disable();
    }
    this.formTrabajoSujetoProcesal.get('centroTrabajo')!.setValue('');
    this.formTrabajoSujetoProcesal.get('numeroRuc')!.setValue('');
  }

  cerrarModal() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
