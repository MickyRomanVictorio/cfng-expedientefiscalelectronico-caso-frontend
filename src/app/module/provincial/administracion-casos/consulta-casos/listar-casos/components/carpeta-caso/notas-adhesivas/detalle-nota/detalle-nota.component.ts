import { Component, ElementRef, OnInit, viewChild } from '@angular/core';
import { Nota } from '@core/interfaces/comunes/casosFiscales';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AgregarNotaAdhesivaComponent } from '../agregar-nota-adhesiva/agregar-nota-adhesiva.component';

@Component({
  selector: 'app-detalle-nota',
  standalone: true,
  imports: [
    ButtonModule
  ],
  providers: [
    DialogService,
  ],
  templateUrl: './detalle-nota.component.html',
  styleUrls: ['./detalle-nota.component.scss'],
})
export class DetalleNotaComponent implements OnInit {

  protected notaCaso!: Nota;
  private ref!: DynamicDialogRef;
  protected detalleRef = viewChild< ElementRef<HTMLDivElement>>('detalleRef');

  constructor(
    private readonly dialogRef: DynamicDialogRef,
    private readonly dialogConfig: DynamicDialogConfig,
    protected readonly dialogService: DialogService,
    private readonly casoService: Casos
  ) { }

  ngOnInit(): void {
    this.notaCaso = (this.dialogConfig.data.nota as Nota);
    //
    //Observable que identifica la actualizacion de la nota
    this.casoService.onUpdatePostIt$.subscribe({
      next: (notaActualizada: Nota) => {
        this.notaCaso = notaActualizada;
        (this.detalleRef()?.nativeElement.closest('.p-dialog-content') as HTMLDivElement).style.backgroundColor = notaActualizada.colorNota;
      }
    });
  }

  protected eventoCerrar() {
    this.dialogRef.close(this.notaCaso);
  }

  protected eventoEditar($event: any, nota: Nota){
    $event.preventDefault();
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
      data: { nota: this.notaCaso }
    });
  }

  protected eventoBorrar($event: any, nota: Nota){
    $event.preventDefault();
    this.casoService.deleteNote(nota.numeroCaso, nota.idNota).subscribe({
      next: (r) => {
        this.casoService.deletePostItEvent(nota);
        this.dialogRef.close();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

}
