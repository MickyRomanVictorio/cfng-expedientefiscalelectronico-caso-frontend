import {Component, Input, OnInit} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {MenuModule} from 'primeng/menu';
import {CommonModule} from '@angular/common';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {VisorEfeModalComponent} from '@core/components/modals/visor-efe-modal/visor-efe-modal.component';
import {InformacionCasoComponent} from '@core/components/modals/informacion-caso/informacion-caso.component';
import {
  DelitosYPartesModalComponent
} from '@core/components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import {NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService,} from 'dist/ngx-cfng-core-modal/dialog';
import {ElevacionActuadosService} from '@core/services/superior/elevacion-actuados/elevacion-actuados.service';

@Component({
  selector: 'app-menu-opciones-caso',
  standalone: true,
  imports: [CommonModule, MenuModule, NgxCfngCoreModalDialogModule],
  templateUrl: './menu-opciones-caso.component.html',
  styleUrls: ['./menu-opciones-caso.component.scss'],
  providers: [DialogService, ElevacionActuadosService]
})
export class MenuOpcionesCasoComponent implements OnInit{
  @Input() opciones: string[] = [];
  @Input() idCaso?: string;
  @Input() numeroCaso?: string;
  @Input() idTipoElevacion?: string;
  @Input() idActoTramiteCaso?: string;

  menuItems: MenuItem[] = [];
  referenciaModal!: DynamicDialogRef;

  constructor(
    private readonly dialogService: DialogService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
  ) {
  }

  ngOnInit(): void {
    this.menuItems = this.opciones.map(opcion => {
      switch (opcion) {
        case 'Visor':
          return {
            label: 'Visor documental',
            command: () => this.abrirVisor()
          };
        case 'Historial':
          return {
            label: 'Ver historial del caso',
            command: () => this.abrirHistorial()
          };
        case 'Delitos':
          return {
            label: 'Ver delitos y partes',
            command: () => this.abrirDelitos()
          };
        default:
          return {label: opcion};
      }
    });
  }

  private mostrarErrorCaso() {
    this.modalDialogService.error(
      'No se pudo obtener el identificador del caso',
      'Error: No se pudo obtener el ID del caso.',
      'Aceptar'
    );
  }

  abrirVisor() {
    if (!this.idCaso) {
      this.mostrarErrorCaso();
      return;
    }
    this.referenciaModal = this.dialogService.open(VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      contentStyle: {"padding": 0},
      data: {idCaso: this.idCaso}
    });
  }

  abrirHistorial() {
    if (!this.idCaso || !this.numeroCaso) {
      this.mostrarErrorCaso();
      return;
    }
    this.referenciaModal = this.dialogService.open(InformacionCasoComponent, {
      width: '1267px',
      height: '100vh',
      showHeader: false,
      contentStyle: {
        padding: '20',
        'border-radius': '15px',
        'background-color': '#f5f2e0',
      },
      data: {
        numeroCaso: this.numeroCaso,
        idCaso: this.idCaso,
        bandeja: '',
        soloLectura: true,
      },
    });
    this.referenciaModal.onClose.subscribe({
      error: (error) => console.error(error),
    });
  }

  abrirDelitos() {
    if (!this.numeroCaso) {
      this.mostrarErrorCaso();
      return;
    }
    this.dialogService.open(DelitosYPartesModalComponent, {
      showHeader: false,
      data: {
        numeroCaso: this.numeroCaso,
      },
    });
  }

  eventoMostrarOpcionesCaso(event: Event, menu: any) {
    event.stopPropagation();
    menu.toggle(event);
  }
}
