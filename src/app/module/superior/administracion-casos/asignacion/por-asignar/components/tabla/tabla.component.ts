import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EtiquetaCasoComponent } from '@core/components/consulta-casos/components/carpeta-caso/etiqueta-caso/etiqueta-caso.component';
import { ConsultaCasosGestionService } from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { DelitosYPartesModalComponent } from '@core/components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { VisorEfeModalComponent } from '@core/components/modals/visor-efe-modal/visor-efe-modal.component';
import {
  EtiquetaClasesCss,
  PlazosLeyendaClasesCss,
  TipoElevacionCodigo,
  TipoElevacionId
} from '@core/constants/superior';
import { Casos } from '@core/interfaces/superior/administracion-casos/administracion-casos.model';
import { PerfilJerarquia } from '@core/models/usuario-auth.model';
import { DateFormatPipe } from '@core/pipes/format-date.pipe';
import { AsignacionService } from '@core/services/superior/asignacion/asignacion.service';
import { CasoLeidoRequest } from "@interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest";
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { AsignacionTransaccionalSuperiorService } from "@services/superior/asignacion/asignacion-transaccional.service";
import { getYYMMDDDashedToDDMMYYSlash, MathUtil, obtenerCasoHtml, StringUtil } from 'ngx-cfng-core-lib';
import { MenuItem } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [
    TableModule,
    DateFormatPipe,
    ProgressBarModule,
    MenuModule,
    PaginatorComponent,
    CheckboxModule,
    FormsModule,
    NgxCfngCoreModalDialogModule,
    EtiquetaCasoComponent,
    JsonPipe,
    AsyncPipe
  ],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.scss'
})
export class TablaComponent {

  @Input()
  public listaCasos: Casos[] = [];

  @Input()
  public paginacionCondicion:any;

  @Input()
  public paginacionConfiguracion:any;

  @Input()
  public esCriterioBusquedaValido:boolean = false;

  @Output()
  public cambiarPagina = new EventEmitter<any>();

  @Output()
  public respuestaRevertirAceptacion = new EventEmitter<any>();

  protected plazosLeyendaClasesCss = PlazosLeyendaClasesCss;
  protected etiquetaClasesCss: { [key: string]: string } = EtiquetaClasesCss;
  protected seleccionarTodosCasos:boolean = false;
  protected obtenerCasoHtml = obtenerCasoHtml;
  private casoSeleccionadoParaOpciones:any;
  protected TipoElevacionId = TipoElevacionId;
  public referenciaModal!: DynamicDialogRef;
  protected PerfilJerarquia = PerfilJerarquia;
  protected opcionesCaso:MenuItem[] =  [
 /*    {
      label: 'Visor documental', command: () => this.eventoVisorDocumental()
    },
    {
      label: 'Ver historial de caso', command: () => this.eventoHistorialCaso()
    },
    {
      label: 'Ver delitos y partes', command: () => this.eventoDelitosPartes()
    }, */
    {
      label: 'Revertir aceptación del caso', command: () => this.eventoRevertirAceptacionCaso()
    }
  ];

  constructor(
    protected readonly stringUtil: StringUtil,
    protected readonly mathUtil: MathUtil,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly asignacionService:AsignacionService,
    private readonly dialogService: DialogService,
    protected asignacionTransaccionalSuperiorService: AsignacionTransaccionalSuperiorService,
    protected readonly consultaCasosGestionService:ConsultaCasosGestionService
  ) { }

  protected eventoMostrarOpcionesCaso(event: Event, menu: any, caso:any){
    this.casoSeleccionadoParaOpciones = caso;
    event.stopPropagation();
    menu.toggle(event);
  }

