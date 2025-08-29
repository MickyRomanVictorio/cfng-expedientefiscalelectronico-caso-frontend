import { NgStyle, SlicePipe } from '@angular/common';
import { Component, input, Input, OnInit } from '@angular/core';
import { IconAsset } from 'ngx-cfng-core-lib';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DetalleNotaComponent } from '../detalle-nota/detalle-nota.component';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { AgregarNotaAdhesivaComponent } from '../agregar-nota-adhesiva/agregar-nota-adhesiva.component';
import { CasoFiscal, Nota } from '@core/components/consulta-casos/models/listar-casos.model';

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
export class NotaAdhesivaComponent implements OnInit {

  @Input()
  public caso!: CasoFiscal;

  private ref!: DynamicDialogRef;

  public esSoloLectura = input<boolean>(false);

  constructor(
    public readonly dialogService: DialogService,
    protected readonly iconAsset: IconAsset,
    private readonly casoService: Casos
  ) {
  }

  ngOnInit(): void {
    //Observable para detectar si se ha eliminado una nota
    this.casoService.onDeletePostIt$.subscribe({
      next: (nota: Nota) => {
        this.caso.notas = this.caso.notas!.filter(note => note.idNota !== nota.idNota);
      }
    });
    //Observable para detectar si se ha actualizado una nota
    this.casoService.onUpdatePostIt$.subscribe({
      next: (notaActualizada: Nota) => {
        this.caso.notas = this.caso.notas!.map((nota_:Nota) => {
          if (nota_.idNota === notaActualizada.idNota) {
            return notaActualizada;
          }
          return nota_;
        });

      }
    });
  }

  protected eventoVerDetalleNota(event:Event, nota: Nota) {
    event.stopPropagation();
    this.dialogService.open(DetalleNotaComponent, {
      showHeader: false,
      width: '500px',
      contentStyle: { overflow: 'auto', padding:0, backgroundColor: nota.colorNota },
      data: {
        esSoloLectura: this.esSoloLectura(),
        nota:nota
      }
    });
  }

  protected eventoBorrar(event: Event, nota: Nota) {
    event.stopPropagation();
    this.casoService.deleteNote(this.caso.idCaso, nota.idNota).subscribe({
      next: (r) => {
        this.caso.notas = this.caso.notas!.filter((note) => { return note.idNota !== nota.idNota });
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  protected eventoNuevo(event: Event){
    event.stopPropagation();
    this.ref = this.dialogService.open(AgregarNotaAdhesivaComponent, {
      showHeader: false,
      style: {
        width: '400px',
        maxWidth: '100%'
      },
      contentStyle: {
        overflow: 'auto',
        padding:'0'
      },
      data: { caso: this.caso }
    });
    this.ref.onClose.subscribe((note: Nota) => {
      if (note) {
        this.caso.notas!.push(note);
      }
    });
  }

}
