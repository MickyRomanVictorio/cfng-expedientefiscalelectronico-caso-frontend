import { CommonModule } from '@angular/common';
import { Component, effect, input, Input, OnInit } from '@angular/core';
import { capitalizedFirstWord } from '@core/utils/string';
import { SubEtapa } from '@interfaces/provincial/administracion-casos/calificacion/subetapas.interface';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'ngx-cfng-core-lib';

@Component({
  selector: 'app-subetapas',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule
  ],
  templateUrl: './subetapas.component.html',
  styleUrl: './subetapas.component.scss',
})
export class SubetapasComponent implements OnInit {

  @Input() etapa: string | null = null
  @Input() nombreEtapa: string | null = ''
  subetapas = input.required<SubEtapa[]>()
  subetapasLista: SubEtapa[] = []

  public etapaActual: string = ''

  private readonly SUBETAPAS_CLASE_ANTERIOR: string = 'subetapa-anterior'
  private readonly SUBETAPAS_CLASE_ACTUAL: string = 'subetapa-actual'
  private readonly SUBETAPAS_CLASE_POSTERIOR: string = 'subetapa-posterior'

  constructor(
    protected iconUtil: IconUtil,
  ) {
    effect(() => {
      this.subetapasLista = this.adicionarClasesSubEtapas(this.subetapas())
    })
  }

  ngOnInit(): void {
    this.subetapasLista = this.adicionarClasesSubEtapas(this.subetapas())
    this.etapaActual = capitalizedFirstWord(this.nombreEtapa)
  }

  private adicionarClasesSubEtapas(subEtapas: SubEtapa[]): SubEtapa[] {
    const existeRegistroEtapaActual = subEtapas.some(x => x.codigo === this.etapa)
    let encontroEtapaActual = false
    return subEtapas.map(subEtapa => {
      if ( !existeRegistroEtapaActual ) {
        subEtapa.clase = this.SUBETAPAS_CLASE_POSTERIOR
      } else if (subEtapa.codigo === this.etapa) {
        subEtapa.clase = this.SUBETAPAS_CLASE_ACTUAL
        encontroEtapaActual = true
      } else {
        subEtapa.clase = encontroEtapaActual ? this.SUBETAPAS_CLASE_POSTERIOR : this.SUBETAPAS_CLASE_ANTERIOR
      }
      return subEtapa;
    })
  }
  
}