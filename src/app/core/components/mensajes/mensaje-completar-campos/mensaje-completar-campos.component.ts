import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'dist/ngx-cfng-core-lib';

@Component({
  selector: 'mensaje-completar-campos',
  standalone: true,
  imports: [
    CmpLibModule,
    NgClass
  ],
 templateUrl: './mensaje-completar-campos.component.html',
  styleUrl: './mensaje-completar-campos.component.scss'
})
export class MensajeCompletarCamposComponent {
  @Output() cerrado = new EventEmitter<void>();

  closable = input(false)
  titulo = input.required<string>()

  protected cerrarLabel: boolean = false

  constructor(protected iconUtil: IconUtil){}

  cerrandoLabel(){
    this.cerrarLabel = true;
    this.cerrado.emit(); 
  }

}