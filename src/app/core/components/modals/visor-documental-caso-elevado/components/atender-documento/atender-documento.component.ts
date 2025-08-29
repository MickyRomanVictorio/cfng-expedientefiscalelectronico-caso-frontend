import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CuadernoIncidentalResponse } from '@core/interfaces/provincial/documentos-ingresados/CuadernoIncidental';
import { InformacionDocumental } from '@core/interfaces/provincial/documentos-ingresados/InformacionDocumental';
import { AsignacionService } from '@core/services/superior/asignacion/asignacion.service';
import { Tramites } from '@interfaces/reusables/buscar-tramites/buscar-tramites.interface';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subject, Subscription } from 'rxjs';
import { TipoVisor } from '../../model/visor-documento.model';

@Component({
  standalone: true,
  selector: 'app-atender-documento',
  templateUrl: './atender-documento.component.html',
  styleUrls: ['./atender-documento.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RadioButtonModule,
    DropdownModule,
    CheckboxModule,
    InputTextareaModule,
    InputTextModule,
    ButtonModule,
    NgxCfngCoreModalDialogModule
  ],
})
export class AtenderDocumentoComponent implements OnInit {

  @Input()
  public documento!: InformacionDocumental;

  @Input()
  public datosObservacion: any;

  @Input()
  public caso: any;

  @Input( {required: true} )
  public tipoVisor!:TipoVisor;

  @Output()
  public atenderCasoRespuesta = new EventEmitter<any>();

  protected mostrarObservarCaso: boolean = false;

  remainingChars: number = 1000;
  formulario!: FormGroup;
  public subscriptions: Subscription[] = [];
  listAtenderDocumentoRecibido: any = [];
  solicitudes = [];
  proceso: number = 0;
  subtipo!: string;
  etapa!: string;
  tramite!: Tramites;
  cuadernoAsociado: CuadernoIncidentalResponse | null = null;
  protected TipoVisorEnum = TipoVisor;
private desuscribir$ = new Subject<void>();
  constructor(
    public ref: DynamicDialogRef,
    private readonly formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    private readonly asignacionService:AsignacionService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {
  }

  ngOnInit(): void {
    //1028=>Retiro de acusación, para este tipo de elevación no se requiere la observación
    this.mostrarObservarCaso = !(this.caso.idTipoElevacion === '1028' || this.caso.esSubsanado === '1');
    //
    this.formulario = this.formBuilder.group({
      accion: [null, Validators.required],
      descripcion: ['', Validators.maxLength(1000)],
    });
    //
    if( this.tipoVisor === TipoVisor.AtenderCaso ){
      this.formulario.get('accion')?.setValue('A');
    }else if( this.tipoVisor === TipoVisor.VerObservacion ){
      this.formulario.get('accion')?.setValue('O');
      this.formulario.disable();
    }
  }

  protected onInputDescripcionChange() {
    this.remainingChars = 1000 - this.formulario.get('descripcion')!.value.length;
  }

  protected onResponder() {
    const responderTipo = this.formulario.get('accion')?.value
    let tipoRespuesta = 1 /* 1:Exito Caso Aceptado 2:Exito Caso Observado */;
    if(responderTipo==='O' && this.formulario.get('descripcion')?.value===''){
      this.modalDialogService.warning('Observar Caso','Para continuar debe ingresar el detalles de las observaciones','Aceptar');
      return;
    }
    if(responderTipo==='O'){
      tipoRespuesta = 2;
    }
   
    this.asignacionService.atenderCaso(this.caso.idCaso, {
      idBandejaElevacion: this.caso.idBandejaElevacion,
      idActoTramiteCaso: this.caso.idActoTramiteCaso,
      tipoAccion:responderTipo,
      observacion:this.formulario.get('descripcion')?.value,
      numeroCaso: this.caso.codigoCaso??'',
      tipoElevacion:this.caso.tipoElevacion??'',
      despachoDestino: this.caso.codigoDespacho??''
    }).subscribe({
      next: (data) => {
        this.atenderCasoRespuesta.emit({respuesta:'completado'});
        this.responderRespuesta(tipoRespuesta);
      },
      error: (error) => {
        this.responderRespuesta(3, error.error?.message);
      }
    });
  }

  /**
   *
   * @param tipo 1:Exito Caso Aceptado 2:Exito Caso Observado, 3:Error
   * @param mensaje
   */
  private responderRespuesta(tipo:number, mensaje?:string):void{
    const caso=`
      <div class="pt-1">
        <b>${this.caso.codigoCaso}</b>
      </div>
    `;
    if(tipo === 1){
      //
      this.modalDialogService.success(
        'Caso aceptado correctamente',
        'Se aceptó correctamente el caso de <b>'+this.caso.tipoElevacion+'</b>: '+caso,
        'Aceptar'
      );
    }else if(tipo === 2){
      this.modalDialogService.success(
        'Caso observado correctamente',
        'Se observó correctamente el caso de <b>'+this.caso.tipoElevacion+'</b>: '+caso,
        'Aceptar'
      );
    }else if(tipo===3){
      this.modalDialogService.error(
        'Ocurrio un error',
        'No se puede registrar el proceso: '+(mensaje??''),
        'Aceptar'
      );
    }
  }
  ngOnDestroy(): void {
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }
 
}
