import { CommonModule } from '@angular/common';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DelitosYPartesModalComponent } from '@components/modals/delitos-y-partes-modal/delitos-y-partes-modal.component';
import { DescripcionModalComponent } from '@components/modals/descripcion-modal/descripcion-modal.component';
import { IndiceIconosComponent } from '@utils/indice-iconos/indice-iconos.component';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import {VisorEfeModalComponent} from "@components/modals/visor-efe-modal/visor-efe-modal.component";
import { AsuntoObservacionesComponent } from '@components/modals/asunto-observaciones/asunto-observaciones.component';
import { AgregarDelitosModalComponent } from '@components/modals/agregar-delitos-modal/agregar-delitos-modal.component';
import {AcuerdoReparatorioComponent} from "@components/modals/acuerdo-reparatorio/acuerdo-reparatorio.component";
import {DetalleFirmaComponent} from "@components/modals/detalle-firma/detalle-firma.component";
import {
  HistorialTramiteModalComponent
} from "@components/modals/historial-tramite-modal/historial-tramite-modal.component";
import { IndicadorComponent } from './dash/indicador/indicador.component';
import { BandejaFiscaliaSuperiorService } from '@services/superior/bandeja/bandeja-fiscalia-superior';
import { Subscription } from 'rxjs';
import { ModalObservarRespuestaContiendaComponent } from '@modules/provincial/tramites/comun/preparatoria/disposicion-emitir-pronunciamiento-contienda-competencia/modal-observar-respuesta-contienda/modal-observar-respuesta-contienda.component';
import { DelitosPartesDesacumularModalComponent } from '@core/components/modals/delitos-partes-desacumular-modal/delitos-partes-desacumular-modal.component';
import { Router } from '@angular/router';
import { ResumenComponent as ResumenSuperiorComponent } from '@modules/superior/inicio/resumen/resumen.component';
import { UsuarioAuthService } from '@core/services/auth/usuario.service.ts.service';

@Component({
  standalone: true,
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
  imports: [
    CommonModule,
    DynamicDialogModule, IndicadorComponent,
    ResumenSuperiorComponent
  ],
  providers: [ DialogService ],
})
export class InicioBkComponent implements OnInit {

  protected esJerarquiaSuperior:boolean = false;


  public refModal!: DynamicDialogRef;


  listaIndicadores = [];
  listaIndicadoresTexto: any = "";
  public subscriptions: Subscription[] = []
  constructor(
    private dialogService: DialogService,
    private _router: Router,
    private bandejaFiscaliaSuperiorService: BandejaFiscaliaSuperiorService,

    private readonly usuarioAuthService: UsuarioAuthService
  ) { }


  lstIndicadores: any;

