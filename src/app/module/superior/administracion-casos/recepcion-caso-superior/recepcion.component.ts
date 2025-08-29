import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
    selector: 'app-recepcion',
    standalone: true,
    templateUrl: './recepcion.component.html',
    styleUrls: ['./recepcion.component.scss'],
    imports: [CommonModule,
        RouterModule,]
})
export class RecepcionComponent {

}
