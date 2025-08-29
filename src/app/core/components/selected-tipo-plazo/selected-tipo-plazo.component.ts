import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TipoPlazo } from '@services/provincial/bandeja-derivaciones/recibidos/casos-recibidos';

@Component({
  selector: 'app-selected-plazo',
  styles: [
    `
      .opciones-plazos {
        display: flex;
        padding: 2rem 0;
        gap: 0.5rem;
        .plazo-item {
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          cursor: pointer;
          font-size: 14px;
          padding: 7px 14px;
          border-radius: 20px;
          background: white;
          border: 1.5px solid #adacac;
          display: flex;
          align-items: center;
          gap: 7px;
          font-weight: 500;
          color: #453f3f;
        }
        .plazo-item--activated {
          background-color: #e0e0e0;
          font-weight: 700;
          border: none;
        }
      }

      .circulo {
        display: block;
        width: 15px;
        height: 15px;
        background-color: #b9b9b9;
        border-radius: 15px;
      }

      .circulo--verde {
        background-color: #3cc75b;
      }
      .circulo--amarillo {
        background-color: #f19701;
      }
      .circulo--rojo {
        background-color: #c53c40;
      }
    `,
  ],
  standalone: true,
  template: ` <div class="opciones-plazos">
    <button
      class="plazo-item"
      [class.plazo-item--activated]="isSelectedTipo('TODOS')"
      (click)="activarTodos()"
    >
      Todos
    </button>
    <button
      class="plazo-item"
      [class.plazo-item--activated]="isSelectedTipo('DENTRO DEL PLAZO')"
      (click)="activar('DENTRO DEL PLAZO')"
    >
      <span class="circulo circulo--verde"></span>
      Dentro del Plazo
    </button>
    <button
      class="plazo-item"
      [class.plazo-item--activated]="isSelectedTipo('PLAZO POR VENCER')"
      (click)="activar('PLAZO POR VENCER')"
    >
      <span class="circulo circulo--amarillo"></span>
      Plazo por vencer
    </button>
    <button
      class="plazo-item"
      [class.plazo-item--activated]="isSelectedTipo('PLAZO VENCIDO')"
      (click)="activar('PLAZO VENCIDO')"
    >
      <span class="circulo circulo--rojo"></span>
      Plazo vencido
    </button>
  </div>`,
})
export class SelectedTipoPlazoComponent implements OnInit {
  @Output() chenge = new EventEmitter<Array<TipoPlazo>>();
  selectTipo: Array<TipoPlazo> = ['TODOS'];
  constructor() {}

  ngOnInit() {}

  activar(tipo: TipoPlazo) {
    const item = this.selectTipo.find((v) => v === tipo);
    const todos: Array<TipoPlazo> = [
      'DENTRO DEL PLAZO',
      'PLAZO POR VENCER',
      'PLAZO VENCIDO',
    ];

    if (!item) {
      this.selectTipo = [...this.selectTipo, tipo];
    } else {
      this.selectTipo = this.selectTipo.filter((e) => e !== tipo);
    }

    // si seleciona todos y ya tiene un tipo
    if (this.selectTipo.length > 1 && this.selectTipo.includes('TODOS')) {
      this.selectTipo = this.selectTipo.filter((e) => e !== 'TODOS');
    }

    // si seleciona los tres tipos.
    const existeTodos =
      this.selectTipo.filter((item) => todos.includes(item)).length === 3;
    if (existeTodos) this.selectTipo = ['TODOS'];

    this.chenge.emit(this.selectTipo);
  }

  activarTodos() {
    this.selectTipo = ['TODOS'];
    this.chenge.emit(this.selectTipo);
  }

  isSelectedTipo(tipo: TipoPlazo) {
    return Boolean(this.selectTipo.find((v) => v === tipo));
  }
}
