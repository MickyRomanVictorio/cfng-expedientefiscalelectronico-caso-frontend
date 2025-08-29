import { NgStyle, SlicePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Nota } from '@core/interfaces/comunes/casosFiscales';
import { Caso } from '@modules/superior/administracion-casos/consulta-casos-monitoreados/listar-casos/models/listar-casos.model';
import { IconAsset } from 'ngx-cfng-core-lib';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DetalleNotaComponent } from '../detalle-nota/detalle-nota.component';

@Component({
  selector: 'app-nota-adhesiva',
  standalone: true,
  templateUrl: './nota-adhesiva.component.html',
  imports: [
    NgStyle, SlicePipe
  ],
  providers: [
    ConfirmationService,
    DialogService,
  ],
  styles:`
    .sticky-note {
      top: 0;
      transition: top 0.2s ease;
    }
    .sticky-note:hover{
      top:-4px
    }
  `
})
export class NotaAdhesivaComponent {
  @Input()
  public caso!: Caso;

  constructor(
    public dialogService: DialogService,
    protected iconAsset: IconAsset
  ) {
  }

  protected eventoVerDetalleNota(event:Event, nota: Nota) {
    event.stopPropagation();
    this.dialogService.open(DetalleNotaComponent, {
      showHeader: false,
      width: '500px',
      contentStyle: { overflow: 'auto', padding:0, backgroundColor: nota.colorNota },
      data: { nota }
    });
  }

}
