import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService, SharedModule } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DateMaskModule } from '@directives/date-mask.module';
import { MaestroService } from '@services/shared/maestro.service';
import { EstudioSujetoProcesalRequest } from '@interfaces/reusables/sujeto-procesal/EstudioSujetoProcesalRequest';
import { ReusablesSujetoProcesalService } from '@services/reusables/reusable-sujetoprocesal.service';
import { ToastModule } from 'primeng/toast';
import { IconUtil, ValidationModule } from 'dist/ngx-cfng-core-lib';
import {
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import { CO_TIPO_INST } from '@core/types/sujetos/tipo-institucion';
import { UpperCaseInputModule } from '@core/directives/uppercase-input.module';
import { convertStringToDate } from '@core/utils/date';

@Component({
  selector: 'app-registrar-estudios',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    DropdownModule,
    SharedModule,
    InputTextModule,
    ReactiveFormsModule,
    ButtonModule,
    RadioButtonModule,
    CmpLibModule,
    CalendarModule,
    DateMaskModule,
    InputTextareaModule,
    ToastModule,
    ValidationModule,
    UpperCaseInputModule
  ],
  templateUrl: './registrar-estudios.component.html',
  styleUrls: ['./registrar-estudios.component.scss'],
  providers: [
    MessageService,
    DialogService,
    DatePipe,
    NgxCfngCoreModalDialogService,
  ],
})
export class RegistrarEstudiosComponent {
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);

  public formEstudioSujetoProcesal!: FormGroup;

  tiposInstitucion: any[] = [];
  tiposInstitucionEducativa: any[] = [];
  tiposGradoInstruccion: any[] = [];
  tiposCarrera: any[] = [];

  edicion: boolean;

  fInicio: string | null;
  fFin: string | null;

  nombreBotonEstudioSP: string = 'AGREGAR ESTUDIO';


  private readonly idSujetoCaso;
  private readonly idSujetoEstudio;
  minFechaFin: Date | null = null;
  maxFechaInicio: Date | null = null;

  constructor(
    private readonly formulario: FormBuilder,
    private readonly datePipe: DatePipe,
    public config: DynamicDialogConfig,
    private readonly sanitizer: DomSanitizer,
    public dialogRef: DynamicDialogRef,
    private readonly maestroService: MaestroService,
    private readonly reusablesSujetoProcesalService: ReusablesSujetoProcesalService,
    protected iconUtil: IconUtil
  ) {
    this.idSujetoCaso = this.config.data.idSujetoCaso;
    this.idSujetoEstudio = this.config.data.idSujetoEstudio;

    this.edicion = false;
    this.fInicio = '';
    this.fFin = '';
    
  }

  ngOnInit(): void {
    this.formInicio();
    this.loadTiposInstitucion();
    this.loadTiposInstitucionEducativa();
    this.loadTiposGradoInstruccion();
    this.loadTiposCarrera();

    this.formEstudioSujetoProcesal.get('otraInstitucion')!.disable();
    this.formEstudioSujetoProcesal.get('fechaFin')?.disable()
    if (this.idSujetoEstudio) {
      this.edicion = true;
      this.formEdicion();
    }
  }

  private formInicio(): void {
    this.formEstudioSujetoProcesal = this.formulario.group({
      idSujetoEstudio: [null],
      tipoInstitucion: [null, Validators.required],
      tipoInstitucionEducativa: [null, Validators.required],
      otraInstitucion: [null],
      tipoGradoInstruccion: [null, Validators.required],
      tipoCarrera: [null],
      fechaInicio: [null],
      fechaFin: [null],
      detalle: [null],
    });
  }

  private formEdicion(): void {
    if (this.edicion) {
      this.nombreBotonEstudioSP = 'EDITAR ESTUDIO';

      this.reusablesSujetoProcesalService
        .getListaEstudioSujetoProcesalPorId(this.idSujetoEstudio)
        .subscribe((response) => {
          this.formEstudioSujetoProcesal = this.formulario.group({
            idSujetoEstudio: response.data.idSujetoEstudio,
            tipoInstitucion: response.data.idTipoInstitucion,
            tipoInstitucionEducativa: response.data.idInstitucionEducativa,
            otraInstitucion: response.data.otraInstitucion,
            tipoGradoInstruccion: response.data.idGradoInstruccion,
            tipoCarrera: response.data.idCarrera,
            fechaInicio: response.data.fechaInicio ? convertStringToDate(response.data.fechaInicio) : null,
            fechaFin: response.data.fechaFin ? convertStringToDate(response.data.fechaFin) : null,
            detalle: response.data.detalle,
          });
          
          if (response.data.otraInstitucion === null) {
            this.formEstudioSujetoProcesal.get('otraInstitucion')!.disable();
          }

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
    const fechaInicio = this.formEstudioSujetoProcesal.get('fechaInicio')?.value;
    if( fechaInicio && fechaInicio !== null){
      const nuevaMinFechaFin = new Date(fechaInicio);
      nuevaMinFechaFin.setDate(nuevaMinFechaFin.getDate() + 1);
      this.minFechaFin = nuevaMinFechaFin;
      this.formEstudioSujetoProcesal.get('fechaFin')?.enable()    
    }else{
      this.formEstudioSujetoProcesal.get('fechaFin')?.setValue(null)
      this.maxFechaInicio = null
      this.formEstudioSujetoProcesal.get('fechaFin')?.disable()
    }  
  }

  fechaFinChange(){
    const fechaFin = this.formEstudioSujetoProcesal.get('fechaFin')?.value;
    if( fechaFin && fechaFin !== null){
      const nuevaMaxFechaFin = new Date(fechaFin);
      nuevaMaxFechaFin.setDate(nuevaMaxFechaFin.getDate());
      this.maxFechaInicio = nuevaMaxFechaFin;
    }
  }

  protected changeInstitucionEducativa() {
    if(this.formEstudioSujetoProcesal.get('tipoInstitucionEducativa')!.value === CO_TIPO_INST.OTRO){
      this.formEstudioSujetoProcesal.get('otraInstitucion')?.enable();
    }else{
      this.formEstudioSujetoProcesal.get('otraInstitucion')?.disable();
    }
  }

  protected registrarEstudioSujetoProcesal(): void {

    if (this.formEstudioSujetoProcesal.invalid) {
      this.formEstudioSujetoProcesal.markAllAsTouched();
      return;
    }

    const fechaInicio = this.formEstudioSujetoProcesal.get('fechaInicio')!.value;
    const fechaFin = this.formEstudioSujetoProcesal.get('fechaFin')!.value;

    if (this.fInicio !== fechaInicio) {
      console.log('fechaInicio');
      
      this.fInicio = this.datePipe.transform(fechaInicio, 'dd/MM/yyyy');
    } else {
      this.fInicio = fechaInicio;
    }

    if (this.fFin !== fechaFin) {
      this.fFin = this.datePipe.transform(fechaFin, 'dd/MM/yyyy');
    } else {
      this.fFin = fechaFin;
    }

    let request: EstudioSujetoProcesalRequest = {
      idSujetoEstudio:this.formEstudioSujetoProcesal.get('idSujetoEstudio')!.value,
      idSujetoCaso: this.idSujetoCaso,
      idTipoInstitucion:this.formEstudioSujetoProcesal.get('tipoInstitucion')!.value,
      idInstitucionEducativa: this.formEstudioSujetoProcesal.get('tipoInstitucionEducativa')!.value,
      idGradoInstruccion: this.formEstudioSujetoProcesal.get('tipoGradoInstruccion')!.value,
      idCarrera: this.formEstudioSujetoProcesal.get('tipoCarrera')!.value,
      otraInstitucion: this.formEstudioSujetoProcesal.get('otraInstitucion')!.value,
      fechaInicio: this.edicion === true? this.fInicio : this.datePipe.transform(this.formEstudioSujetoProcesal.get('fechaInicio')!.value,'dd/MM/yyyy'),
      fechaFin:this.edicion === true? this.fFin: this.datePipe.transform(this.formEstudioSujetoProcesal.get('fechaFin')!.value,'dd/MM/yyyy'),
      detalle: this.formEstudioSujetoProcesal.get('detalle')!.value,
    };

    if (this.edicion) {
      this.reusablesSujetoProcesalService
        .actualizarEstudioSujetoProcesal(request)
        .subscribe((data) => {
          this.dialogRef.close(data);
          this.modalDialogService.success(
            'Estudio actualizado',
            `Se actualizó correctamente el estudio`,
            'Aceptar'
          );
        });
    } else {      
      this.reusablesSujetoProcesalService
        .registrarEstudioSujetoProcesal(request)
        .subscribe((data) => {
          this.dialogRef.close(data);
          this.modalDialogService.success(
            'Estudio registrado',
            `Se registró correctamente el estudio`,
            'Aceptar'
          );          
        });
    }
  }
  
  public obtenerTituloModal(): SafeHtml {
    let titulo: string = '';
    if (this.edicion) {
      titulo = 'EDICIÓN DE ESTUDIO';
    } else {
      titulo = 'REGISTRO DE ESTUDIO';
    }
    return this.sanitizer.bypassSecurityTrustHtml(`${titulo}`);
  }

  public loadTiposInstitucion() {
    const nombreGrupo = 'ID_N_TIPO_INST';
    this.maestroService
      .obtenerCatalogo(nombreGrupo)
      .subscribe((result: any) => {
        this.tiposInstitucion = result.data;
      });
  }

  public loadTiposInstitucionEducativa() {
    const nombreGrupo = 'ID_N_INS_EDU';
    this.maestroService
      .obtenerCatalogo(nombreGrupo)
      .subscribe((result: any) => {
        this.tiposInstitucionEducativa = result.data;
      });
  }

  public loadTiposGradoInstruccion() {
    const nombreGrupo = 'ID_N_GRAD_INST';
    this.maestroService
      .obtenerCatalogo(nombreGrupo)
      .subscribe((result: any) => {
        this.tiposGradoInstruccion = result.data;
      });
  }

  public loadTiposCarrera() {
    const nombreGrupo = 'ID_N_CARRERA';
    this.maestroService
      .obtenerCatalogo(nombreGrupo)
      .subscribe((result: any) => {
        this.tiposCarrera = result.data;
      });
  }

  cerrarModal() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
