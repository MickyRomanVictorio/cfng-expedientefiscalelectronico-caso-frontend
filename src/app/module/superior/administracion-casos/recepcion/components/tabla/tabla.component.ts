import { JsonPipe, NgClass, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { DelitosYPartesModalComponent } from '@core/components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { VisorEfeModalComponent } from '@core/components/modals/visor-efe-modal/visor-efe-modal.component';
import {
  EtiquetaClasesCss,
  PlazosLeyendaClasesCss,
  TipoElevacionCodigo,
  TipoElevacionId
} from '@core/constants/superior';
import { DateFormatPipe, MathUtil, obtenerCasoHtml, StringUtil } from 'ngx-cfng-core-lib';
import { MenuItem } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule, TableService } from 'primeng/table';
import {CasoLeidoRequest} from "@interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest";
import {AsignacionTransaccionalSuperiorService} from "@services/superior/asignacion/asignacion-transaccional.service";
import { EtiquetaCasoComponent } from '@core/components/consulta-casos/components/carpeta-caso/etiqueta-caso/etiqueta-caso.component';
import { PerfilJerarquia } from '@core/models/usuario-auth.model';
import { ConsultaCasosGestionService } from '@core/components/consulta-casos/services/consulta-casos-gestion.service';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [
    TableModule,
    NgClass,
    DateFormatPipe,
    ProgressBarModule,
    MenuModule,
    PaginatorComponent,
    CheckboxModule,
    FormsModule,
    NgStyle,
    EtiquetaCasoComponent
  ],
  templateUrl: './tabla.component.html',
  providers: [ TableService ]
})
export class TablaComponent {
@Input ()
public asignadosRececpcionados:string = 'asignados';
  @Input()
  public listaCasos: any[] = [];

  @Input()
  public paginacionCondicion:any;

  @Input()
  public paginacionConfiguracion:any;

  @Input()
  public esCriterioBusquedaValido:boolean = false;

  @Output()
  public cambiarPagina = new EventEmitter<any>();

  protected plazosLeyendaClasesCss = PlazosLeyendaClasesCss;
  protected etiquetaClasesCss: { [key: string]: string } = EtiquetaClasesCss;
  protected seleccionarTodosCasos:boolean = false;
  protected obtenerCasoHtml = obtenerCasoHtml;
  private casoSeleccionadoParaOpciones:any;
  protected TipoElevacionId = TipoElevacionId;
  public referenciaModal!: DynamicDialogRef;
  protected PerfilJerarquia = PerfilJerarquia;
  protected opcionesCaso:MenuItem[] =  [
    {
      label: 'Visor documental', command: () => this.eventoVisorDocumental()
    },
    {
      label: 'Ver historial de caso', command: () => this.eventoHistorialCaso()
    },
    {
      label: 'Ver delitos y partes', command: () => this.eventoDelitosPartes()
    }
  ];

  constructor(
    protected readonly stringUtil: StringUtil,
    protected readonly mathUtil: MathUtil,
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
  private eventoDelitosPartes(){
    this.registarCasoLeido(this.casoSeleccionadoParaOpciones.idCaso, this.casoSeleccionadoParaOpciones.esLeido);
    this.dialogService.open(DelitosYPartesModalComponent, {
      showHeader: false,
      data: {
        numeroCaso: this.casoSeleccionadoParaOpciones.numeroCaso
      }
    });
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
  public reiniciar(){
    this.seleccionarTodosCasos = false;
  }

  private registarCasoLeido(idCaso: string, leido: string): void {
    if (leido == '1') return;
    let request: CasoLeidoRequest = {
      numeroCaso: idCaso,
      idEstadoCaso: 49,// tabla de estados de caso el id 1 es POR ASIGNAR
    };
    this.asignacionTransaccionalSuperiorService.registrarCasoLeido(request).subscribe({
      next: (resp) => {
      },
      error: (error) => {},
    });
  }

  protected etiquetas2(caso:any){
    return this.consultaCasosGestionService.getEtiquetaXTipoElevacion(caso.idTipoElevacion, {
      esContiendaCompetencia: caso.contiendaCompetencia,
      nuApelacion: caso.numeroApelacion,
      nuCuaderno: caso.nuCuaderno
    }, '2');
  }


  protected readonly TipoElevacionCodigo = TipoElevacionCodigo;
}
