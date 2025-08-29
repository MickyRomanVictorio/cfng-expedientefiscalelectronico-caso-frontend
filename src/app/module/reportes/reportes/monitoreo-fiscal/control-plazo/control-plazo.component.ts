import { TabViewModule } from 'primeng/tabview';
import { BandejaComponent } from './bandeja/bandeja.component';

import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateMaskModule } from '@directives/date-mask.module';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

import { MultiSelectModule } from 'primeng/multiselect';

import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

import { CommonModule } from '@angular/common';

import { obtenerIcono } from '@utils/icon';
import { MessageService } from 'primeng/api';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { DespachoComponent } from './despacho/despacho.component';
import { EtapasComponent } from './etapas/etapas.component';

@Component({
  selector: 'app-control-plazo',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    BandejaComponent,
    CalendarModule,
    CmpLibModule,
    DateMaskModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    MultiSelectModule,
    DespachoComponent,
    EtapasComponent,
  ],
  templateUrl: './control-plazo.component.html',
  styleUrls: ['./control-plazo.component.scss'],
  providers: [MessageService],
})
export default class ControlPlazoComponent {
  activeTab: number = 0;

  constructor(protected iconUtil: IconUtil) {}

  ngOnInit(): void {}

  protected icono(nombre: string): any {
    return obtenerIcono(nombre);
  }
}
