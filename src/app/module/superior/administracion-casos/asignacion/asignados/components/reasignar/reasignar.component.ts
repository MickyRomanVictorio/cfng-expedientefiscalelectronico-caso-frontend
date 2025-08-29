import { FileUtil, IconUtil, obtenerCasoHtml } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TipoAsignacion } from '@core/constants/superior';
import { AsignacionConsultasSuperiorService } from '@core/services/superior/asignacion/asignacion-consultas.service';
import { SelectItem } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { AsignacionService } from '@core/services/superior/asignacion/asignacion.service';

@Component({
  selector: 'app-reasignar',
  standalone: true,
  imports: [
    CalendarModule,
    DropdownModule,
    InputTextModule,
    CmpLibModule,
    ReactiveFormsModule,
    NgxCfngCoreModalDialogModule
  ],
  templateUrl: './reasignar.component.html',
  styleUrl: './reasignar.component.scss',
  providers:[DatePipe]
})
export class ReasignarComponent implements OnInit{

  @Input()
  public casosSelecionados: any[] = [];

  @Output()
  public respuestaReasignar = new EventEmitter<any>();

  protected tipoReAsignacion: SelectItem[] = TipoAsignacion;
  protected fiscalesPorAsignar: any[] = [];
  protected archivoSeleccionado:File | null = null;
  protected form!: FormGroup;

  constructor(
    private readonly fb : FormBuilder,
    private readonly asignacionConsultasSuperiorService: AsignacionConsultasSuperiorService,
    protected readonly iconUtil:IconUtil,
    private readonly datePipe: DatePipe,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly asignacionServiceas:AsignacionService,
    private readonly fileUtil:FileUtil
  ){}

  ngOnInit(): void {
    this.crearFormulario();
    this.datosInicio();
  }

  private datosInicio(){
    //Fiscales
    this.asignacionConsultasSuperiorService.obtenerFiscales().subscribe({
      next: resp => {
        this.fiscalesPorAsignar = resp
      }
    });
  }

  private crearFormulario(){
    this.form = this.fb.group({
      tipoReasignacion: [null, [Validators.required]],
      fiscalAReasignar: [null, [Validators.required]],
      motivo: [''],
      fechaInicio: [null],
      fechaFin: [null],
    });
    //Inica desabilitado el formulario
    this.form.disable();
  }

/**
 *
 * @param tipo 1:Motivo, 2:Boton Reasignar
 * @returns
 */
  protected habilitarDesahabilitarControles(tipo:number=0):boolean{
    const rs = this.casosSelecionados.length === 0;
    if(tipo === 1){
      const motivoControl = this.form.get('motivo');
      if (rs && motivoControl?.enabled) {
        motivoControl.disable();
      } else if (!rs && motivoControl?.disabled) {
        motivoControl.enable();
      }
    }else if(tipo === 2){
      return rs || (this.form.get('tipoReasignacion')!.value===null || this.form.get('fiscalAReasignar')!.value===null);
    }
    return rs;
  }

  protected eventoIniciarSeleccionarArchivo(e:MouseEvent, archivoInput:HTMLInputElement): void {
    e.preventDefault();
    archivoInput.click();
  }

  protected eventoSeleccionarArchivo(archivoInput:HTMLInputElement){
    if(archivoInput===null || archivoInput===undefined || archivoInput.files===undefined){
      return;
    }
    if(archivoInput.files!.length===0){
      return;
    }
    this.archivoSeleccionado = archivoInput.files![0];
  }

  protected eventoDeseleccionarArchivo(archivoInput:HTMLInputElement){
    this.archivoSeleccionado = null;
    archivoInput.value = '';
  }
  protected eventoCambiarTipoReasignacion(dato:any):void{
    const fechaInicio = this.form.get('fechaInicio'),
          fechaFin = this.form.get('fechaFin');
    //Tipo de asignacion - Temporal
    if(dato.value===2){
      fechaInicio?.enable();
      fechaFin?.enable();
    }else{
      fechaInicio?.disable();
      fechaFin?.disable();
    }
    //
  }

