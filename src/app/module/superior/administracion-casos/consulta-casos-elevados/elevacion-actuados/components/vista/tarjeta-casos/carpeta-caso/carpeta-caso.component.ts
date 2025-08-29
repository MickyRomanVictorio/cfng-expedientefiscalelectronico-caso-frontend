import {DatePipe, NgClass} from '@angular/common';
import {Component, input, output} from '@angular/core';
import {
  BarraProgresoCasoComponent
} from '@core/components/consulta-casos/components/carpeta-caso/barra-progreso-caso/barra-progreso-caso.component';
import {
  EtiquetaAccionesCasoComponent
} from '@core/components/consulta-casos/components/carpeta-caso/etiqueta-acciones-caso/etiqueta-acciones-caso.component';
import {
  NotaAdhesivaComponent
} from '@core/components/consulta-casos/components/carpeta-caso/notas-adhesivas/nota-adhesiva/nota-adhesiva.component';
import {CasoFiscal, Plazo} from '@core/components/consulta-casos/models/listar-casos.model';
import {ConsultaCasosGestionService} from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import {PerfilJerarquia} from '@core/models/usuario-auth.model';
import {CasoLeidoRequest} from "@interfaces/provincial/administracion-casos/asignacion/AsignarCasoRequest";
import {AsignacionTransaccionalService} from "@services/provincial/asignacion/asignacion-transaccional.service";
import {DateFormatPipe, obtenerCasoHtml} from 'ngx-cfng-core-lib';
import {MenuItem} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {MenuModule} from 'primeng/menu';
import {TableModule} from 'primeng/table';
import {MenuOpcionesCasoComponent} from '@core/components/reutilizable/menu-opciones-caso/menu-opciones-caso.component';

@Component({
  selector: 'app-carpeta-caso',
  standalone: true,
  imports: [
    NgClass,
    NotaAdhesivaComponent,
    BarraProgresoCasoComponent,
    EtiquetaAccionesCasoComponent,
    ButtonModule,
    DialogModule,
    TableModule,
    MenuModule,
    DateFormatPipe,
    MenuOpcionesCasoComponent
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

  constructor(
    public readonly datePipe: DatePipe,
    private readonly consultaCasosGestionService: ConsultaCasosGestionService,
    private readonly asignacionTransaccionalService: AsignacionTransaccionalService,
  ) {
  }

  ngOnInit(): void {
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
    this.registarCasoLeido(caso.idCaso!, caso.flgCasoLeido!);
    this.casoSeleccionado.emit(caso);
  }

  protected getTarjetaTituloEstilo(): string {
    return this.consultaCasosGestionService.getTarjetaTituloEstilo( PerfilJerarquia.Superior, this.casofiscal());
  }

  protected verDelitoInicio(delitos: any[]):string {
    return this.consultaCasosGestionService.getNombreDelitos(delitos);
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

  protected plazosPronunciamiento(caso: CasoFiscal):Plazo[] {
    if(caso.plazos && caso.plazos.length > 0){
      return caso.plazos.filter( e=> e.idJerarquia===2 /* SUPERIOR */ && e.flgNivel==='T' /* TRÁMITE */ && (e.idAccionEstado ===166 || e.idAccionEstado === 171) /*EMITIR PRONUNCIAMIENTO | ELEVADO AL F. SUPERIOR*/);
    }
    return [];
  }
}
