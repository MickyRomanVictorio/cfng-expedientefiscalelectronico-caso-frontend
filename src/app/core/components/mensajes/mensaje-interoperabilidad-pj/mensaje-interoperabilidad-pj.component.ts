import { NgClass } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'dist/ngx-cfng-core-lib';

@Component({
  selector: 'mensaje-interoperabilidad-pj',
  standalone: true,
  imports: [
    CmpLibModule,
    NgClass
  ],
  templateUrl: './mensaje-interoperabilidad-pj.component.html',
  styleUrl: './mensaje-interoperabilidad-pj.component.scss'
})
export class MensajeInteroperabilidadPjComponent {

  tieneActa = input(false);
  descripcion = input(
    'El registro de este trámite se realizará al “recibir” el documento que ha sido ingresado por la MPE o Mesa a Despacho.'
  );
  protected cerrarLabel: boolean = false

  constructor(protected iconUtil: IconUtil){}

}
