import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Tab } from '@interfaces/comunes/tab';
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TabViewModule } from 'primeng/tabview';
import { CarpetaAuxiliarComponent } from './carpeta-auxiliar/carpeta-auxiliar.component';
import { CarpetaPrincipalComponent } from './carpeta-principal/carpeta-principal.component';
import { CuadernoIncidentalComponent } from '@components/modals/visor-efe-modal/cuaderno-incidental/cuaderno-incidental.component';
import { Cabecera, Etapas } from '@core/interfaces/visor/visor-interface';

@Component({
  standalone: true,
  selector: 'app-visor-efe-modal',
  templateUrl: './visor-efe-modal.component.html',
  imports: [
    TabsViewComponent,
    TabViewModule,
    CmpLibModule,
    CarpetaPrincipalComponent,
    CarpetaAuxiliarComponent,
    CuadernoIncidentalComponent,
  ],
})
export class VisorEfeModalComponent implements OnInit {
  protected indexTab: number = 0;
  protected ajustarAncho: number = 0;
  protected idSeleccionadoTab = PrevisualizarDocumentoTab.CarpetaPrincipal;

  protected obtenerIcono = obtenerIcono;
  protected datosGenerales: Cabecera = {
    codigo: '',
    despacho: '',
    fechaDenuncia: '',
    fiscalAsignado: ''

  };
  protected datosEntrada: any;
  protected datoEtapaCuadernos: Etapas[] = [];
  protected PrevisualizarDocumentoTab = PrevisualizarDocumentoTab;
  protected tabs: Tab[] = [
    {
      id: PrevisualizarDocumentoTab.CarpetaPrincipal,
      titulo: 'Carpeta Principal',
      ancho: 250,
    },
    {
      id: PrevisualizarDocumentoTab.CuadernosIncidentales,
      titulo: 'Cuadernos incidentales',
      ancho: 250,
      oculto: true
    },
    {
      id: PrevisualizarDocumentoTab.CarpetaAuxiliar,
      titulo: 'Carpeta auxiliar',
      ancho: 250,
    },
  ];

  constructor(
    protected ref: DynamicDialogRef,
    private readonly cdr: ChangeDetectorRef,
    private readonly sanitizer: DomSanitizer,
    public config: DynamicDialogConfig
  ) { }

  ngOnInit(): void {
    this.datosEntrada = this.config.data;
  }

  protected codigoHtml(codigo: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(obtenerCasoHtml(codigo));
  }

  protected eventoCambiarTab(index: number) {
    this.indexTab = index;
    this.idSeleccionadoTab = this.tabs.filter(t => t.oculto == null || !t.oculto)[index].id as PrevisualizarDocumentoTab;
  }

  protected datosInicioEmisor(datosInicio: Cabecera) {
    this.datosGenerales = datosInicio;
  }

  protected mostrarCuadernos(valor: boolean) {
    if (valor) {
      this.tabs
        .filter(t => t.id == PrevisualizarDocumentoTab.CuadernosIncidentales)
        .forEach(f => f.oculto = false);
      this.cdr.detectChanges();
      this.ajustarAncho = Math.random();
    }
  }

  protected agregarCuadernos(valor: Etapas[]) {
    if (valor) {
      this.datoEtapaCuadernos = [...valor];
    }
  }

}
/***** Intrefaces Locales ******/
export enum PrevisualizarDocumentoTab {
  CarpetaPrincipal = 0,
  CuadernosIncidentales = 1,
  CuadernosEjecucion = 2,
  CarpetaAuxiliar = 3,
}
export interface DatosInicio {
  despacho: string;
  fiAsignado: string;
  fechaDenuncia: string;
  horaDenuncia: string;
}

// export interface DatosEtapas {
//   id: EtapasArchivoEnum;
//   nombre: string;
//   mostrarContenido: boolean;
//   datos?: any;
// }
export enum EtapasArchivoEnum {
  Registro = '00',
  Calificacion = '01',
  Preliminar = '02',
  Preparatoria = '03',
  Intermedia= '04',
  Juzgamiento = '05',
  Sentencia = '06'
}



export enum ClasificadorDocumentoEnum {
  ActuacionFiscal = '1',
  FuenteInvestigacion='2',
  AudiosAuditoria='3',
  Cargo='4',
  Principal='5'
}
