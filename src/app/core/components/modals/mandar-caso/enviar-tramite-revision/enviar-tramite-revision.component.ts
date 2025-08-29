// mandar-caso.component.ts
import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-enviar-tramite-revision',
  templateUrl: './enviar-tramite-revision.component.html',
  standalone: true,
  imports: [DropdownModule, InputTextareaModule],
})
export class EnviarTramiteReviosionComponent implements OnInit {
   idCaso!: string;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
      this.idCaso = this.config.data.idCaso;
  }


  cerrarModalConDatos(): void {
    this.ref.close();
  }
}
