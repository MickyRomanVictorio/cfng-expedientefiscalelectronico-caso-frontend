import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VisorEfeModalComponent } from '@components/modals/visor-efe-modal/visor-efe-modal.component';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { DateFormatPipe, obtenerCasoHtml } from 'ngx-cfng-core-lib';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { BarraProgresoCasoComponent } from './barra-progreso-caso/barra-progreso-caso.component';
import { EtiquetaAccionesCasoComponent } from './etiqueta-acciones-caso/etiqueta-acciones-caso.component';
import { NotaAdhesivaComponent } from './notas-adhesivas/nota-adhesiva/nota-adhesiva.component';
import { PendientesCasoComponent } from './pendientes-caso/pendientes-caso.component';
import { Caso } from '../../models/listar-casos.model';

@Component({
  selector: 'app-carpeta-caso',
  standalone: true,
  imports: [
    NgClass,
    NgStyle,
    NotaAdhesivaComponent,
    BarraProgresoCasoComponent,
    PendientesCasoComponent,
    EtiquetaAccionesCasoComponent,
    ButtonModule,
    DialogModule,
    TableModule,
    MenuModule,
    DateFormatPipe
  ],
  providers: [DatePipe, DialogService],
  templateUrl: './carpeta-caso.component.html',
  styleUrls: ['./carpeta-caso.component.scss']
})
export class CarpetaCasoComponent implements OnInit {

  @Input()
  public casofiscal!: Caso;

  @Output()
  public casoSeleccionado = new EventEmitter<Caso>();

  protected mostrarDelitos: boolean = false;

  private estadoCaso: boolean = false;
  protected opcionesCaso: MenuItem[] = [];
  protected referenciaModal!: DynamicDialogRef;
  public obtenerCasoHtml = obtenerCasoHtml;

  constructor(
    public datePipe: DatePipe,
    private readonly Casos: Casos,
    private readonly dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    if (this.casofiscal.plazos == null) {
      this.casofiscal.plazos = [];
    }
    let estadoCaso = this.casofiscal.plazos.filter(x => x.flgNivel == "C" && x.indSemaforo == 3)
    this.estadoCaso = estadoCaso.length > 0;
    //
    this.opcionesCaso =  [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarVisorDocumental(this.casofiscal.idCaso, this.casofiscal.numeroCaso);
        }
      }
    ];

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
  protected eventoVerDetalleCaso(caso: Caso): void {
    this.casoSeleccionado.emit(caso);
  }

  protected getTarjetaTituloEstilo(): string {
    if (+this.casofiscal.flgLectura !== 1) {
      return 'solo-lectura';
    } else if (this.estadoCaso) {
      return 'plazo-vencido';
    } else {
      return 'leido';
    }
  }

  protected verDelitoInicio(delitos: any[]) {
    const result = delitos.slice(0, 2).map(curr => curr.nombre.toLowerCase().replace(/^\w/, (match: string) => match.toUpperCase())).join(', ');
    return result.length > 20 ? result.substring(0, 20) + '...' : result;
  }

  private mostrarVisorDocumental(idCaso: string, numeroCaso: string): void {
    //
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      contentStyle: { "padding": 0 },
      data: {
        caso: idCaso,
        numeroCaso: numeroCaso,
        idCaso: idCaso,
        title: 'Visor documental del caso:',
        description: 'Hechos del caso',
      }
    })
  }
}
