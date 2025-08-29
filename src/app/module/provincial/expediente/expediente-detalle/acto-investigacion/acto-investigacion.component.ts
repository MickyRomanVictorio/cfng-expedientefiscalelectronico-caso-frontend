import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';
import { DateMaskModule } from '@directives/date-mask.module';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { AccordionModule } from 'primeng/accordion';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { CheckboxModule } from 'primeng/checkbox';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-acto-investigacion',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TabsViewComponent,
    TabViewModule,
    CalendarModule,
    DateMaskModule,
    InputTextModule,
    PaginatorModule,
    NgxExtendedPdfViewerModule,
    ReactiveFormsModule,
    AccordionModule,
    CmpLibModule,
    ScrollPanelModule,
    CheckboxModule,
    SelectButtonModule,
    TabMenuModule,
  ],
  providers: [DialogService],
  templateUrl: './acto-investigacion.component.html',
  styleUrl: './acto-investigacion.component.scss'
})
export class ActoInvestigacionComponent {
  protected opcionesMenu: MenuItem[] = [];

}
