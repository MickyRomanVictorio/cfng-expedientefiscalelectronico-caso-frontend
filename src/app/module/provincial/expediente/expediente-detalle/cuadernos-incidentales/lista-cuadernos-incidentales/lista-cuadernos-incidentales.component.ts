import { Component, inject, OnDestroy, OnInit } from '@angular/core'
import { NgClass } from '@angular/common'
import { FiltroCuadernoIncidentalComponent } from './filtro-cuaderno-incidental/filtro-cuaderno-incidental.component'
import { GrillaCuadernosIncidentalesComponent } from './vistas/grilla-cuadernos-incidentales/grilla-cuadernos-incidentales.component'
import { TablaCuadernosIncidentalesComponent } from './vistas/tabla-cuadernos-incidentales/tabla-cuadernos-incidentales.component'
import { IconAsset, RESPUESTA_MODAL } from 'ngx-cfng-core-lib'
import { ButtonModule } from 'primeng/button'
import { CuadernosIncidentalesService } from '@services/provincial/cuadernos-incidentales/cuadernos-incidentales.service'
import { ActivatedRoute } from '@angular/router'
import { ExportarService } from '@services/shared/exportar.service'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { AlertaFechasDetalleComponent } from './alerta-fechas-detalle/alerta-fechas-detalle.component'
import { FormularioCrear } from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/formulario-crear.interface'
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { CrearEditarCuadernoIncidentalComponent } from '../../../../../../core/components/modals/cuaderno-incidental/crear-editar-cuaderno-incidental/crear-editar-cuaderno-incidental.component'
import { Subscription } from 'rxjs'
import { CuadernoIncidental, CuadernoIncidentalAlertaFecha, CuadernoIncidentalFiltro, TipoExportar, TipoVista } from '@core/interfaces/provincial/cuaderno-incidental/cuaderno-incidental.interface'
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component'

@Component({
  selector: 'app-lista-cuadernos-incidentales',
  standalone: true,
  imports: [
    FiltroCuadernoIncidentalComponent,
    GrillaCuadernosIncidentalesComponent,
    TablaCuadernosIncidentalesComponent,
    NgClass,
    ButtonModule,
    PaginatorComponent
  ],
  templateUrl: './lista-cuadernos-incidentales.component.html',
  styleUrls: ['./lista-cuadernos-incidentales.component.scss'],
  providers:[DialogService,NgxCfngCoreModalDialogService]
})
export class ListaCuadernosIncidentalesComponent implements OnInit, OnDestroy {

