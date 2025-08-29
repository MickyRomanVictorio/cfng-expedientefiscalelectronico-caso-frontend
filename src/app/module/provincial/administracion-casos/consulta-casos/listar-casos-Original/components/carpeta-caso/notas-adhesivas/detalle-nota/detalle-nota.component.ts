import { Component, CSP_NONCE, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { Nota } from '@core/interfaces/comunes/casosFiscales';
import { AgregarNotaAdhesivaComponent } from '../agregar-nota-adhesiva/agregar-nota-adhesiva.component';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';

@Component({
  selector: 'app-detalle-nota',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule
  ],
  providers: [
    DialogService,
  ],
  templateUrl: './detalle-nota.component.html',
  styleUrls: ['./detalle-nota.component.scss']
})
export class DetalleNotaComponent implements OnInit {

  protected notaCaso!: Nota;
  private ref!: DynamicDialogRef;

  constructor(
    private dialogRef: DynamicDialogRef,
    private dialogConfig: DynamicDialogConfig,
    public dialogService: DialogService,
    private casoService: Casos
  ) { }

  ngOnInit(): void {
    this.notaCaso = (this.dialogConfig.data.nota as Nota);
    this.casoService.onUpdatePostIt$.subscribe({
      next: (notaActualizada: Nota) => {
        this.notaCaso = notaActualizada;
        const contenedorModal = document.getElementById('actualizarNotaElement')!.closest('.p-dialog-content') as HTMLElement;
        contenedorModal.style.backgroundColor = notaActualizada.colorNota;
      }
    })

  }

  close() {
    this.dialogRef.close(this.notaCaso)
  }

  deleteNote($event: any, nota: Nota) {
    $event.preventDefault();
    this.casoService.deleteNote(nota.numeroCaso, nota.idNota).subscribe({
      next: (r) => {
        this.casoService.deletePostItEvent(nota);
        this.dialogRef.close();
      },
      error: (err) => {
      }
    })
  }

  actualizaNota($event: any, nota: Nota) {
    $event.preventDefault();
    this.ref = this.dialogService.open(AgregarNotaAdhesivaComponent, {
      showHeader: false,
      contentStyle: { overflow: 'auto' },
      data: { nota: this.notaCaso }
    })
  }
}
