import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CasoFiscal, CasoFiscalResponse, ColoresPostIt, Nota, NotaRequest } from '@core/interfaces/comunes/casosFiscales';
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
  styleUrls: ['./agregar-nota-adhesiva.component.scss'],
  imports: [CommonModule, ButtonModule, ReactiveFormsModule]
})
export class AgregarNotaAdhesivaComponent {

  coloresPostIt = ColoresPostIt;

  form:FormGroup;

  wordCount = 0;
  maxLength = 300;
  notaCaso!: Nota;


  constructor(
    private dialogRef: DynamicDialogRef,
    private fb: FormBuilder,
    private casoService: Casos,
    private dialogConfig: DynamicDialogConfig) {

      this.form = this.fb.group({
        textoNota: ['', [Validators.required]],
        numeroCaso: ['', [Validators.required]],
        colorNota: ['#06A77D', [Validators.required]],
        idNota: []
      });

  }


  ngOnInit(): void {
    this.notaCaso = (this.dialogConfig.data.nota as Nota);
    const numeroCaso = (this.dialogConfig.data.caso as CasoFiscal)?.idCaso;
    this.form.get('numeroCaso')?.setValue(numeroCaso);

    if (this.notaCaso?.idNota) {
      console.log(this.notaCaso)
      this.form.get('textoNota')?.setValue(this.notaCaso.textoNota);
      if (Object.values(ColoresPostIt).map((color) => color.toString()).includes(this.notaCaso.colorNota)) {
        this.form.get('colorNota')?.setValue(this.notaCaso.colorNota);
      } else {
        this.form.get('colorNota')?.setValue(null);
      }
      this.form.get('idNota')?.setValue(this.notaCaso.idNota);
      this.form.get('numeroCaso')?.setValue(this.notaCaso.numeroCaso);
    }

    this.form.get('colorNota')?.setValue(this. coloresPostIt.GREEN);

    const  listaColores = document.querySelector('.color-options')!;
    const primerElemento: Element | null  =  listaColores.firstElementChild
    if(primerElemento instanceof HTMLElement){
      primerElemento.classList.add('active-default');
    }
  }

  close() {
    this.dialogRef.close()
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
    observador.subscribe(
      {
        next: (data) => {
          if (this.notaCaso?.idNota) {
            this.casoService.updatePostItEvent(data.data);
          }
          console.log("wwww", data.data);
          this.dialogRef.close(data.data);
        },
        error: (err) => { }
      }
    );


  }

  countWords() {
    const words = this.form.get('textoNota')!.value ?? '';
    this.wordCount = words.length;
    // Disable textarea input if the word limit is reached
    if (this.wordCount >= this.maxLength) {
      const currentValue = words;
      const newValue = currentValue.substring(0, this.maxLength);
      this.form.get('textoNota')!.setValue(newValue);
    }
  }

  activeColor(evt: Event, color: string) {
  //   ;
    evt.preventDefault();
    const targetElement = (evt.target as HTMLAnchorElement);
    const childElements = (evt.target as HTMLAnchorElement)!.parentElement!.children;
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

}
