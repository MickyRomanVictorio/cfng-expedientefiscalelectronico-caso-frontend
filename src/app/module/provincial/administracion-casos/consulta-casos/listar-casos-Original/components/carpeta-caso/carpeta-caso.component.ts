import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { VisorEfeModalComponent } from '@components/modals/visor-efe-modal/visor-efe-modal.component';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { urlConsultaCasoFiscal } from '@core/utils/utils';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { CasoStorageService } from '@services/shared/caso-storage.service';
import { obtenerCasoHtml } from 'ngx-cfng-core-lib';
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
import { VisorEfeService } from '@core/services/visor/visor.service';

@Component({
  selector: 'app-carpeta-caso',
  standalone: true,
  imports: [
    CommonModule,
    NotaAdhesivaComponent,
    BarraProgresoCasoComponent,
    PendientesCasoComponent,
    EtiquetaAccionesCasoComponent,
    ButtonModule,
    DialogModule,
    TableModule,
    MenuModule
  ],
  providers: [DatePipe, DialogService],
  templateUrl: './carpeta-caso.component.html',
})
export class CarpetaCasoComponent implements OnInit {

  opcionesMenu2: (data: any) => MenuItem[] = ()=>[];
  
  @Input() casofiscal!: CasoFiscal;
  protected visible: boolean = false
  private estadoCaso: boolean = false;
  protected opcionesMenu!: (data: any) => MenuItem[];
  protected referenciaModal!: DynamicDialogRef;
  public obtenerCasoHtml = obtenerCasoHtml;

  constructor(
    private dataService: VisorEfeService,
    private sanitizer: DomSanitizer,
    public datePipe: DatePipe,
    private router: Router, private Casos: Casos,
    private casoStorageService: CasoStorageService,
    private dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    if (this.casofiscal.plazos == null) {
      this.casofiscal.plazos = [];
    }
    let estadoCaso = this.casofiscal.plazos.filter(x => x.flgNivel == "C" && x.indSemaforo == 3)
    this.estadoCaso = estadoCaso.length > 0 ? true : false;
    this.inicioOpcionesMenu();

    this.opcionesMenu2 = (data: any) => [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarVisorDocumental(data.idCaso, data.numeroCaso);
        }
      }
    ];

  }

  showCasos() {
    this.actualizarEstadoLeido(this.casofiscal.idCaso!);
    this.visible = true
  }

  protected getTarjetaTituloEstilo(): string {
    if (+this.casofiscal.flgLectura! === 1) {
      return 'solo-lectura';
    } else if (this.estadoCaso) {
      return 'plazo-vencido';
    } else {
      return 'leido';
    }
  }

  flatDelitos(delitos: any[]) {
    const result = delitos.slice(0, 2).map(curr => curr.nombre.toLowerCase().replace(/^\w/, (match: string) => match.toUpperCase())).join(', ');
    return result.length > 20 ? result.substring(0, 20) + '...' : result;
  }

  actualizarEstadoLeido(idCaso: string) {
    if (this.casofiscal.flgCasoLeido === "0") {
      this.Casos.updateEstadoLeido(idCaso || this.casofiscal.idCaso!).subscribe((data: any) => {
        this.casofiscal.flgCasoLeido = "1";
      });
    }
  }

  abrirDetalleCaso(caso: CasoFiscal): void {
    this.actualizarEstadoLeido(caso.idCaso!);
    caso.idEtapa
    const ruta = urlConsultaCasoFiscal({
      idEtapa: caso.idEtapa!,
      idCaso:caso.idCaso!,
      flgConcluido:caso.flgConcluido?.toString()
    });
    this.router.navigate([`${ruta}`]);
    // this.casoStorageService.setearSesionStorageCaso(caso, this.tipoOpcionCasoFiscal);
    this.casoStorageService.setearTabDetalle('0');
  }

  private inicioOpcionesMenu() {
    this.opcionesMenu = (data: any) => [
      {
        label: 'Visor documental',
        icon: 'file-search-icon',
        command: () => {
          this.mostrarVisorDocumental(data.idCaso, data.numeroCaso);
        }
      }
    ];
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
