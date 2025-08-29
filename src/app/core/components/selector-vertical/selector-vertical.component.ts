import { AfterViewInit, Component, effect, ElementRef, inject, input, output, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ElementoSelectorVertical } from '@core/interfaces/comunes/elemento-selector-vertical.interface';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'selector-vertical',
  standalone: true,
  imports: [
    CmpLibModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule
  ],
  templateUrl: './selector-vertical.component.html',
  styleUrl: './selector-vertical.component.scss'
})
export class SelectorVerticalComponent implements AfterViewInit {

  @ViewChild('buscadorActoProcesal') inputElement!: ElementRef;

  public titulo = input.required<string>()
  public placeholder = input<string>('Buscar...')
  public elementos = input.required<ElementoSelectorVertical[]>()
  public tieneSubelementos = input<boolean>()
  public tieneBuscador = input<boolean>(false)
  public textoElementosVacios = input<string>('No se encontraron elementos para mostrar')
  public elementoSeleccionado = input<string | undefined>(undefined)
  public alCambiarElementoSeleccionado = output<ElementoSelectorVertical>()
  protected readonly iconUtil = inject(IconUtil)

  protected textoABuscar: string = ''
  protected elementosFiltrados: ElementoSelectorVertical[] = []

 constructor() {
    effect(() => {
      this.elementosFiltrados = [...this.elementos()]
    })
  }

  ngAfterViewInit() {
    this.inputElement?.nativeElement.focus();
  }

  protected alBuscarElemento(valor: string): void {
    this.elementosFiltrados = this.elementos()
      .filter( x => this.darFormatoDeBusqueda(x.nombre).includes(this.darFormatoDeBusqueda(valor)))
  }

  protected darFormatoDeBusqueda(valor: string): string {
    return valor.toLowerCase().replace(/\s/g, '')
  }

  protected seleccionarElemento(elemento: ElementoSelectorVertical): void {
    this.textoABuscar = ''
    this.alCambiarElementoSeleccionado.emit(elemento)
  }

}
