import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    DividerModule,
  ],
  selector: 'app-declarar-complejo',
  templateUrl: './declarar-complejo.component.html',
})
export class DeclararComplejoComponent {
  form: FormGroup;
  /*
  TODO V18
  unidadMedida: ResponseCatalogModel
  fiscalias: ResponseCatalogModel
  */
  unidadMedida: any[] = [];
  fiscalias: any[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      unidadMedida: [''],
      sede: [''],
    });
  }
  caso() {
    if (!this.config.data?.caso) return '';

    const caso = this.config.data?.caso.split('-');
    let titulo = this.config.data?.titulo;
    const casoHtml = `${titulo} - Caso: ${caso[0]}-<span class="text-secondary">${caso[1]}-${caso[2]}</span>-${caso[3]} `;
    return this.sanitizer.bypassSecurityTrustHtml(casoHtml);
  }

  close() {
    this.ref.close();
  }
}
