import { DatePipe, NgClass } from '@angular/common';
import { Component, input, OnInit, output } from '@angular/core';
import { VisorEfeModalComponent } from '@components/modals/visor-efe-modal/visor-efe-modal.component';
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
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { CasoLeidoRequest } from '@core/interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest';
import { AsignacionTransaccionalService } from '@core/services/provincial/asignacion/asignacion-transaccional.service';

@Component({
  selector: 'app-carpeta-caso',
  standalone: true,
  imports: [
    NgClass,
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

  public casofiscal = input.required<CasoFiscal>();
  public casoSeleccionado = output<CasoFiscal>();

  protected mostrarDelitos: boolean = false;
  protected opcionesCaso: MenuItem[] = [];
  protected referenciaModal!: DynamicDialogRef;
  public obtenerCasoHtml = obtenerCasoHtml;
  public casoLeidoTemporal: boolean = false;
  constructor(
    public readonly datePipe: DatePipe,
    private readonly dialogService: DialogService,
    private asignacionTransaccionalService: AsignacionTransaccionalService
  ) {
  }

  ngOnInit(): void {
    console.log('CarpetaCasoComponent', this.casofiscal());
    this.opcionesCaso =  [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          this.registarCasoLeido(this.casofiscal().idCaso!,   this.casofiscal().flgCasoLeido!);
          this.mostrarVisorDocumental(this.casofiscal().idCaso!);
        }
      }
    ];
  }

  protected eventoMostrarOpcionesCaso(event: Event, menu: any){
    event.stopPropagation();
    menu.toggle(event);
  }

  protected eventoVerDelitos(event:Event, caso:any) {
    event.stopPropagation();
    this.registarCasoLeido(caso.idCaso, caso.flgCasoLeido);
    this.mostrarDelitos = true;
  }
   protected registarCasoLeido(idCaso: String, leido: string): void {
      if (leido == '1') return;
  
      let request: CasoLeidoRequest = {
        numeroCaso: idCaso,
        idEstadoCaso: 48,
      };
      this.asignacionTransaccionalService.registrarCasoLeido(request).subscribe({
        next: (resp) => {
         if (resp.code === 200) {
           this.casoLeidoTemporal= true;
         }
        },
        error: (error) => {},
      });
    }
  protected eventoCerrarDelitos(event:Event){
    event.stopPropagation();
    this.mostrarDelitos = false;
  }
  protected eventoVerDetalleCaso(caso: CasoFiscal): void {
    this.registarCasoLeido(caso.idCaso!, caso.flgCasoLeido!);
    this.casoSeleccionado.emit(caso);
  }

  protected getTarjetaTituloEstilo(): string {
    if(this.casofiscal().flgLectura?.toString() === '1' || this.casofiscal().flgConcluido?.toString() === '1') {
      return 'solo-lectura';
    }
    if(this.casofiscal().plazos!.filter(x => x.flgNivel == "C" && x.indSemaforo == 3).length > 0) {
      return 'plazo-vencido';
    }
    if(this.casofiscal().flgCasoLeido==='1'){
      return 'leido';
    }
    return '';
  }

  protected verDelitoInicio(delitos: any[]) {
    const result = delitos.slice(0, 2).map(curr => curr.nombre.toLowerCase().replace(/^\w/, (match: string) => match.toUpperCase())).join(', ');
    return result.length > 20 ? result.substring(0, 20) + '...' : result;
  }

  private mostrarVisorDocumental(idCaso: string): void {
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      contentStyle: { "padding": 0 },
      data: { idCaso: idCaso }
    });
  }
  copiarAlPortapapeles(valor:string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(valor).then(() => {
      }).catch(err => {
        console.error('Error al copiar al portapapeles:', err);
      });
    }else {
      const textArea = document.createElement('textarea');
      textArea.value = valor;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
      }
      document.body.removeChild(textArea);
    }
  }

  protected obtenerColorBadgePrincipioAcuerdo() {
    const classes: any = {}
    if (this.casofiscal().flgPrincipioOportunidad === '1') {
      classes['boton-etiqueta boton-etiqueta--purple-dark'] = true
    } else if (this.casofiscal().flgAcuerdoReparatorio === '1') {
      classes['boton-etiqueta boton-etiqueta--green-dark'] = true
    }
    return classes
  }
}
