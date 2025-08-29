import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-cuaderno-prueba',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './cuaderno-prueba.component.html',
  styleUrl: './cuaderno-prueba.component.scss',
})
export class CuadernoPruebaComponent {}
