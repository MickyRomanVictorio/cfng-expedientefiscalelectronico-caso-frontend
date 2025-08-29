import {Component, Input, ViewEncapsulation} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'view-numero-caso',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  styles: [`
    .view-numero-cas__container {
      font-weight: 400;
    }
    .view-numero-caso__amarillo {
      font-weight: 400;
      color:#f19700;
    }
  `],
  template: `
    <ng-container *ngIf="numeroCaso">
      <div class="view-numero-cas__container" [innerHtml]="numeros"></div>
    </ng-container>
  `
})
export class NumeroCasoComponent {

  @Input() numeroCaso!: string;

  get numeros() {
      return this.numeroCaso.replace(
        /([0-9]+)-([0-9]+)-([0-9]+)-([0-9]+)/,
        "$1-<span class='view-numero-caso__amarillo'>$2-$3</span>-$4"
      );
  }

}
