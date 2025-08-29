import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { FormularioCrear } from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/formulario-crear.interface'
import { ListaDelitosSujetos, SujetoProcesal } from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/sujeto-procesal.interface'
import { TipoClasificador } from '@core/interfaces/provincial/expediente/expediente-detalle/cuadernos/tipo-clasificador.interface'
import { CuadernosIncidentalesService } from '@core/services/provincial/cuadernos-incidentales/cuadernos-incidentales.service'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { CUADERNO_INCIDENTAL } from '@core/types/cuadernos/cuadernos-incidentales.type'
import { Expediente } from '@core/utils/expediente'
import { urlConsultaCuaderno } from '@core/utils/utils'
import { CmpLibModule } from 'dist/cmp-lib'
import { IconUtil, obtenerCasoHtml, RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib'
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { ButtonModule } from 'primeng/button'
import { DropdownModule } from 'primeng/dropdown'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { MultiSelectModule } from 'primeng/multiselect'
import { TableModule } from 'primeng/table'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-crear-editar-cuaderno-incidental',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    TableModule,
    MultiSelectModule

  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './crear-editar-cuaderno-incidental.component.html',
  styleUrl: './crear-editar-cuaderno-incidental.component.scss'
})
export class CrearEditarCuadernoIncidentalComponent {

  public casoFiscal!: Expediente
  public cuadernoCodigo: string[] | null = ['', '', '', '']
  protected casoPadreId: string = ''
  public titulo!: string
  protected listaCuadernoIncidental: TipoClasificador[] = []
  protected cuadernoIndicentalIdSelecciondo: string | null = null
  protected cuaderno: FormularioCrear | null = null
  protected listaSujetosProcesales: SujetoProcesal[] = []
  protected sujetosSeleccionados: SujetoProcesal[] = []
  private readonly subscriptions: Subscription[] = []
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  protected readonly CUADERNO_INCIDENTAL= CUADERNO_INCIDENTAL
  protected listaCuadernosMultiples: string[] = []
  protected readonly FALLECIDO: number = 1
  protected readonly NO_HABIDO: number = 2
  protected readonly DETENIDO: number = 3


  constructor(
    public config: DynamicDialogConfig,
    private readonly gestionCasoService: GestionCasoService,
    private readonly cuadernosIncidentalesService: CuadernosIncidentalesService,
    protected iconUtil: IconUtil,
    private readonly router: Router,
    public dialogRef: DynamicDialogRef,
  ) {
  }

