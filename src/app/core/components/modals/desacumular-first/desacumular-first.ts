import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'app-desacumular-first',
  standalone: true,
  imports: [InputTextModule, ReactiveFormsModule],
  templateUrl: './desacumular-first.html',
})
export class DesacumularFirstComponent {
  Acumulado: string; // variable a la que se le acumula {{ Caso }}
  Caso: string; // caso acumulado a {{ Acumulado }}
  motivo!: string;

  form: FormGroup;

  constructor(
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private config: DynamicDialogConfig
  ) {
    this.Caso = this.config.data.Caso;
    this.Acumulado = this.config.data.Acumulado;
    this.form = this.fb.group({
      motivo: ['', Validators.required], // Define un campo de formulario llamado 'motivo'
    });
  }
  colorizeCode(code: string, message: string = '') {
    code = `${code}-0`;
    const parts = code.split('-');
    if (parts.length > 3) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `${message}${parts[0]}-<span style="color:orange" >${parts[1]}-${parts[2]}</span>-${parts[3]}`
      );
    }
    return code;
  }
}
