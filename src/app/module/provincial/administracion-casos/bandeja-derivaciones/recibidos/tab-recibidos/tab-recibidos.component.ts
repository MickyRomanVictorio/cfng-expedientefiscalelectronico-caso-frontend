import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import { Router } from '@angular/router';
import {TipoCasoRevisar} from "@services/provincial/bandeja-derivaciones/recibidos/casos-recibidos";

@Component({
  selector: 'app-tab-recibidos',
  standalone: true,
  styles: [`
    :host {
      display:flex;
      overflow: hidden;
      border-top-left-radius: 11px;
    }

    .item-tab {
      cursor:pointer;
      height:53px;
      width: 285px;
      margin-left: -79px;
      display:flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(60deg, transparent 20%, #DDDACA 10%, #DDDACA 84%, transparent 20%);
    }

    .item-tab--primero {
      margin-left: -50px;
      background: linear-gradient(60deg, #DDDACA 84%, transparent 20%);
    }

    .item-tab--activo {
      background: linear-gradient(60deg, transparent 20%, var(--mpfn-white) 10%, var(--mpfn-white) 84%, transparent 20%);
    }

    .item-tab--primero.item-tab--activo {
      background: linear-gradient(60deg, var(--mpfn-white) 84%, transparent 20%);
    }

    .cantidad {
      background-color: var(--mpfn-secondary);
      color: var(--mpfn-white);
      border-radius: 20px;
      width: 25px;
      height: 25px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

  `],
  template: `
    <div class="item-tab item-tab--primero" [class.item-tab--activo]="tipoSelected === 0" (click)="clickTap(0)">
      <span class="cantidad">{{ canDerivados }}</span>
      <span>Derivado de</span>
    </div>
    <div class="item-tab" [class.item-tab--activo]="tipoSelected === 1" (click)="clickTap(1)">
      <span class="cantidad">{{ canAcumulados }}</span>
      <span>Acumulado de</span>
    </div>
  `
})

export class TabRecibidosComponent {
  tipoSelected: TipoCasoRevisar  = 0;
  @Input() canDerivados = 0;
  @Input() canAcumulados = 0;
  @Output() cambiarTab = new EventEmitter<TipoCasoRevisar>();

  private readonly router = inject(Router)

  constructor() {
    this.tipoSelected = this.router.url.includes('acumulado-a') ? 1 : 0
  }

  clickTap(tipo: TipoCasoRevisar) {
    this.tipoSelected = tipo;
    this.cambiarTab.emit(this.tipoSelected);
  }
}
