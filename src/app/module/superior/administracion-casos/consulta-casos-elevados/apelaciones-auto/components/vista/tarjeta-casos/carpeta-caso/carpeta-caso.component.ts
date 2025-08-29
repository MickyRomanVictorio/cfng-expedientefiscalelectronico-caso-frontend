import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { EtiquetaAccionesCasoComponent } from '@core/components/consulta-casos/components/carpeta-caso/etiqueta-acciones-caso/etiqueta-acciones-caso.component';
import { FileInfoCaso } from '@core/components/consulta-casos/components/carpeta-caso/file-info-caso/file-info-caso.component';
import { NotaAdhesivaComponent } from '@core/components/consulta-casos/components/carpeta-caso/notas-adhesivas/nota-adhesiva/nota-adhesiva.component';
import { CasoFiscal, Plazo } from '@core/components/consulta-casos/models/listar-casos.model';
import { ConsultaCasosGestionService } from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import { VisorEfeModalComponent } from '@core/components/modals/visor-efe-modal/visor-efe-modal.component';
import { PerfilJerarquia } from '@core/models/usuario-auth.model';
import { CasoLeidoRequest } from "@interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest";
import { AsignacionTransaccionalService } from "@services/provincial/asignacion/asignacion-transaccional.service";
import { de } from 'date-fns/locale';
import { DateFormatPipe, obtenerCasoHtml } from 'ngx-cfng-core-lib';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';


@Component({
  selector: 'app-carpeta-caso',
  standalone: true,
  imports: [
    NgClass,
    NotaAdhesivaComponent,
    EtiquetaAccionesCasoComponent,
    ButtonModule,
    DialogModule,
    TableModule,
    MenuModule,
    DateFormatPipe,
    CommonModule,
    FileInfoCaso,
    BadgeModule
],
  templateUrl: './carpeta-caso.component.html',
  styleUrl: './carpeta-caso.component.scss',
  providers: [DatePipe, DialogService],
})
export class CarpetaCasoComponent {

  public casofiscal = input.required<CasoFiscal>();
  public casoSeleccionado = output<CasoFiscal>();

  protected mostrarDelitos: boolean = false;
  protected opcionesCaso: MenuItem[] = [];
  protected referenciaModal!: DynamicDialogRef;
  public obtenerCasoHtml = obtenerCasoHtml;
  protected PerfilJerarquia = PerfilJerarquia;
  protected contadorPestanias: number = 0;
  mostrarResumen = false;
  protected es_extremo: boolean = false;
  protected es_incidental: boolean = false;
  constructor(
    public readonly datePipe: DatePipe,
    private readonly dialogService: DialogService,
    private readonly consultaCasosGestionService: ConsultaCasosGestionService,
    private readonly asignacionTransaccionalService: AsignacionTransaccionalService,
  ) {
  }

  ngOnInit(): void {
    this.contadorPestanias= this.casofiscal().pestaniasApelacion?.reduce((a,objeto)=>a+objeto.cantidad,0) || 0;
    this.opcionesCaso =  [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarVisorDocumental(this.casofiscal().idCaso!);
        }
      }
    ];
  }


  protected toggleResumen(event: Event) {
    event && event.stopPropagation();
    this.mostrarResumen = !this.mostrarResumen;
  }
  protected eventoMostrarOpcionesCaso(event: Event, menu: any){
    event.stopPropagation();
    menu.toggle(event);
  }

  protected eventoVerDelitos(event:Event) {
    event.stopPropagation();
    this.mostrarDelitos = true;
  }
  protected eventoCerrarDelitos(event:Event){
    event.stopPropagation();
    this.mostrarDelitos = false;
  }
  protected eventoVerDetalleCaso(caso: CasoFiscal): void {
    console.log('eventoVerDetalleCaso', caso);
    if(caso.flgCasoLeido === '0'){
      this.registarCasoLeido(caso.idCaso!, caso.flgCasoLeido);
    }
    this.casoSeleccionado.emit(caso);
  }

  protected getTarjetaTituloEstilo(): string {
    return this.consultaCasosGestionService.getTarjetaTituloEstilo( PerfilJerarquia.Superior, this.casofiscal());
  }

  protected verDelitoInicio(delitos: any[]):string {
    return this.consultaCasosGestionService.getNombreDelitos(delitos);
  }

  private mostrarVisorDocumental(idCaso: string): void {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      contentStyle: { "padding": 0 },
      data: { idCaso: idCaso }
    });
  }

  private registarCasoLeido(idCaso: string, leido: string): void {
    if (leido == '1') return;
    let request: CasoLeidoRequest = {
      numeroCaso: idCaso,
      idEstadoCaso: 48
    };
    this.asignacionTransaccionalService.registrarCasoLeido(request).subscribe({
      next: (resp) => {},
      error: (error) => {},
    });
  }

}
