import { Component, Input } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CasoFiscal, Nota } from '@core/interfaces/comunes/casosFiscales';
import { ConfirmationService } from 'primeng/api';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { CommonModule } from '@angular/common';
import { AgregarNotaAdhesivaComponent } from '../agregar-nota-adhesiva/agregar-nota-adhesiva.component';
import { DetalleNotaComponent } from '../detalle-nota/detalle-nota.component';
import { IconAsset } from 'ngx-cfng-core-lib';

@Component({
  selector: 'app-nota-adhesiva',
  standalone: true,
  templateUrl: './nota-adhesiva.component.html',
  imports: [
    CommonModule,
  ],
  providers: [
    ConfirmationService,
    DialogService,
  ]
})
export class NotaAdhesivaComponent {

  @Input() caso!: CasoFiscal;

  protected notes: Nota[] = [];
  private ref!: DynamicDialogRef;

  constructor(public dialogService: DialogService,
    private casoService: Casos,
    protected iconAsset: IconAsset,
  ) { }


  ngOnInit(): void {
    this.notes = (this.caso.notas ?? []).slice(0, 3);

    this.casoService.onDeletePostIt$.subscribe({
      next: (nota: Nota) => {
        this.notes = this.notes.filter(note => note.idNota !== nota.idNota);
      }
    })

    this.casoService.onUpdatePostIt$.subscribe({
      next: (notaActualizada: Nota) => {
        this.notes = this.notes.map((nota_) => {
          if (nota_.idNota == notaActualizada.idNota) {
            return notaActualizada;
          }
          return nota_
        });

      }
    })
  }

 

  openStikyInput($event: MouseEvent) {
    $event.preventDefault();
    this.ref = this.dialogService.open(AgregarNotaAdhesivaComponent, {
      showHeader: false,
      contentStyle: {  overflow: 'auto',},
      data: { caso: this.caso }
    })

    this.ref.onClose.subscribe((note: Nota) => {
      if (note) {
        this.notes.push(note);
        //this.messageService.add({ severity: 'info', summary: 'Product Selected', detail: product.name });
      }
    });

  }

  deleteNote($evt: MouseEvent, id: string) {
    $evt.preventDefault();
    this.casoService.deleteNote(this.caso.idCaso, id).subscribe({
      next: (r) => {
        this.notes = this.notes.filter((note) => { return note.idNota !== id });
      },
      error: (err) => {
      }
    })
  }

  detalleNota(nota: Nota) {
    const ref = this.dialogService.open(DetalleNotaComponent, {
      showHeader: false,
      width: '500px',
      contentStyle: { overflow: 'auto', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, backgroundColor: nota.colorNota },
      data: { nota }
    })

  }

}
