import { NgClass } from '@angular/common';
import { Component, inject, Input, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'dist/ngx-cfng-core-lib';

@Component({
  selector: 'mensaje-completar-informacion',
  standalone: true,
  imports: [
    CmpLibModule,
    NgClass
  ],
  templateUrl: './mensaje-completar-informacion.component.html',
  styleUrl: './mensaje-completar-informacion.component.scss'
})
export class MensajeCompletarInformacionComponent {

  personalizado = input(false)
  closable = input(false)
  titulo = input.required<string>()

  protected cerrarLabel: boolean = false
  protected tituloHtml: SafeHtml = ''

  protected iconUtil = inject(IconUtil)
  private sanitizer = inject(DomSanitizer)

  ngOnInit(): void {
    this.tituloHtml = this.sanitizer.bypassSecurityTrustHtml(this.titulo())
  }

}