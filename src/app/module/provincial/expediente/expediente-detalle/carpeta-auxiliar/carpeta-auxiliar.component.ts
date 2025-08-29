import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { DateMaskModule } from '@directives/date-mask.module';
import { urlConsultaCasoFiscal, urlConsultaCuaderno } from '@utils/utils';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'carpeta-auxiliar',
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
  templateUrl: './carpeta-auxiliar.component.html',
  styleUrls: ['./carpeta-auxiliar.component.scss'],
})
export class CarpetaAuxiliarComponent implements OnInit {
  protected opcionesMenu: MenuItem[] = [];

  constructor(
    public dialogService: DialogService,
    private readonly gestionCasoService: GestionCasoService
  ) {}

  ngOnInit() {
    
    const caso = this.gestionCasoService.casoActual
    let ruta = urlConsultaCasoFiscal( caso )

    if ( caso.idTipoCuaderno === 2 ) {
      ruta = urlConsultaCuaderno('incidental', caso )
    }
    else if ( caso.idTipoCuaderno === 4 ) {
      ruta = urlConsultaCuaderno('extremo', caso )
    }

    this.opcionesMenu = [
      {
        label: 'Carpeta principal',
        routerLink:`${ruta}/carpeta-auxiliar/carpeta-principal`,
      },
      {
        label: 'Cuadernos incidentales',
        routerLink:`${ruta}/carpeta-auxiliar/cuaderno-incidental`,
      },
      {
        label: 'Cuadernos de ejecución',
        routerLink:`${ruta}/carpeta-auxiliar/cuaderno-ejecucion`,
      },
      {
        label: 'Carpeta auxiliar',
        routerLink:`${ruta}/carpeta-auxiliar`,
        routerLinkActiveOptions: { exact: true },
      },
    ]
  }

}