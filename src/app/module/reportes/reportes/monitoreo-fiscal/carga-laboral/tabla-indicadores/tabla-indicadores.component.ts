import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-tabla-indicadores',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './tabla-indicadores.component.html',
  styleUrl: './tabla-indicadores.component.scss',
})
export class TablaIndicadoresComponent {}
