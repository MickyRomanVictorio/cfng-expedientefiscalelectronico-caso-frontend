import { Component, OnInit } from '@angular/core';
import { Nota } from '@core/interfaces/comunes/casosFiscales';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

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
  constructor(
    private readonly dialogRef: DynamicDialogRef,
    private readonly dialogConfig: DynamicDialogConfig,
    public readonly dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.notaCaso = (this.dialogConfig.data.nota as Nota);
  }

  protected eventoCerrar() {
    this.dialogRef.close(this.notaCaso);
  }

}
