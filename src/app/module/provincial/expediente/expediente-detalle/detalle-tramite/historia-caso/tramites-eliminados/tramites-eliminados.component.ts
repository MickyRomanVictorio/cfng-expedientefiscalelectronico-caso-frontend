import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DatePipe, NgIf, TitleCasePipe } from "@angular/common"
import { HistorialTramiteModalComponent } from '@components/modals/historial-tramite-modal/historial-tramite-modal.component'
import { PreviewModalComponent } from '@components/modals/preview-modal/preview-modal.component'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { Expediente } from '@core/utils/expediente'
import { TramitesEliminadosService } from '@services/reusables/efe/tramites-eliminados.service'
import { ExportarService } from "@services/shared/exportar.service"
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib"
import { MessageService, SharedModule } from "primeng/api"
import { ButtonModule } from "primeng/button"
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { TableModule } from "primeng/table"
import { Subscription } from 'rxjs'
import { DateUtil, IconUtil } from 'dist/ngx-cfng-core-lib';
import { VerSujetosProcesalesTramiteComponent } from '../components/ver-sujetos-procesales-tramite/ver-sujetos-procesales-tramite.component';
import { TipoArchivoType } from '@core/types/exportar.type';
import { VerDetalleObservacionTramiteComponent } from '../tramites-activos/ver-detalle-observacion-tramite/ver-detalle-observacion-tramite.component';
import { TramiteEliminado } from '@core/interfaces/provincial/expediente/expediente-detalle/detalle-tramite/historia-caso/tramites-eliminados/tramites-eliminados.interface';
import { capitalized } from '@utils/string'

@Component({
  selector: 'app-tramites-eliminados',
  templateUrl: './tramites-eliminados.component.html',
  styleUrls: ['./tramites-eliminados.component.scss'],
  imports: [
    ButtonModule,
    ButtonModule,
    DatePipe,
    NgIf,
    SharedModule,
    TableModule,
    TitleCasePipe,
    CmpLibModule,
  ],
  standalone: true,
  providers: [MessageService, DatePipe, TitleCasePipe, DialogService]
})
export class TramitesEliminadosComponent implements OnInit, OnDestroy {

  private readonly suscripciones: Subscription[] = []

  protected caso!: Expediente
  protected tramitesEliminados : TramiteEliminado[] = []
  protected referenciaModal!: DynamicDialogRef
  protected idIngresoPorMesa: number = 1366
  protected capitalized = capitalized

  private readonly apiService = inject(TramitesEliminadosService)
  private readonly messageService = inject(MessageService)
  private readonly exportarService = inject(ExportarService)
  private readonly dialogService = inject(DialogService)
  private readonly gestionCasoService = inject(GestionCasoService)
  protected readonly dateUtil = inject(DateUtil)
  protected readonly iconUtil = inject(IconUtil)

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual
    this.obtenerTramitesEliminados()
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(suscripcion => suscripcion.unsubscribe())
  }

  private obtenerTramitesEliminados() {
    this.apiService.obtenerTramitesEliminados( this.caso.idCaso )
    .subscribe({
      next: (resp: any) => {
        this.tramitesEliminados = resp
      }
    })
  }

  protected exportar( tipoExportacion: TipoArchivoType ) {

    if (this.tramitesEliminados.length === 0) {
      this.messageService.add({severity: 'warn', detail: `No se encontraron registros para ser exportados a ${ tipoExportacion }`})
      return
    }

    const datos: any = this.tramitesEliminados.map((e:any, i:any) => ({
      ["N°"]: e.nro,
      ["Acto procesal"]: e.descActoProcesal,
      ["Tramite"]: e.descTramite,
      ["Fecha Creación"]: e.fechaCreacion,
      ["Fecha Eliminación"]: e.fechaEliminacion
    }))
 
    const headers = Object.keys(datos.at(0))

    if (tipoExportacion === 'PDF')
      this.exportarService.exportarAPdf(datos, headers, 'Tramites Eliminados', 'landscape')
    if (tipoExportacion === 'Excel')
      this.exportarService.exportarAExcel(datos, headers, 'Tramites Eliminados')
  }

  protected verSujetosProcesalesTramite( tramiteEliminado: TramiteEliminado ): void {

    this.dialogService.open(VerSujetosProcesalesTramiteComponent, {
      showHeader: false,
      contentStyle: {'padding': '0', 'border-radius': '15px'},
      data: {
        idActoTramiteCaso: tramiteEliminado.idActoTramiteCaso,
      }
    })

  }

  protected verHistorialTramite( tramite : any ): void {

    this.dialogService.open(HistorialTramiteModalComponent, {
      showHeader: false,
      contentStyle: {'border-radius': '15px'},
      data: {
        idCaso: this.caso.idCaso,
        numeroCaso: this.caso.numeroCaso,
        idTramite: tramite.idActoTramiteCaso,
        titulo: tramite.descTramite,
      }
    })

  }

  protected previsualizarTramite( tramiteEliminado: TramiteEliminado ): void {
    this.dialogService.open(PreviewModalComponent, {
      width:'1000px',
      height: '95%',
      showHeader: false,
      data: {
        idCaso: this.caso.idCaso,
        idActoTramiteCaso: tramiteEliminado.idActoTramiteCaso,
        /**coCaso: this.caso.numeroCaso,**/
        /**titulo: tramiteEliminado.descTramite,**/
      }
    })
  }

  protected verDetalleEliminacion( tramiteEliminado: TramiteEliminado ): void {

    this.dialogService.open(VerDetalleObservacionTramiteComponent, {
      showHeader: false,
      contentStyle: {'padding': '0', 'border-radius': '15px'},
      data: {
        titulo: 'DETALLE DE LA ELIMINACIÓN DEL TRÁMITE',
        numeroCaso: this.caso.numeroCaso,
        detalle: tramiteEliminado.motivoEliminacion,
        fecha: tramiteEliminado.fechaEliminacion,
        usuario: `${ tramiteEliminado.cargoUsuarioElimina } ${ tramiteEliminado.usuarioEliminacion }`,
        etiquetaDetalle: 'Detalles de la observación',
        etiquetaFecha: 'Fecha de observación',
      }
    })

  }

  protected icon(name: string): string {
    return `assets/icons/${name}.svg`
  }

}
