import { Component, inject, input, effect, output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { SelectorVerticalComponent } from '@core/components/selector-vertical/selector-vertical.component'
import { ElementoSelectorVertical } from '@core/interfaces/comunes/elemento-selector-vertical.interface'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { ActoProcesalBase } from '@core/interfaces/reusables/acto-procesal/acto-procesal.interface'
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { CmpLibModule } from 'dist/cmp-lib'
import { IconAsset, IconUtil } from 'dist/ngx-cfng-core-lib'
import { Router } from '@angular/router';

@Component({
  selector: 'app-seleccionar-tramite',
  standalone: true,
  imports: [
    FormsModule,
    SelectorVerticalComponent,
    CmpLibModule
  ],
  templateUrl: './seleccionar-tramite.component.html',
  styleUrl: './seleccionar-tramite.component.scss'
})
export class SeleccionarTramiteComponent {

  public actosProcesales = input.required<ActoProcesalBase[]>()
  public idActoProcesalSeleccionado = input<string>('')
  public tramites = input.required<TramiteProcesal[]>()
  public idTramiteSeleccionado = input<string>('')
  public lectura = input<boolean>(false)
  public alCambiarActoProcesal = output<string>()
  public alCambiarTramite = output<string>()
  protected readonly iconUtil = inject(IconUtil)
  protected readonly iconAsset = inject(IconAsset)
  protected readonly tramiteService = inject(TramiteService)
  private readonly router = inject(Router)

  protected actosProcesalesAMostrar: ElementoSelectorVertical[] = []
  protected tramitesAMostrar: ElementoSelectorVertical[] = []
  protected actoProcesalSeleccionado: ElementoSelectorVertical | null = null
  protected tramiteSeleccionado: ElementoSelectorVertical | null = null
  protected selectorExpandido: boolean = false

  constructor() {
    effect(() => {
      this.actosProcesalesAMostrar = this.actosProcesales()
        .map(({ idActoProcesal, nombreActoProcesal }: ActoProcesalBase) => ({
          codigo: idActoProcesal,
          nombre: nombreActoProcesal,
        }))
      this.tramitesAMostrar = this.tramites()
        .map(({ idActoTramiteEstado, nombreTramite, esGenerico }: TramiteProcesal) => ({
          codigo: idActoTramiteEstado,
          nombre: nombreTramite,
          destacar: esGenerico !== '1'
        }))
      this.validarActoTramiteSeleccionado()
    })
  }

  ngOnInit(): void {
    this.tramiteService.selectorTramiteSubject$.subscribe({
      next: resp => {
        this.selectorExpandido = resp
      }
    })
    this.selectorExpandido = false

  }

  get estaElActoProcesalSeleccionado(): boolean {
    return this.actoProcesalSeleccionado !== null
  }

  get estaElTramiteSeleccionado(): boolean {
    return this.tramiteSeleccionado !== null
  }

  protected validarActoTramiteSeleccionado(): void {
    if (this.idActoProcesalSeleccionado() !== null && this.idTramiteSeleccionado() !== null) {
      this.actoProcesalSeleccionado = this.actosProcesalesAMostrar.find(actoProcesal => actoProcesal.codigo === this.idActoProcesalSeleccionado()) ?? null
      this.tramiteSeleccionado = this.tramitesAMostrar.find(tramite => tramite.codigo === this.idTramiteSeleccionado()) ?? null
    }
  }

  protected abrirSelectorActoTramite(): void {

    if (this.lectura()) return

    this.selectorExpandido = !this.selectorExpandido

    if (this.selectorExpandido) {
      setTimeout(() => {
        window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        })
      }, 100)
    }

  }

  protected alCambiarActoProcesalEvento(valor: ElementoSelectorVertical): void {
    this.actoProcesalSeleccionado = valor
    this.tramiteSeleccionado = null
    this.alCambiarActoProcesal.emit(valor.codigo)
  }

  protected alCambiarTramiteEvento(valor: ElementoSelectorVertical): void {
    console.log('alCambiarTramiteEvento', valor)
    this.tramiteSeleccionado = valor
    this.selectorExpandido = false
    this.alCambiarTramite.emit(valor.codigo)
  }

  protected getRutaBase(rutaActual: string): string {
    console.log(rutaActual)
    const indice = rutaActual.indexOf('/acto-procesal');
    if (indice !== -1) {
      return rutaActual.substring(0, indice + '/acto-procesal'.length);
    }
    return rutaActual;
  }


}