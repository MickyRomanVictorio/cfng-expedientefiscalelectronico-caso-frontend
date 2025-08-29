import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-asignacion',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './asignacion.component.html',
})
export class AsignacionComponent {

}
