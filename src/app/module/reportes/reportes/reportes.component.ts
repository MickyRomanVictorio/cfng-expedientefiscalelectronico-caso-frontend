import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-reportes',
  standalone: true,
    imports: [
        RouterOutlet
    ],
  templateUrl: './reportes.component.html',
})
export  class ReportesComponent implements OnInit{

  constructor() { }

  ngOnInit() {
  }

}