  verListaIndicadores() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.bandejaFiscaliaSuperiorService.obtenerIndicadoresFiscaliaSuperior().subscribe({
          next: resp => {
            console.log(resp)
            this.lstIndicadores = resp.data
            resolve(resp.data);
          }
        })
      )
    });
  }

  ngOnInit() {
    this.esJerarquiaSuperior = this.usuarioAuthService.esJerarquiaSuperior();

    this.verListaIndicadores().then(x => {
      this.listaIndicadoresTexto = JSON.stringify(x);
    });


  }

  public openModal( tipo: string ): void {

    if ( tipo === 'anular' ) {
      this.refModal = this.dialogService.open( DescripcionModalComponent, {
        showHeader: false,
        contentStyle: { 'padding':'0', 'border-radius': '15px' },
        data: {
          caso: '506014501-2021-590-0',
          title: 'Motivo de anulación del caso',
          description: 'Ingrese motivo de anulación',
        }
      })
    } else {
      this.refModal = this.dialogService.open( DescripcionModalComponent, {
        showHeader: false,
        contentStyle: { 'padding':'0', 'border-radius': '15px' },
        data: {
          caso: '506014501-2021-590-0',
          title: 'Clasificación de caso',
          description: 'Ingrese la clasificación del caso',
        }
      })
    }

  }

  public openDelitosPartes(): void {
    this.refModal = this.dialogService.open( DelitosYPartesModalComponent, {
      showHeader: false,
      contentStyle: { 'padding':'0', 'border-radius': '15px' },
      data: {
        caso: '506014501-2021-590-0',
      }
    })
  }

  public openAgregarDelitos(): void {
    this.refModal = this.dialogService.open( AgregarDelitosModalComponent, {
      showHeader: false,
      contentStyle: { 'padding':'0', 'border-radius': '15px' },
      data: {
        numeroCaso: '506014501-2021-590-0',
        descripcionHechos: 'Una banda integrada presuntamente por ciudadanos extranjeros dejó tres heridos de bala, la madrugada de este domingo 9 de julio de 2023. José Olivares (40) y Karina Seminario (43) retornaban del aeropuerto internacional Jorge Chavez a su vivienda, cuando fueron interceptados por dos delincuentes. Seminario llevaba a su bebé de ocho meses en brazos.',
      }
    })
  }


  public abrirAsuntosObseraciones(): void {
    this.refModal = this.dialogService.open( AsuntoObservacionesComponent, {
      showHeader: false,
      contentStyle: { 'padding':'0', 'border-radius': '15px' },
      data: {
        numeroCaso: '506014501-2021-590-0',
        title: 'Asunto Observaciones',
        description: 'Hechos del caso',
      }
    })
  }

  public openIndiceIconos(): void {
    this.refModal = this.dialogService.open( IndiceIconosComponent, {
      showHeader: false,
      contentStyle: { 'padding':'0', 'border-radius': '15px' },
      data: {
        caso: '506014501-2021-590-0',
        title: 'Indice de iconos',
        description: 'Indice de iconos',
      }
    })
  }

  openAcuerdoReparatorio( numeroCaso: String ): void {
    this.refModal = this.dialogService.open(
      AcuerdoReparatorioComponent,
      {
        showHeader: false,
        data: {
          caso: numeroCaso,
          titulo: 'ACUERDOS PARA EL ACUERDO REPARATORIO',
          descripcion: ''
        }

      }
    )
  }

  public openHistorialTramite(): void {
    this.refModal = this.dialogService.open( HistorialTramiteModalComponent, {
      // width: '70%',
      showHeader: false,
      contentStyle: { 'padding':'0', 'border-radius': '15px' },
      data: {
        numeroCaso: '506150101-2023-8-0',
        // idCaso:
        // numeroCaso:
        // idTramite:
        // nombreTramite:
      }
    })
  }

  public openVisorEFE(): void {

    this.refModal = this.dialogService.open( VisorEfeModalComponent, {
      width: '95%',
      showHeader: false,
      data: {
        caso: '0A89927358850122E0650250569D508A',//'506150101-2023-1-0',
        // caso: '32121-2021-1-0',
        title: 'Visor documental del caso: ',
        description: '',
      }
    })
  }

  public verDetalleFirma(idDocumento: string): void {
    this.refModal = this.dialogService.open( DetalleFirmaComponent, {
      showHeader: false,
      contentStyle: { 'padding':'0', 'border-radius': '15px' },
      data: {
        idDocumento: idDocumento,
        titulo: 'Detalle de firmas',
      }
    })
  }



  observarTramite(): void {
    this.refModal = this.dialogService.open(
      ModalObservarRespuestaContiendaComponent,
      {
        showHeader: false,
        data: {
          caso: "adsdada",
          titulo: 'ACUERDOS PARA EL ACUERDO REPARATORIO',
          descripcion: ''
        }

      }
    )
  }

  modalDelitos(): void {


    this.refModal = this.dialogService.open(DelitosPartesDesacumularModalComponent, {
      showHeader: false,
      styleClass: 'desacumular_caso_modal',
      contentStyle: { 'max-width': '1200px' },
      data: {
        caso: {},
      },
    });

  }


  navigate(route:string) {
    this._router.navigate(['./app/administracion-casossuperior/bandejas/' + route])
  }
}
