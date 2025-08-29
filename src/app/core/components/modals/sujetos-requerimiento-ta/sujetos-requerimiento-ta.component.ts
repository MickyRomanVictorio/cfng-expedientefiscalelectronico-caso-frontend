import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CmpLibModule } from 'dist/cmp-lib';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { StringUtil } from 'dist/ngx-cfng-core-lib';
import { capitalizedFirstWord } from '@core/utils/string';
import { SujetosRequerimientoTA } from '@core/interfaces/provincial/tramites/comun/preparatoria/requerimiento-inconcurrencia-ta';

@Component({
  selector: 'app-sujetos-requerimiento-ta',
  standalone: true,
  imports: [CommonModule, ButtonModule, CmpLibModule, TableModule, RadioButtonModule,
    ReactiveFormsModule, FormsModule, CheckboxModule],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './sujetos-requerimiento-ta.component.html',
  styleUrl: './sujetos-requerimiento-ta.component.scss'
})
export class SujetosRequerimientoTaComponent {

  protected readonly dialogRef = inject(DynamicDialogRef);

  protected readonly stringUtil = inject(StringUtil);

  private readonly config = inject(DynamicDialogConfig);

  protected idActoTramiteCaso!: string;

  public numeroCaso!: string;

  protected listaSujetosProcesales: SujetosRequerimientoTA[] = [];

  constructor() {
    this.idActoTramiteCaso = this.config.data.idActoTramiteCaso;
    this.numeroCaso = this.config.data.numeroCaso;
    this.listaSujetosProcesales = this.config.data.listaSujetosProcesales;
  }

  protected mostrarDelitos(delito: any): string {
    if (delito && Object.keys(delito).length > 0) {
      return Object.values(delito)
        .map((item: any) => capitalizedFirstWord(item.toString()))
        .join(' / ');
    } else {
      return '-';
    }
  }
}
