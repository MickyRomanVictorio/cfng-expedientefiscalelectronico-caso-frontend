import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cuadernos-extremos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './cuadernos-extremos.component.html',
  styleUrl: './cuadernos-extremos.component.scss'
})
export class CuadernosExtremosComponent {

}