  protected async eventoReasignar(): Promise<void> {
    const {tipoReasignacion, fiscalAReasignar, motivo, fechaInicio, fechaFin} = this.form.getRawValue();
    const fechaActual = new Date();
    //Tipo de reasignacion - Temporal
    if(tipoReasignacion === 2){
      if(fechaInicio===null || fechaFin===null || fechaInicio === '' || fechaFin === ''){
        this.modalDialogService.warning('Fechas inválidas', 'Debe seleccionar las fechas de inicio y fin de la reasignación', 'Aceptar');
        return;
      }
      //
      if(fechaInicio > fechaFin){
        this.modalDialogService.warning('Fechas inválidas', 'La fecha de inicio no puede ser mayor a la fecha de fin', 'Aceptar');
        return;
      }
      // if(fechaInicio > fechaActual || fechaFin > fechaActual){
      //   this.modalDialogService.warning('Fechas inválidas', 'Las fechas de inicio y fin no pueden ser mayor a la fecha actual', 'Aceptar');
      //   return;
      // }
    }
    if(motivo.length > 200){
      this.modalDialogService.warning('Descripción del motivo inválida', 'La descripción del motivo no puede ser mayor a 200 caracteres', 'Aceptar');
      return;
    }
    const datos:any = {
      idFiscalAsignado: fiscalAReasignar,
      idTipoAsignacion: tipoReasignacion,
      fechaInicioReasignacion: tipoReasignacion===2? this.datePipe.transform(fechaInicio, 'dd/MM/yyyy'): null,
      fechaFinReasignacion: tipoReasignacion===2? this.datePipe.transform(fechaFin, 'dd/MM/yyyy'): null,
      motivoReasignacion: motivo,
      casos: [],
      archivoNombre:this.archivoSeleccionado?this.archivoSeleccionado.name:'',
      archivoPorSubir:this.archivoSeleccionado? await this.fileUtil.archivoFileToB64(this.archivoSeleccionado):''
    }
    const casos:any[] =[];
    //
    this.casosSelecionados.forEach( item => {
      casos.push(item.numeroCaso);
      datos.casos.push({
        idCaso: item.idCaso,
        numeroCaso: item.numeroCaso,
			  idBandejaElevacion: item.idBandejaElevacion,
			  idEtapa: item.idEtapa
      });
    });
    //
    const fiscal = this.fiscalesPorAsignar.find(fiscal => fiscal.idFiscal === fiscalAReasignar);
    //
    this.modalDialogService.warning(
      'Confirmar reasignación de casos',
      '¿Está seguro que desea reasignar los siguientes casos al fiscal <b>'+fiscal.nombreCompleto.trim()+'</b>?<div>Por favor, confirme esta acción.</div><div>'+casos.map(caso => `<div>${obtenerCasoHtml(caso)}</div>`).join('')+'</div>',
      'Si, reasignar',true,'Cancelar'
    ).subscribe({
      next: (resp:CfeDialogRespuesta) => {
        if(resp===CfeDialogRespuesta.Confirmado){
          this.reasignarCasos(datos);
        }
      }
    });
  }

  private reasignarCasos(data:any):void{
    this.asignacionServiceas.reasignarCasos(data).subscribe({
      next: (_) => {
        this.reasignarCasisRespuesta(1);
      },
      error: (err:any) => {
        this.reasignarCasisRespuesta(2, err.error.message);
      }
    });
  }

  /**
   *
   * @param tipo 1:Exito 2:Error
   * @param mensaje
   */
  private reasignarCasisRespuesta(tipo:number, mensaje?:string):void{
    const fiscal = this.fiscalesPorAsignar.find(fiscal => fiscal.idFiscal === this.form.get('fiscalAReasignar')!.value);
    const casos=`
      <div class="pt-1">
        ${this.casosSelecionados.map(casofiscal => `<div>${obtenerCasoHtml(casofiscal.numeroCaso)}</div>`).join('')}
      </div>
    `;
    if(tipo===1){
      //
      this.form.reset();
      this.respuestaReasignar.emit();
      this.datosInicio();
      //
      this.modalDialogService.success(
        'Casos reasignados correctamente',
        'Se reasignaron correctamente los siguientes casos al fiscal <b>'+fiscal.nombreCompleto.trim()+'</b> '+casos,
        'Aceptar'
      );
    }else if(tipo===2){
      this.modalDialogService.error(
        'Casos no reasignados',
        'No se reasignaron los casos al fiscal  <b>'+fiscal.nombreCompleto.trim()+'</b> porque ocurrió un error: '+(mensaje??''),
        'Aceptar'
      );
    }
  }
}
