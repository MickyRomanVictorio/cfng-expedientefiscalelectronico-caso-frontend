import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsignacionConsultasSuperiorService } from '@core/services/superior/asignacion/asignacion-consultas.service';
import { AsignacionService } from '@core/services/superior/asignacion/asignacion.service';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { obtenerCasoHtml } from 'ngx-cfng-core-lib';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-asignar',
  standalone: true,
  imports: [
    DropdownModule,
    ReactiveFormsModule,
    NgxCfngCoreModalDialogModule
  ],
  templateUrl: './asignar.component.html',
  styleUrl: './asignar.component.scss',
  providers:[
    DialogService,  NgxCfngCoreModalDialogService
  ]
})
export class AsignarComponent implements OnInit {

  @Input()
  public casosSelecionados: any[] = [];

  @Output()
  public respuestaAsignar = new EventEmitter<any>();

  protected fiscalesPorAsignar: any[] = [];
  protected fiscalPorAsignar = new FormControl(null);

  constructor(
    private readonly asignacionConsultasSuperiorService:AsignacionConsultasSuperiorService,
    private readonly asignacionService: AsignacionService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
  ){}
  ngOnInit(): void {
    this.datosInicio();
  }
  private datosInicio(){
    this.asignacionConsultasSuperiorService.obtenerFiscales().subscribe({
      next: resp => {
        this.fiscalesPorAsignar = resp
      }
    });
  }

  protected eventoAsignar():void{
    const fiscal = this.fiscalesPorAsignar.find(fiscal => fiscal.idFiscal === this.fiscalPorAsignar.value);
    if(fiscal===undefined) {
      this.modalDialogService.warning('Fiscal no encontrado', 'Debe seleccionar un fiscal para realizar la asignación','Aceptar');
      return;
    }
    if(this.casosSelecionados.length===0){
      this.modalDialogService.warning('Casos no seleccionados', 'Debe seleccionar al menos un caso para realizar la asignación','Aceptar');
      return;
    }
    const casos=`
      <div class="pt-1">
        ${this.casosSelecionados.map(casofiscal => `<div>${obtenerCasoHtml(casofiscal.numeroCaso)}</div>`).join('')}
      </div>
    `;
    const cfeDialog = this.modalDialogService.warning(
      'Confirmar asignación de casos',
      '¿Está seguro que desea asignar los siguientes casos al fiscal <b>'+fiscal.nombreCompleto.trim()+'</b>?. Por favor confirme esta acción.'+casos,
      'Si, asignar',true , 'Cancelar'
    );
    cfeDialog.subscribe({
        next: (resp:CfeDialogRespuesta) => {
          if(resp===CfeDialogRespuesta.Confirmado){
            this.asignarCasos();
          }
        }
      }
    );
  }
  private asignarCasos():void{
    //Almacenar los datos para registrar la asignación
    const fiscal = this.fiscalesPorAsignar.find(fiscal => fiscal.idFiscal === this.fiscalPorAsignar.value);
    const casos:any[]=[];
    this.casosSelecionados.forEach(casofiscal => {
      casos.push( {
        idCaso: casofiscal.idCaso,
        idBandejaElevacion:casofiscal.idBandejaElevacion,
        idEtapa: casofiscal.idEtapa
      });
    });
    const datos = {
      idFiscalAsignado:fiscal.idFiscal,
      casos:casos
    }
    //Enviar los datos
    this.asignacionService.asignarCasos(datos).subscribe({
      next: (_) => {
        this.asignarCasosRespuesta(1);
      },error: (err) => {
        this.asignarCasosRespuesta(2, err.error.message);
      }
    });
    //
  }

  /**
   *
   * @param tipo 1:Exito 2:Error
   */
  private asignarCasosRespuesta(tipo:number, mensaje?:string):void{
    const fiscal = this.fiscalesPorAsignar.find(fiscal => fiscal.idFiscal === this.fiscalPorAsignar.value);
    const casos=`
      <div class="pt-1">
        ${this.casosSelecionados.map(casofiscal => `<div>${obtenerCasoHtml(casofiscal.numeroCaso)}</div>`).join('')}
      </div>
    `;
    if(tipo===1){
      //
      this.fiscalPorAsignar.reset();
      this.respuestaAsignar.emit();
      this.datosInicio();
      //
      this.modalDialogService.success(
        'Casos asignados correctamente',
        'Se asignaron correctamente los siguientes casos al fiscal <b>'+fiscal.nombreCompleto.trim()+'</b> '+casos,
        'Aceptar'
      );
    }else if(tipo===2){
      this.modalDialogService.error(
        'Casos no asignados',
        'No se asignaron los siguientes casos al fiscal  <b>'+fiscal.nombreCompleto.trim()+'</b> porque ocurrió un error: '+(mensaje??''),
        'Aceptar'
      );
    }
  }

}
