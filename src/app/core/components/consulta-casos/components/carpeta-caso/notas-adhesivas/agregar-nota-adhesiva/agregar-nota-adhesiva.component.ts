import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CasoFiscal,
  CasoFiscalResponse,
  ColoresPostIt,
  Nota,
  NotaRequest,
} from '@core/interfaces/comunes/casosFiscales';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { ButtonModule } from 'primeng/button';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-agregar-nota-adhesiva',
  templateUrl: './agregar-nota-adhesiva.component.html',
  imports: [CommonModule, ButtonModule, ReactiveFormsModule],
})
export class AgregarNotaAdhesivaComponent {
  protected coloresPostIt = ColoresPostIt;
  protected form: FormGroup;
  protected wordCount: number = 0;
  protected maxLength: number = 300;
  protected notaCaso!: Nota;

  constructor(
    private readonly dialogRef: DynamicDialogRef,
    private readonly fb: FormBuilder,
    private readonly casoService: Casos,
    private readonly dialogConfig: DynamicDialogConfig
  ) {
    this.form = this.fb.group({
      textoNota: ['', [Validators.required]],
      numeroCaso: ['', [Validators.required]],
      colorNota: ['#06A77D', [Validators.required]],
      idNota: [],
    });
  }

  ngOnInit(): void {
    if (this.dialogConfig.data && this.dialogConfig.data.nota) {
      this.notaCaso = (this.dialogConfig.data.nota as Nota);
    } else {
      this.notaCaso = {} as Nota;
      console.log('Nota no está definida en los datos del diálogo.');
    }
    const numeroCaso = (this.dialogConfig.data.caso as CasoFiscal)?.idCaso;
    this.form.get('numeroCaso')?.setValue(numeroCaso);

    if (this.notaCaso && this.notaCaso.idNota) {

      this.form.get('textoNota')?.setValue(this.notaCaso.textoNota);

      if ( Object.values(ColoresPostIt).map((color) => color.toString()).includes(this.notaCaso.colorNota)) {
        this.form.get('colorNota')?.setValue(this.notaCaso.colorNota);
      } else {
        this.form.get('colorNota')?.setValue(null);
      }
      this.form.get('idNota')?.setValue(this.notaCaso.idNota);
      this.form.get('numeroCaso')?.setValue(this.notaCaso.numeroCaso);
    }else{
      this.form.get('colorNota')?.setValue(this.coloresPostIt.GREEN);
    }
    const listaColores = document.querySelector('.color-options');
    const primerElemento: Element | null = listaColores!.firstElementChild;

    if (primerElemento instanceof HTMLElement) {
      primerElemento.classList.add('active-default');
    }

   }

  close() {
    this.dialogRef.close();
  }

  save() {
    if (!this.form.valid) {
      return;
    }
    let observador: Observable<CasoFiscalResponse<Nota>> | null = null;

    if (this.notaCaso?.idNota) {
      observador = this.casoService.actualizarNota(this.form.value as NotaRequest);
    } else {
      observador = this.casoService.createNote(this.form.value as NotaRequest);
    }
    observador.subscribe({
      next: (data) => {
        if (this.notaCaso?.idNota) {
          this.casoService.updatePostItEvent(data.data);
        }
        this.dialogRef.close(data.data);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  countWords() {
    const words = this.form.get('textoNota')!.value ?? '';
    this.wordCount = words.length;

    if (this.wordCount >= this.maxLength) {
      const currentValue = words;
      const newValue = currentValue.substring(0, this.maxLength);
      this.form.get('textoNota')!.setValue(newValue);
    }
  }

  activeColor(evt: MouseEvent | PointerEvent, color: string) {
    evt.preventDefault();
    const targetElement = evt.target as HTMLAnchorElement;
    const childElements = (evt.target as HTMLAnchorElement).parentElement!
      .children;
    const childElementsArray = Array.from(childElements);
    this.form.get('colorNota')?.setValue(color);
    childElementsArray.forEach(function (childElement) {
      childElement.classList.remove('active-default');
      if (childElement === targetElement) {
        childElement.classList.add('active');
      } else {
        childElement.classList.remove('active');
      }
    });
  }

  get f() {
    return this.form.getRawValue();
  }
}
