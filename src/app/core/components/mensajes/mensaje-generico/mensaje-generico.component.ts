import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { CfeDialogTipoIcono } from 'dist/ngx-cfng-core-modal/dialog';
@Component({
  selector: 'mensaje-generico',
  standalone: true,
  imports: [
    CmpLibModule,
    NgClass
  ],
  templateUrl: './mensaje-generico.component.html',
  styleUrl: './mensaje-generico.component.scss'
})

export class MensajeGenericoComponent {

  titulo = input.required<string>()

  @Input() tipoAlerta:CfeDialogTipoIcono = 'warning';

  @Output() cerrado = new EventEmitter<void>();

  closable = input(false)

  constructor(protected iconUtil: IconUtil){   
  }

  cerrandoLabel(){
    this.cerrado.emit(); 
  }
}