  protected eventoCambiarPagina(datos:any){
    this.seleccionarTodosCasos = false;
    this.cambiarPagina.emit(datos);
    //Verificar si se seleccionaron todos los casos
    setTimeout(() => {
      this.seleccionarTodosCasos = !this.listaCasos.some(caso => caso.seleccionado === false);
    }, 100);
  }
  private eventoVisorDocumental(){
    this.registarCasoLeido(this.casoSeleccionadoParaOpciones.idCaso, this.casoSeleccionadoParaOpciones.esLeido);
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      contentStyle: { "padding": 0 },
      data: {
        idCaso: this.casoSeleccionadoParaOpciones.idCaso,
      }
    });
  }


  private eventoHistorialCaso(){
    this.registarCasoLeido(this.casoSeleccionadoParaOpciones.idCaso, this.casoSeleccionadoParaOpciones.esLeido);
    console.log('Historial de caso');
  }


  private eventoDelitosPartes(){
    this.registarCasoLeido(this.casoSeleccionadoParaOpciones.idCaso, this.casoSeleccionadoParaOpciones.esLeido);
    this.dialogService.open(DelitosYPartesModalComponent, {
      showHeader: false,
      data: {
        numeroCaso: this.casoSeleccionadoParaOpciones.numeroCaso
      }
    });
  }
  private eventoRevertirAceptacionCaso(){
    this.registarCasoLeido(this.casoSeleccionadoParaOpciones.idCaso, this.casoSeleccionadoParaOpciones.esLeido);
    const mensajeNota = `
      <div class="text-xs pt-2 text-600">
        <b>Nota:</b> Recuerda que el caso se visualizará en la sección <b>"BANDEJA"</b>, y tendrá que responder el caso nuevamente (aceptarlo u observarlo).
      </div>
    `;
    this.modalDialogService.warning(
      'Confirmar reversión de la aceptación del caso',
      'Se revertirá la aceptación del siguiente caso, confirmar esta acción. <div class="font-bold">'+obtenerCasoHtml(this.casoSeleccionadoParaOpciones.numeroCaso)+'</div>'+mensajeNota,
      'Si, revertir',true , 'Cancelar'
    ).subscribe({
      next: (resp:CfeDialogRespuesta) => {
        if(resp===CfeDialogRespuesta.Confirmado){
          this.revertirAceptacionCaso();
        }
      }
    })
  }
  private revertirAceptacionCaso(){
    const datos = {
      idBandejaElevacion:this.casoSeleccionadoParaOpciones.idBandejaElevacion,
      idEtapa: this.casoSeleccionadoParaOpciones.idEtapa
    };
    this.asignacionService.revertirCasos(this.casoSeleccionadoParaOpciones.idCaso,datos).subscribe({
      next: (resp: any) => {
        this.revertirAceptacionCasoRespuesta(1);
      },
      error: (err: any) => {
        this.revertirAceptacionCasoRespuesta(2, err.error.message);
      }
    });
  }

  /**
   *
   * @param tipo 1:Exito 2:Error
   */
  private revertirAceptacionCasoRespuesta(tipo:number, mensaje?:string){
    if(tipo===1){
      //
      this.respuestaRevertirAceptacion.emit();
      //
      this.modalDialogService.success(
        'Casos revertidos correctamente',
        ` Se revertió correctamente la aceptación del caso de <b>"${this.casoSeleccionadoParaOpciones.cssTextoElevacion.split('|')[0]}"</b>:
          <div class="font-bold py-1">${obtenerCasoHtml(this.casoSeleccionadoParaOpciones.numeroCaso)}</div>
          <div class="text-sm font-semibold pt-2 text-700">Puede visualizar el caso en la sección <b>"Bandeja"</b> del tipo de elevación correspondiente</div>
        `,
        'Aceptar'
      );
    }else if(tipo===2){
      this.modalDialogService.error(
        'Caso no revertido',
        `El numero de caso <b>${obtenerCasoHtml(this.casoSeleccionadoParaOpciones.numeroCaso)}</b> no se pudo revertir porque ocurrio un error:
        ${mensaje??'' }`,
        'Aceptar'
      );
    }
  }

  protected eventoSeleccionarCaso(e:any, caso:any){
    caso.seleccionado = e.checked;
    if(e.checked===false){
      this.seleccionarTodosCasos = false;
    }
  }
  protected eventoSeleccionarTodosCasos(event: any){
    this.listaCasos.forEach((caso:any) => {
      caso.seleccionado = event.checked;
    });
  }

  protected fechaHora(fechaHora:string){
    const fechaHoraDb = fechaHora.split(" ");
    return {
      fecha:getYYMMDDDashedToDDMMYYSlash(fechaHoraDb[0])!,
      hora: fechaHoraDb[1]
    }
  }

  public reiniciar(){
    this.seleccionarTodosCasos = false;
  }

  private registarCasoLeido(idCaso: string, leido: string): void {
    if (leido == '1') return;
    let request: CasoLeidoRequest = {
      numeroCaso: idCaso,
      idEstadoCaso: 1,// tabla de estados de caso el id 1 es POR ASIGNAR
    };
    this.asignacionTransaccionalSuperiorService.registrarCasoLeido(request).subscribe({
      next: (resp) => {
      },
      error: (error) => {},
    });
  }

  protected etiquetas2(caso:any){
    return this.consultaCasosGestionService.getEtiquetaXTipoElevacion(caso.idTipoElevacion, {
      esContiendaCompetencia: caso.esContiendaCompetencia,
      nuApelacion: caso.nuApelacion,
      nuCuaderno: caso.nuCuaderno
    }, '2');
  }

  protected readonly TipoElevacionCodigo = TipoElevacionCodigo;
}
