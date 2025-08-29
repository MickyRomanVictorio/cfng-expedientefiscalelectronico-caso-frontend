import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import * as Icons from 'ngx-mpfn-dev-icojs-regular';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule],
  selector: 'app-indice-iconos',
  templateUrl: './indice-iconos.component.html',
  styleUrls: ['./indice-iconos.component.scss'],
  providers: [DynamicDialogConfig, DynamicDialogRef],
})
export class IndiceIconosComponent implements OnInit {
  public filter: FormGroup;
  icons: any[] = [];
  allIcons: any[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder
  ) {
    this.filter = this.formBuilder.group({
      buscar: [''],
    });

    this.filter
      .get('buscar')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged() // Evita búsquedas duplicadas si el valor no cambió
      )
      .subscribe((value) => {
        // Realiza la búsqueda cuando el valor cambie
        this.buscarIconos();
      });
  }

  ngOnInit(): void {
    for (const iconName of Object.keys(Icons)) {
      const iconData = (Icons as any)[iconName];
      if (
        typeof iconData === 'object' &&
        iconData.hasOwnProperty('viewBox') &&
        iconData.hasOwnProperty('path')
      ) {
        this.icons.push({
          name: iconName,
          viewBox: iconData.viewBox,
          path: iconData.path,
        });
        this.allIcons.push({
          name: iconName,
          viewBox: iconData.viewBox,
          path: iconData.path,
        });
      }
    }
    console.log(this.icons);
  }

  close() {
    this.ref.close();
  }

  buscarIconos(): void {
    if (this.filter.valid) {
      const textoBusqueda = this.filter.get('buscar')?.value;
      if (!textoBusqueda) {
        this.icons = [...this.allIcons]; // Asigna todos los iconos nuevamente
      } else {
        // Realiza la búsqueda y filtra los íconos que coincidan con el término de búsqueda
        this.icons = this.allIcons.filter((icon) =>
          icon.name.toLowerCase().includes(textoBusqueda.toLowerCase())
        );
      }
    }
  }
}