  ngOnInit(): void {
    this.casoFiscal = this.gestionCasoService.casoActual
    this.casoPadreId = this.casoFiscal.idCaso
    this.cuaderno = this.config.data as FormularioCrear
    this.titulo = this.obtenerTitulo()
    this.listarCuadernosIncidentalesporCasoPrincipal()
    if (this.cuaderno.casoId) {
      this.cuadernoIndicentalIdSelecciondo = this.cuaderno.tipoClasificadorExpedienteId
      this.cuadernoCodigo = this.cuaderno.casoCodigo?.split('-') || ['', '', '', '']
      this.listarSujetosProcesales(this.cuadernoIndicentalIdSelecciondo)
    } else {
      this.cuadernoCodigo = this.casoFiscal.numeroCaso.split('-')
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  obtenerTitulo(): string {
    return `<div class="file-search-icon mt-1 mr-2"></div>${this.cuaderno?.casoId == null ? 'NUEVO' : 'MODIFICAR'} CUADERNO INCIDENTAL`
  }
  mostrarTooltipCuaderno(elm: HTMLDivElement, mostrar: boolean): void {
    elm.classList.toggle('hidden', !mostrar)
  }
  listarCuadernosIncidentalesporCasoPrincipal() {
    this.cuadernosIncidentalesService.listaCuadernoIndidentalXCasoPadre(this.casoPadreId).subscribe({
      next: (rs) => {
        this.listaCuadernoIncidental = rs
      }
    })
  }

  cambiarCuadernoIncidental(dato: any) {
    this.listaCuadernosMultiples=[]
    this.listarSujetosProcesales(dato.value)
  }
  codigosCuaderno(datos: string): string {
    const lista = datos.split(',')
    for (let i = 0; i < lista.length; i++) {
      lista[i] = obtenerCasoHtml(lista[i].trim())
    }
    return lista.join(',')
  }

  listarSujetosProcesales(idTipoClasificador: string | null) {
    this.cuadernosIncidentalesService.listaSujetosProcesalesXCasoPadre(this.casoPadreId, this.cuaderno!.casoId, idTipoClasificador).subscribe({
      next: (rs) => {
        this.sujetosSeleccionados = []
        this.listaSujetosProcesales = rs
        this.listaSujetosProcesales.forEach(elm => {
          elm.delitos.forEach(delito => {
            delito.delitoCompleto = `${delito.delitoGenerico} / ${delito.delitoSubgenerico} / ${delito.delitoEspecifico}`
          })
          elm.delitosSeleccionados = []
          if (elm.idSujetoProcesalCarpeta !== null) {
            elm.delitosSeleccionados = this.setearDelitosObtenidos(elm.delitos, elm.delitosProcesalCarpeta)
            this.sujetosSeleccionados.push(elm)
          }
        })
      }
    })
  }

  setearDelitosObtenidos(listaTotal: ListaDelitosSujetos[], listaObtenidos: ListaDelitosSujetos[]
  ): ListaDelitosSujetos[] {
    const obtenidosSet = new Set(
      listaObtenidos.map(
        (delito) =>
          `${delito.idDelitoEspecifico}-${delito.idDelitoGenerico}-${delito.idDelitoSubgenerico}`
      )
    )
    return listaTotal.filter((delito) =>
      obtenidosSet.has(
        `${delito.idDelitoEspecifico}-${delito.idDelitoGenerico}-${delito.idDelitoSubgenerico}`
      )
    )
  }

  quitarDelito(sujeto: SujetoProcesal, delito: ListaDelitosSujetos, event: Event, multiSelect: any): void {
    event.stopPropagation()
    sujeto.delitosSeleccionados = sujeto.delitosSeleccionados.filter(
      d => d.idDelitoSujeto !== delito.idDelitoSujeto
    )
    multiSelect.hide()
    this.listaSujetosProcesales = [...this.listaSujetosProcesales]
  }

  sujetoSeleccionado(
    idSujetoCaso: string
  ): boolean {
    return this.sujetosSeleccionados.some(sujeto => sujeto.idSujetoCaso === idSujetoCaso)
  }

  quitarSeleccionSujeto(event: any): void {
    event.data.delitosSeleccionados = []
  }

  quitarSeleccionSujetoTabla(event: any): void {
    if (event.checked == false) {
      this.listaSujetosProcesales.forEach(sujeto => sujeto.delitosSeleccionados = [])
    }
  }

  confirmarCreacionEdicionIncidental() {
    const cuadernoIncidental = this.listaCuadernoIncidental.find(elm => elm.idTipoClasificadorExpediente === this.cuadernoIndicentalIdSelecciondo)!
    let titulo = 'Crear cuaderno incidental',
      descripcion = `¿Está seguro de crear este cuaderno incidental: <b>${cuadernoIncidental.tipoClasificadorExpediente}</b>?`,
      textoConfirmar = 'Continuar'

    if (this.cuaderno!.casoId !== null) {
      titulo = 'Modificar cuaderno incidental'
      descripcion = `¿Está seguro de modificar este cuaderno incidental: <b>${cuadernoIncidental.tipoClasificadorExpediente}</b>?`
      textoConfirmar = 'Modificar'
    }

    const dialog = this.modalDialogService.question(
      titulo,
      descripcion,
      textoConfirmar,
      'Cancelar'
    )
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.creacionEdicionIncidental(cuadernoIncidental)
        }
      },
    })
  }

  creacionEdicionIncidental(cuadernoIncidental: TipoClasificador) {
    const sujetosProcesales: any[] = []
    //CREAR CUADERNO
    if (this.cuaderno!.casoId === null) {
      this.sujetosSeleccionados.forEach((elm) => {
        sujetosProcesales.push({
          idSujetoCaso: elm.idSujetoCaso,
          idSujetoProcesalCarpeta: elm.idSujetoProcesalCarpeta,
          flagAccion: '1',
          delitos: elm.delitosSeleccionados
        })
      })
      this.subscriptions.push(
        this.cuadernosIncidentalesService.registrar({
          idCasoPadre: this.casoPadreId,
          idTipoClasificadorExpediente: cuadernoIncidental.idTipoClasificadorExpediente,
          sujetos: sujetosProcesales,
          multiples:this.listaCuadernosMultiples
        }
        ).subscribe({
          next: (rs) => {
            this.dialogRef.close(RESPUESTA_MODAL.OK)
            this.mostrarAlertaCreacionEdicion(cuadernoIncidental, rs.data)
          },
          error: error => {
            this.modalDialogService.error("Error", `Se ha producido un error al intentar crear el cuaderno incidental`, 'Ok')
            this.dialogRef.close()
          }
        })
      )
    } else {
      //MODIFICAR CUADERNO
      this.listaSujetosProcesales.forEach((elm) => {
        const seleccionado = this.sujetosSeleccionados.find(t => t.idSujetoCaso === elm.idSujetoCaso && t.idSujetoProcesalCarpeta
          === elm.idSujetoProcesalCarpeta)
        if (seleccionado !== undefined) {
          sujetosProcesales.push({
            idSujetoCaso: elm.idSujetoCaso,
            idSujetoProcesalCarpeta: elm.idSujetoProcesalCarpeta,
            flagAccion: '1',
            delitos: elm.delitosSeleccionados
          })
        } else if (elm.idSujetoProcesalCarpeta !== null) {
          sujetosProcesales.push({
            idSujetoCaso: elm.idSujetoCaso,
            idSujetoProcesalCarpeta: elm.idSujetoProcesalCarpeta,
            flagAccion: '0',
            delitos: elm.delitosSeleccionados
          })
        }
      })
      this.cuadernosIncidentalesService.modificar(
        {
          idCasoPadre:this.cuaderno!.casoId,
          idTipoClasificadorExpediente: cuadernoIncidental.idTipoClasificadorExpediente,
          sujetos: sujetosProcesales,
          multiples:this.listaCuadernosMultiples
        }
      ).subscribe({
        next: (rs) => {
          this.dialogRef.close(RESPUESTA_MODAL.OK)
          this.mostrarAlertaCreacionEdicion(cuadernoIncidental, rs.data)
        },
        error: error => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar modificar el cuaderno incidental`, 'Ok')
          this.dialogRef.close()
        }
      })

    }
  }

  mostrarAlertaCreacionEdicion(cuadernoIncidental: TipoClasificador, cuaderno: any) {
    let titulo = 'CUADERNO INCIDENTAL REGISTRADO',
      descripcion = `El cuaderno incidental <b>${cuadernoIncidental.tipoClasificadorExpediente}</b> se ha registrado correctamente`
    if (this.cuaderno!.casoId !== null) {
      titulo = 'CUADERNO INCIDENTAL MODIFICADO'
      descripcion = `El cuaderno incidental <b>${cuadernoIncidental.tipoClasificadorExpediente}</b> se ha modificado correctamente`
    }
    const cfeDialog = this.modalDialogService.success(titulo, descripcion, 'Aceptar')
    cfeDialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          const ruta = urlConsultaCuaderno(
            'incidental',
            {
            idEtapa: cuaderno.idEtapa!,
            idCaso: cuaderno.idCaso!,
            flgConcluido: cuaderno.flagConcluido?.toString()
          })
          this.router.navigate([`${ruta}/acto-procesal`])
        }
      }
    })
  }

  listarCuadernosIncidentalesMultiple(lista: TipoClasificador[]): TipoClasificador[] {
    return lista.filter(item => item.idTipoClasificadorExpediente !== CUADERNO_INCIDENTAL.MULTIPLE)
  }

  removerMultipleSeleccionado(item: TipoClasificador, event: Event, multiSelect: any): void {
    event.stopPropagation()
    this.listaCuadernosMultiples = this.listaCuadernosMultiples.filter((selectedId) => selectedId !== item.idTipoClasificadorExpediente)
    multiSelect.hide()
  }

}