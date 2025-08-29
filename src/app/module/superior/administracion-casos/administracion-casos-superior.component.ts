import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-administracion-casos-superior',
  templateUrl: './administracion-casos-superior.component.html',
  styleUrls: ['./administracion-casos-superior.component.scss'],
  imports: [
    RouterModule
  ]
})
export class AdministracionCasosSuperiorComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