  private idCasoPadre: string = ''
  protected tipoVista: TipoVista = TipoVista.Grilla
  protected tipoVistaEnum = TipoVista
  protected TipoExportarEnum = TipoExportar
  protected listaCuadernos: CuadernoIncidental[] = []
  protected modificarDialogRef!: DynamicDialogRef
  protected numeroBusqueda: number = 0
  protected cantidadRegistrosTotales: number = 0
  private ultimoFiltroAplicado: CuadernoIncidentalFiltro | null = null
  public query: any = { limit: 10, page: 1, where: {} };
  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  }
  public resetPage: boolean = false

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly cuadernosIncidentalesService = inject(CuadernosIncidentalesService)
  private readonly route = inject(ActivatedRoute)
  private readonly exportarService = inject(ExportarService)
  private readonly dialogService = inject(DialogService)
  protected readonly iconAsset = inject(IconAsset)

  private readonly suscripciones: Subscription[] = []

  ngOnInit(): void {
    this.idCasoPadre = this.route.parent!.parent!.snapshot.paramMap.get('idCaso')!
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach( suscripcion =>  suscripcion.unsubscribe())
  }

  protected buscarCuadernoIncidental(filtros: CuadernoIncidentalFiltro): void {
    filtros['idCasoPadre'] = this.idCasoPadre
    this.ultimoFiltroAplicado = {...filtros}
    this.suscripciones.push(
      this.cuadernosIncidentalesService.lista(filtros)
      .subscribe({
        next: (rs) => {
          this.resetPage = false
          this.listaCuadernos = [...rs.registros]
          this.cantidadRegistrosTotales = rs.totalElementos
          this.numeroBusqueda++
          this.itemPaginado.data.data = rs.registros
          this.itemPaginado.data.total = rs.totalElementos
        }
      })
    )
  }

  protected registrarNuevoIncidente() {
    this.mostrarFormularioCrearModificar({
      casoId: null,
      casoCodigo: null,
      tipoClasificadorExpedienteId: null,
      tipoClasificadorExpedienteNombre: null,
    })
  }

  private mostrarFormularioCrearModificar( datos:FormularioCrear ): void{
    this.modificarDialogRef = this.dialogService.open( CrearEditarCuadernoIncidentalComponent, {
        showHeader: false,
        contentStyle: { padding: '0', 'border-radius': '15px' },
        data: datos
    })
    this.modificarDialogRef.onClose.subscribe((rs) => {
      if (rs ===  RESPUESTA_MODAL.OK) {
        this.buscarCuadernoIncidental(this.ultimoFiltroAplicado!)
      }
    })
  }

  protected eventoTipoVista(e: Event, tipoVista: TipoVista) {
    e.preventDefault()
    this.tipoVista = tipoVista
  }

  protected eventoExportar(tipoExportar: TipoExportar): void {
    if (this.listaCuadernos.length === 0) return
    //Obtener la lista completa de cuadernos
    let listaCuadernosAExportar: CuadernoIncidental[] = []
    let filtro = {...this.ultimoFiltroAplicado!, page: 1, perPage: 10000}
    this.cuadernosIncidentalesService.lista(filtro)
      .subscribe({
        next: (rs) => {
          listaCuadernosAExportar = [...rs.registros]
          //Exportar
          const cabecera = [
            'Número de cuaderno incidental',
            'Cuaderno incidental',
            'Etapa',
            'F. Registro',
            'Último Trámite',
            'Sujetos',
          ]
          const datos:any[] = []
          listaCuadernosAExportar.forEach((elm) => {
            datos.push({
              'Número de cuaderno incidental': elm.codigoCaso,
              'Cuaderno incidental': elm.tipoClasificadorExpediente,
              Etapa: elm.etapa,
              'F. Registro': elm.fechaCreacion + ' ' + elm.horaCreacion,
              'Último Trámite': elm.ultimoTramite,
              Sujetos: elm.sujetosProcesales
                .map((sujeto) => sujeto.nombreCorto)
                .join(', '),
            })
          })
          if (tipoExportar === TipoExportar.Excel) {
            this.exportarService.exportarAExcel(
              datos,
              cabecera,
              'Cuadernos Incidentales'
            )
            return
          }
          this.exportarService.exportarAPdf(
            datos,
            cabecera,
            'Cuadernos Incidentales'
          )
        }
      })
  }

  protected eventoModificar(cuaderno: CuadernoIncidental) {
    this.mostrarFormularioCrearModificar({
      casoId: cuaderno.idCaso,
      casoCodigo: cuaderno.codigoCaso,
      tipoClasificadorExpedienteId: cuaderno.idTipoClasificadorExpediente,
      tipoClasificadorExpedienteNombre: cuaderno.tipoClasificadorExpediente,
    })
  }

  protected eventoBorrar(cuaderno: CuadernoIncidental) {

    const dialog = this.modalDialogService.question(
      'Eliminar cuaderno incidental',
      `¿Está seguro de eliminar este cuaderno incidental: <b>${cuaderno.tipoClasificadorExpediente}</b>?`,
      'Eliminar',
      'Cancelar'
    )
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
           this.borrarConfirmar(cuaderno)
        }
      },
    })

  }

  private borrarConfirmar(cuaderno: CuadernoIncidental) {
    this.cuadernosIncidentalesService.borrar(cuaderno.idCaso).subscribe({
      next: () => {
        this.modalDialogService.success('Cuaderno incidental eliminado', `El cuaderno incidental <b>${cuaderno.tipoClasificadorExpediente}</b> se ha eliminado correctamente`, 'Aceptar')
        this.buscarCuadernoIncidental(this.ultimoFiltroAplicado!)
      },
      error: () => {
        this.modalDialogService.error("Error", `Se ha producido un error al intentar eliminar el cuaderno incidental`, 'Aceptar')
      },
    })
  }

  protected eventoAlertaFecha(cuadernoIncidentalAlertaFecha: CuadernoIncidentalAlertaFecha){
    const configuracion = {
      width: '60rem',
      showHeader: false,
      data: {
        tipoAlerta:cuadernoIncidentalAlertaFecha.tipoAlerta,
        cuadernoIncidental:cuadernoIncidentalAlertaFecha.cuadernoIncidental
      }
    }
    this.dialogService.open(AlertaFechasDetalleComponent, configuracion)
  }
  
  protected onPaginate(evento: any): void {
    this.query.limit = evento.limit
    this.query.page = evento.page
    this.buscarCuadernoIncidental({
      ...this.ultimoFiltroAplicado!,
      page: evento.page,
      perPage: evento.limit
    })
  }
}