import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FilterComponent } from '@components/generales/filter/filter.component';
import { PlazoDeclararComplejoComponent } from '@components/modals/acto-procesal/asignar-plazo/plazo-declarar-complejo/plazo-declarar-complejo.component';
import { DateMaskModule } from '@directives/date-mask.module';
import { icono } from 'dist/ngx-cfng-core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-listar-casos-por-recepcionar',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    DividerModule,
    CheckboxModule,
    MessagesModule,
    ToastModule,
    DialogModule,
    DropdownModule,
    MenuModule,
    DateMaskModule,
    DynamicDialogModule,
    FormsModule,
    ReactiveFormsModule,
    FilterComponent,
  ],
  templateUrl: './declarar-complejo.component.html',
  styleUrls: ['./declarar-complejo.scss'],
  providers: [MessageService, DialogService],
})
export class DeclararComplejoComponent implements OnInit {
  public refModal!: DynamicDialogRef;

  constructor(
    private spinner: NgxSpinnerService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.spinner.hide();
  }

  public icono(name: string): string {
    return icono(name);
  }

  public declararComplejo(caso: string): void {
    this.refModal = this.dialogService.open(PlazoDeclararComplejoComponent, {
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px' },
      data: {
        titulo: 'Asignar Plazo - Caso',
        caso: caso,
      },
    });
  }
}
